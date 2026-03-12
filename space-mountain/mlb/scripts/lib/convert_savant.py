#!/usr/bin/env python3
"""
convert_savant.py
─────────────────────────────────────────────────────────────────
Converts Baseball Savant CSV leaderboard exports into a single
savant-current.json file that default.html can fetch directly.

USAGE
  python3 convert_savant.py \
    --current  savant_batter_2025.csv \
    --prior    savant_batter_2024.csv \
    --pitcher-current  savant_pitcher_2025.csv \
    --pitcher-prior    savant_pitcher_2024.csv \
    --out      savant-current.json

  Prior-year files are optional. If omitted, YoY deltas will be
  marked as "n/a" in the output.

WHAT IT COMPUTES
  League-wide means (all qualifying players, min 50 PA / BF) for:
    Hard Hit%     hard_hit_percent        (batter CSV)
    Barrel%       barrel_batted_rate      (batter CSV)
    xBA           xba                     (batter CSV)
    Sprint Speed  sprint_speed            (batter CSV)
    P/PA          pitch_count_pa          (batter CSV)
    Chase%        oz_swing_percent        (pitcher CSV — batter O-Swing against)

  YoY delta = current_mean - prior_mean, formatted with sign.

OUTPUT SHAPE
  {
    "generated":    "2025-03-12T14:00:00",
    "current_year": 2025,
    "prior_year":   2024,
    "metrics": {
      "hard_hit": {
        "label":   "Hard Hit%",
        "val":     "38.7%",
        "delta":   "+0.3%",
        "current": 38.7,
        "prior":   38.4,
        "source":  "Baseball Savant"
      },
      ...
    }
  }
"""

import csv
import json
import sys
import argparse
from datetime import datetime
from pathlib import Path


# ── Column config ─────────────────────────────────────────────
# Each entry: (metric_key, csv_column, label, format_fn, is_pct)
BATTER_COLS = [
    ("hard_hit",  "hard_hit_percent",   "Hard Hit%",   lambda v: f"{v:.1f}%", True),
    ("barrel",    "barrel_batted_rate", "Barrel%",     lambda v: f"{v:.1f}%", True),
    ("xba",       "xba",                "xBA",         lambda v: f"{v:.3f}".lstrip("0") or ".000", False),
    ("sprint",    "sprint_speed",       "Spd(ft/s)",   lambda v: f"{v:.1f}",  False),
    ("ppa",       "pitch_count_pa",     "P/PA",        lambda v: f"{v:.2f}",  False),
]

PITCHER_COLS = [
    ("chase",     "oz_swing_percent",   "Chase%",      lambda v: f"{v:.1f}%", True),
]


