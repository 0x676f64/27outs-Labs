#!/usr/bin/env python3
"""
update_savant.py
─────────────────────────────────────────────────────────────────
All-in-one Savant updater for Windows (or any OS).
No third-party packages required — pure Python stdlib.

WHAT IT DOES
  1. Downloads fresh 2025 batter + pitcher CSVs from Baseball Savant
  2. Downloads 2024 CSVs only if they don't already exist (one-time)
  3. Computes league-wide means for all 6 Statcast metrics
  4. Writes savant-current.json ready for the dashboard to consume
  5. Deletes the 2025 CSVs (no longer needed after conversion)
  6. Leaves 2024 CSVs untouched (full-season finals, never change)

USAGE
  Double-click update_savant.py   (if Python is associated with .py)
      — OR —
  python update_savant.py         (from any terminal / Command Prompt)

LOCATION
  Lives at:  space-mountain/mlb/scripts/lib/update_savant.py
  Writes to: space-mountain/mlb/scripts/lib/savant-current.json
─────────────────────────────────────────────────────────────────
"""

import csv
import json
import sys
import os
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path
from time import sleep


# ══════════════════════════════════════════════════════════════
#  CONFIG — edit these if Savant ever changes their URL structure
# ══════════════════════════════════════════════════════════════

# ── Auto-detect current and prior season years ───────────────
# MLB season runs roughly April–October.
# Before Opening Day (≈ March 20) we're in spring training —
# the "current" season hasn't started so we treat last year as
# the live display year and the year before as prior for YoY.
def _detect_years() -> tuple[int, int]:
    from datetime import date
    today        = date.today()
    cal_year     = today.year
    opening_day  = date(cal_year, 3, 20)   # approximate — close enough
    if today < opening_day:
        # Spring training: show last full season as current
        return cal_year - 1, cal_year - 2
    else:
        # Season underway or just ended
        return cal_year, cal_year - 1

CURRENT_YEAR, PRIOR_YEAR = _detect_years()

# ── Dynamic PA threshold ──────────────────────────────────────
# Scales up as the season progresses so we always get real data.
# Early season (Mar/Apr) needs a low floor; mid/late season 250 is ideal.
def _season_min_pa(year: int) -> int:
    from datetime import date
    today        = date.today()
    opening_day  = date(year, 3, 20)
    days_in      = max(0, (today - opening_day).days)
    if days_in <  7:   return 1    # opening week
    if days_in < 21:   return 10   # first 3 weeks
    if days_in < 45:   return 25   # first month
    if days_in < 90:   return 75   # first half
    if days_in < 130:  return 150  # three quarters
    return 250                     # full season — Savant default

MIN_PA = _season_min_pa(CURRENT_YEAR)

BASE_URL     = "https://baseballsavant.mlb.com/leaderboard/custom"

# oz_swing_percent (Chase%) is available on the batter leaderboard —
# we pull it there to avoid a separate pitcher download failing.
# The pitcher leaderboard is kept as a backup/future use.
BAT_COLS = (
    "xba,exit_velocity_avg,barrel_batted_rate,"
    "hard_hit_percent,sprint_speed,oz_swing_percent,"
    "home_run,b_game"
)
PIT_COLS = (
    "oz_swing_percent,xba,exit_velocity_avg,"
    "barrel_batted_rate,hard_hit_percent"
)

# Script lives in scripts/lib/ — all paths relative to that
LIB_DIR  = Path(__file__).parent.resolve()
OUT_JSON = LIB_DIR / "savant-current.json"

FILES = {
    "bat_cur":  LIB_DIR / f"savant_batter_{CURRENT_YEAR}.csv",
    "bat_pri":  LIB_DIR / f"savant_batter_{PRIOR_YEAR}.csv",
    "pit_cur":  LIB_DIR / f"savant_pitcher_{CURRENT_YEAR}.csv",
    "pit_pri":  LIB_DIR / f"savant_pitcher_{PRIOR_YEAR}.csv",
}


# ══════════════════════════════════════════════════════════════
#  METRICS CONFIG
#  (key, csv_column, display_label, formatter, is_percentage)
# ══════════════════════════════════════════════════════════════

# All 6 metrics now come from the batter leaderboard.
# oz_swing_percent (Chase%) is the rate at which batters swing at
# pitches outside the zone — available on the batter leaderboard.
# HR/G is computed as a derived column (home_run / b_game per player)
# rather than a direct CSV column — handled specially in compute step.
BATTER_COLS = [
    ("hard_hit", "hard_hit_percent",   "Hard Hit%",  lambda v: f"{v:.1f}%", True),
    ("barrel",   "barrel_batted_rate", "Barrel%",    lambda v: f"{v:.1f}%", True),
    ("xba",      "xba",                "xBA",        lambda v: f"{v:.3f}".lstrip("0") or ".000", False),
    ("sprint",   "sprint_speed",       "Spd(ft/s)",  lambda v: f"{v:.1f}",  False),
    ("chase",    "oz_swing_percent",   "Chase%",     lambda v: f"{v:.1f}%", True),
    # hr_per_game handled as derived metric below — not a direct column
]