# ── CSV helpers ───────────────────────────────────────────────
def load_csv(path: str) -> list[dict]:
    """Read a CSV file and return a list of row dicts."""
    p = Path(path)
    if not p.exists():
        print(f"  [!] File not found: {path}", file=sys.stderr)
        return []
    rows = []
    with open(p, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Strip whitespace from all keys and values
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    print(f"  [✓] Loaded {len(rows):,} rows from {p.name}")
    return rows


def league_mean(rows: list[dict], col: str) -> float | None:
    """Compute the unweighted mean of a numeric column across all rows."""
    vals = []
    for row in rows:
        raw = row.get(col, "")
        if raw in ("", "null", "NULL", "N/A", "-"):
            continue
        try:
            vals.append(float(raw))
        except ValueError:
            continue
    if not vals:
        print(f"  [!] No valid values found for column: {col}", file=sys.stderr)
        return None
    return sum(vals) / len(vals)


def fmt_delta(current: float | None, prior: float | None, is_pct: bool) -> str:
    """Return a signed delta string, e.g. '+0.3%' or '-0.12'."""
    if current is None or prior is None:
        return "n/a"
    delta = current - prior
    sign  = "+" if delta >= 0 else ""
    if is_pct:
        return f"{sign}{delta:.1f}%"
    else:
        # For xBA use 3dp, everything else 2dp
        dp = 3 if abs(delta) < 0.1 and abs(delta) > 0 else 2
        return f"{sign}{delta:.{dp}f}"


# ── Core builder ──────────────────────────────────────────────
def build_metrics(
    batter_cur:  list[dict],
    batter_pri:  list[dict],
    pitcher_cur: list[dict],
    pitcher_pri: list[dict],
) -> dict:
    metrics = {}

    # Detect year from data if present, else infer from row count presence
    def sniff_year(rows):
        if not rows:
            return None
        return rows[0].get("year") or rows[0].get("Season") or None

    for key, col, label, fmt, is_pct in BATTER_COLS:
        cur = league_mean(batter_cur,  col)
        pri = league_mean(batter_pri,  col)
        metrics[key] = {
            "label":   label,
            "val":     fmt(cur)  if cur is not None else "--",
            "delta":   fmt_delta(cur, pri, is_pct),
            "current": round(cur, 4) if cur is not None else None,
            "prior":   round(pri, 4) if pri is not None else None,
            "source":  "Baseball Savant",
        }
        status = f"{fmt(cur)}" if cur is not None else "missing"
        delta  = fmt_delta(cur, pri, is_pct)
        print(f"  {label:<14} {status:>10}   YoY: {delta}")

    for key, col, label, fmt, is_pct in PITCHER_COLS:
        cur = league_mean(pitcher_cur, col)
        pri = league_mean(pitcher_pri, col)
        metrics[key] = {
            "label":   label,
            "val":     fmt(cur)  if cur is not None else "--",
            "delta":   fmt_delta(cur, pri, is_pct),
            "current": round(cur, 4) if cur is not None else None,
            "prior":   round(pri, 4) if pri is not None else None,
            "source":  "Baseball Savant",
        }
        status = f"{fmt(cur)}" if cur is not None else "missing"
        delta  = fmt_delta(cur, pri, is_pct)
        print(f"  {label:<14} {status:>10}   YoY: {delta}")

    return metrics


# ── Main ──────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Convert Savant CSVs to dashboard JSON")
    ap.add_argument("--current",          required=True,  help="Batter CSV for current year")
    ap.add_argument("--prior",            default=None,   help="Batter CSV for prior year (optional)")
    ap.add_argument("--pitcher-current",  required=True,  help="Pitcher CSV for current year")
    ap.add_argument("--pitcher-prior",    default=None,   help="Pitcher CSV for prior year (optional)")
    ap.add_argument("--out",              default="savant-current.json", help="Output JSON path")
    ap.add_argument("--current-year",     type=int, default=datetime.now().year,  help="Current season year")
    ap.add_argument("--prior-year",       type=int, default=datetime.now().year-1, help="Prior season year")
    args = ap.parse_args()

    print(f"\n── Loading CSVs ──────────────────────────────────────────")
    batter_cur  = load_csv(args.current)
    batter_pri  = load_csv(args.prior)          if args.prior           else []
    pitcher_cur = load_csv(args.pitcher_current)
    pitcher_pri = load_csv(args.pitcher_prior)  if args.pitcher_prior   else []

    if not batter_cur and not pitcher_cur:
        print("\n[✗] No data loaded. Check file paths and try again.")
        sys.exit(1)

    print(f"\n── Computing league means ────────────────────────────────")
    metrics = build_metrics(batter_cur, batter_pri, pitcher_cur, pitcher_pri)

    output = {
        "generated":    datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "current_year": args.current_year,
        "prior_year":   args.prior_year if (batter_pri or pitcher_pri) else None,
        "player_counts": {
            "batter_current":  len(batter_cur),
            "batter_prior":    len(batter_pri),
            "pitcher_current": len(pitcher_cur),
            "pitcher_prior":   len(pitcher_pri),
        },
        "metrics": metrics,
    }

    out_path = Path(args.out)
    out_path.write_text(json.dumps(output, indent=2))
    print(f"\n── Output ────────────────────────────────────────────────")
    print(f"  [✓] Written to: {out_path.resolve()}")
    print(f"  [✓] {len(metrics)} metrics, {len(batter_cur)} batters, {len(pitcher_cur)} pitchers\n")


if __name__ == "__main__":
    main()