# Pitcher leaderboard kept for potential future metrics
PITCHER_COLS = []


# ══════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════

def sep(title=""):
    if title:
        print(f"\n── {title} {'─' * max(0, 50 - len(title))}")
    else:
        print("─" * 54)


def build_url(year: int, player_type: str, cols: str) -> str:
    return (
        f"{BASE_URL}"
        f"?year={year}"
        f"&type={player_type}"
        f"&filter="
        f"&sort=4&sortDir=desc"
        f"&min={MIN_PA}"
        f"&selections={cols}"
        f"&csv=true"
    )


def download_csv(url: str, dest: Path, label: str, retries: int = 3) -> bool:
    """
    Download a URL to dest. Returns True on success, False on failure.
    Retries up to `retries` times with a short delay between attempts.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept":   "text/csv,text/plain,*/*",
        "Referer":  "https://baseballsavant.mlb.com/",
    }

    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read()

            # Savant occasionally returns an HTML error page — detect it
            if raw[:1] == b"<":
                print(f"  [!] {label}: got HTML instead of CSV "
                      f"(attempt {attempt}/{retries})")
                if attempt < retries:
                    sleep(3)
                    continue
                return False

            dest.write_bytes(raw)
            row_count = len(raw.splitlines()) - 1  # subtract header
            print(f"  [✓] {label} — {row_count} players")
            return True

        except urllib.error.HTTPError as e:
            print(f"  [!] {label}: HTTP {e.code} (attempt {attempt}/{retries})")
        except urllib.error.URLError as e:
            print(f"  [!] {label}: {e.reason} (attempt {attempt}/{retries})")
        except Exception as e:
            print(f"  [!] {label}: {e} (attempt {attempt}/{retries})")

        if attempt < retries:
            sleep(3)

    return False


def load_csv(path: Path) -> list:
    if not path.exists():
        return []
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    return rows


def league_mean(rows: list, col: str) -> float | None:
    vals = [
        float(r[col]) for r in rows
        if r.get(col, "") not in ("", "null", "NULL", "N/A", "-")
        and _is_float(r.get(col, ""))
    ]
    return sum(vals) / len(vals) if vals else None


def _is_float(s: str) -> bool:
    try:
        float(s)
        return True
    except ValueError:
        return False


def fmt_delta(cur: float | None, pri: float | None, is_pct: bool) -> str:
    if cur is None or pri is None:
        return "n/a"
    d    = cur - pri
    sign = "+" if d >= 0 else ""
    if is_pct:
        return f"{sign}{d:.1f}%"
    dp = 3 if abs(d) < 0.1 and d != 0 else 2
    return f"{sign}{d:.{dp}f}"


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════

def main():
    print()
    print("━" * 54)
    print(f"  Savant Updater  |  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("━" * 54)

    # ── Step 1: Download current-year CSVs (always refresh) ──
    sep(f"Downloading {CURRENT_YEAR} CSVs")

    # Remove any stale files from last run first
    for key in ("bat_cur", "pit_cur"):
        if FILES[key].exists():
            FILES[key].unlink()
            print(f"  [~] Removed stale {FILES[key].name}")

    bat_cur_ok = download_csv(
        build_url(CURRENT_YEAR, "batter",  BAT_COLS),
        FILES["bat_cur"],
        f"Batters {CURRENT_YEAR}",
    )
    # Pitcher CSV only downloaded if PITCHER_COLS is non-empty
    if PITCHER_COLS:
        pit_cur_ok = download_csv(
            build_url(CURRENT_YEAR, "pitcher", PIT_COLS),
            FILES["pit_cur"],
            f"Pitchers {CURRENT_YEAR}",
        )
    else:
        pit_cur_ok = True
        print(f"  [~] Pitcher CSV skipped (all metrics from batter leaderboard)")

    if not bat_cur_ok or not pit_cur_ok:
        print("\n  [✗] One or more downloads failed.")
        print("      Check your internet connection and try again.")
        print("      savant-current.json was NOT updated.\n")
        _pause_if_double_clicked()
        sys.exit(1)

    # Check row counts immediately after download
    bat_cur_count = sum(1 for _ in open(FILES["bat_cur"])) - 1  # subtract header
    pit_cur_count = sum(1 for _ in open(FILES["pit_cur"])) - 1 if FILES["pit_cur"].exists() else 0
    print(f"  [~] {CURRENT_YEAR} qualifying batters  (min {MIN_PA} PA): {bat_cur_count}")
    if PITCHER_COLS:
        print(f"  [~] {CURRENT_YEAR} qualifying pitchers (min {MIN_PA} BF): {pit_cur_count}")
    if bat_cur_count == 0:
        print(f"  [!] Zero qualifying {CURRENT_YEAR} batters — season likely hasn't")
        print(f"      started yet, or min PA ({MIN_PA}) is too high for this point")
        print(f"      in the season. Will display {PRIOR_YEAR} data as baseline.")

    # ── Step 2: Download prior-year CSVs only if missing ─────
    sep(f"Checking {PRIOR_YEAR} CSVs")

    if FILES["bat_pri"].exists() and FILES["pit_pri"].exists():
        print(f"  [✓] {PRIOR_YEAR} files already present — skipping")
        print(f"      (delete them to force a re-download)")
    else:
        print(f"  [!] {PRIOR_YEAR} files not found — downloading (one-time only)")
        if not FILES["bat_pri"].exists():
            download_csv(
                build_url(PRIOR_YEAR, "batter",  BAT_COLS),
                FILES["bat_pri"],
                f"Batters {PRIOR_YEAR}",
            )
        if PITCHER_COLS and not FILES["pit_pri"].exists():
            download_csv(
                build_url(PRIOR_YEAR, "pitcher", PIT_COLS),
                FILES["pit_pri"],
                f"Pitchers {PRIOR_YEAR}",
            )

    # ── Step 3: Load CSVs ────────────────────────────────────
    sep("Computing league means")

    bat_cur_rows = load_csv(FILES["bat_cur"])
    bat_pri_rows = load_csv(FILES["bat_pri"])
    pit_cur_rows = load_csv(FILES["pit_cur"])
    pit_pri_rows = load_csv(FILES["pit_pri"])

    # ── Early-season guard ────────────────────────────────────
    # If the current year returns no qualifying rows (season hasn't
    # started, or MIN_PA still too high), use prior-year rows as
    # the "current" values and flag them clearly.
    using_prior_as_current = False
    if len(bat_cur_rows) == 0 and len(bat_pri_rows) > 0:
        print(f"  [!] No {CURRENT_YEAR} batter data yet "
              f"(min PA={MIN_PA}) — displaying {PRIOR_YEAR} as baseline")
        bat_cur_rows = bat_pri_rows
        using_prior_as_current = True
    if len(pit_cur_rows) == 0 and len(pit_pri_rows) > 0:
        print(f"  [!] No {CURRENT_YEAR} pitcher data yet "
              f"(min PA={MIN_PA}) — displaying {PRIOR_YEAR} as baseline")
        pit_cur_rows = pit_pri_rows
        using_prior_as_current = True

    if using_prior_as_current:
        print(f"  [~] YoY deltas will show n/a until {CURRENT_YEAR} "
              f"season data is available")

    # ── Step 4: Compute metrics ──────────────────────────────
    metrics = {}

    # When using prior-year as stand-in, pass None for pri so
    # deltas show "n/a" rather than a meaningless 0.0 diff.
    _pri_bat = None if using_prior_as_current else bat_pri_rows
    _pri_pit = None if using_prior_as_current else pit_pri_rows

    for key, col, label, fmt, is_pct in BATTER_COLS:
        cur = league_mean(bat_cur_rows, col)
        pri = league_mean(_pri_bat, col) if _pri_bat else None
        metrics[key] = {
            "label":   label,
            "val":     fmt(cur) if cur is not None else "--",
            "delta":   fmt_delta(cur, pri, is_pct),
            "current": round(cur, 4) if cur is not None else None,
            "prior":   round(pri, 4) if pri is not None else None,
            "source":  "Baseball Savant",
        }
        val_str   = fmt(cur) if cur is not None else "MISSING"
        delta_str = fmt_delta(cur, pri, is_pct)
        print(f"  {label:<14}  {val_str:>8}   YoY: {delta_str}")

    for key, col, label, fmt, is_pct in PITCHER_COLS:
        cur = league_mean(pit_cur_rows, col)
        pri = league_mean(_pri_pit, col) if _pri_pit else None
        metrics[key] = {
            "label":   label,
            "val":     fmt(cur) if cur is not None else "--",
            "delta":   fmt_delta(cur, pri, is_pct),
            "current": round(cur, 4) if cur is not None else None,
            "prior":   round(pri, 4) if pri is not None else None,
            "source":  "Baseball Savant",
        }
        val_str   = fmt(cur) if cur is not None else "MISSING"
        delta_str = fmt_delta(cur, pri, is_pct)
        print(f"  {label:<14}  {val_str:>8}   YoY: {delta_str}")

    # ── Derived metric: HR per Game ───────────────────────────
    # Computed per-player first (HR / games), then averaged across
    # the league. This is more meaningful than avg(HR) / avg(games)
    # because it weights each player's rate equally.
    def hrpg_mean(rows):
        vals = []
        for r in rows:
            hr = r.get("home_run", "")
            g  = r.get("b_game", "")
            if hr in ("", "null", "-") or g in ("", "null", "-"):
                continue
            try:
                hr_f, g_f = float(hr), float(g)
                if g_f > 0:
                    vals.append(hr_f / g_f)
            except ValueError:
                continue
        return sum(vals) / len(vals) if vals else None

    hrpg_cur = hrpg_mean(bat_cur_rows)
    hrpg_pri = hrpg_mean(_pri_bat) if _pri_bat else None
    metrics["hr_per_game"] = {
        "label":   "HR/G",
        "val":     f"{hrpg_cur:.3f}" if hrpg_cur is not None else "--",
        "delta":   fmt_delta(hrpg_cur, hrpg_pri, False),
        "current": round(hrpg_cur, 4) if hrpg_cur is not None else None,
        "prior":   round(hrpg_pri, 4) if hrpg_pri is not None else None,
        "source":  "Baseball Savant",
    }
    val_str   = f"{hrpg_cur:.3f}" if hrpg_cur is not None else "MISSING"
    delta_str = fmt_delta(hrpg_cur, hrpg_pri, False)
    print(f"  {'HR/G':<14}  {val_str:>8}   YoY: {delta_str}")

    # ── Step 5: Write JSON ───────────────────────────────────
    output = {
        "generated":    datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "current_year": CURRENT_YEAR,
        "prior_year":   PRIOR_YEAR if (bat_pri_rows or pit_pri_rows) else None,
        "season_status": "pre-season" if using_prior_as_current else "in-season",
        "min_pa_used":  MIN_PA,
        "player_counts": {
            "batter_current":  len(bat_cur_rows),
            "batter_prior":    len(bat_pri_rows),
            "pitcher_current": len(pit_cur_rows),
            "pitcher_prior":   len(pit_pri_rows),
        },
        "metrics": metrics,
    }

    # ── Step 6: Delete current-year CSVs ────────────────────
    sep("Cleaning up")

    for key in ("bat_cur", "pit_cur"):
        if FILES[key].exists():
            FILES[key].unlink()
            print(f"  [~] Deleted {FILES[key].name} (empty, no qualifying players yet)")

    print(f"  [~] Kept savant_batter_{PRIOR_YEAR}.csv   (permanent)")
    print(f"  [~] Kept savant_pitcher_{PRIOR_YEAR}.csv  (permanent)")

    # ── Step 7: Write JSON (or skip if nothing new) ──────────
    sep("Writing JSON")

    if using_prior_as_current and OUT_JSON.exists():
        # JSON already exists from a previous run with the same 2024 baseline.
        # No point overwriting it with identical data — skip and tell the user.
        print(f"  [~] savant-current.json already contains {PRIOR_YEAR} baseline data.")
        print(f"      No {CURRENT_YEAR} stats available yet — file was NOT overwritten.")
        print(f"      Re-run once the {CURRENT_YEAR} season starts to get live data.")
    else:
        OUT_JSON.write_text(json.dumps(output, indent=2), encoding="utf-8")
        if using_prior_as_current:
            print(f"  [✓] savant-current.json written ({PRIOR_YEAR} baseline — "
                  f"no {CURRENT_YEAR} data yet)")
        else:
            print(f"  [✓] savant-current.json written ({CURRENT_YEAR} live data)")
        print(f"      {OUT_JSON}")

    # ── Done ─────────────────────────────────────────────────
    print()
    print("━" * 54)
    if using_prior_as_current:
        print(f"  [~] Showing {PRIOR_YEAR} full-season baseline")
        print(f"      YoY deltas available once {CURRENT_YEAR} season begins")
    else:
        print(f"  [✓] {len(metrics)} metrics updated from {CURRENT_YEAR} live data")
        print(f"      {len(bat_cur_rows)} batters · {len(pit_cur_rows)} pitchers")
    print("━" * 54)
    print()

    _pause_if_double_clicked()


def _pause_if_double_clicked():
    """
    When double-clicking a .py file on Windows the console window
    closes immediately on exit. This keeps it open so you can read
    the output before it disappears.
    """
    # Only pause if we're running in a real console that would close
    if sys.stdout.isatty() and os.name == "nt":
        input("  Press Enter to close...")


if __name__ == "__main__":
    main()