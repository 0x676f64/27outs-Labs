# Savant Data Pipeline — How To Update

Run one script whenever you want fresh Statcast metrics:

  python update_savant.py

That's it. Downloads CSVs, converts to JSON, cleans up.
Takes about 10–15 seconds.

────────────────────────────────────────────────────────────────────
## REQUIREMENTS

  - Python 3.10 or higher (no third-party packages needed)
  - Internet connection when running

Check your Python version:
  python --version      (Windows Command Prompt)
  python3 --version     (Mac / Linux)

────────────────────────────────────────────────────────────────────
## HOW TO RUN (Windows)

Option 1 — Double-click update_savant.py in File Explorer
  (right-click → Open With → Python if it doesn't run automatically)
  The window will stay open so you can read the output.

Option 2 — Command Prompt or PowerShell
  cd path\to\space-mountain\mlb\scripts\lib
  python update_savant.py

────────────────────────────────────────────────────────────────────
## WHAT IT DOES EACH RUN

  1. Deletes any stale 2025 CSVs leftover from last run
  2. Downloads fresh 2025 batter + pitcher CSVs from Savant
  3. Skips 2024 download if files already exist (one-time only)
  4. Computes league-wide means for all 6 metrics
  5. Writes savant-current.json
  6. Deletes the 2025 CSVs (no longer needed)
  7. Leaves 2024 CSVs untouched (full-season finals, never change)

────────────────────────────────────────────────────────────────────
## FILE LAYOUT

  space-mountain\
  └── mlb\
      ├── default.html               ← reads scripts/lib/savant-current.json
      ├── game-box.html
      └── scripts\
          └── lib\
              ├── update_savant.py       ← RUN THIS daily
              ├── savant-current.json    ← auto-generated here
              ├── README.txt             ← this file
              ├── savant_batter_2024.csv    ← kept permanently
              └── savant_pitcher_2024.csv   ← kept permanently

────────────────────────────────────────────────────────────────────
## IF THE DOWNLOAD FAILS

Savant occasionally throttles requests. If you see a download error:
  - Wait 30 seconds and try again
  - Make sure you have an internet connection
  - savant-current.json is NOT overwritten on failure,
    so your last good data stays in place

You can also download the CSVs manually in your browser and place
them in the lib folder, then run:
  python update_savant.py --skip-download

────────────────────────────────────────────────────────────────────
## FALLBACK BEHAVIOR

If savant-current.json is missing, the dashboard automatically
falls back to hardcoded 2024 actuals — the UI never shows blanks.
The browser console will log a warning so you know.

────────────────────────────────────────────────────────────────────
## METRICS REFERENCE

  Metric       Column                  Source    Notes
  ──────────────────────────────────────────────────────────────
  Hard Hit%    hard_hit_percent        batter    Exit velo >= 95 mph
  Barrel%      barrel_batted_rate      batter    Optimal EV + launch angle
  xBA          xba                     batter    Expected batting average
  Sprint Spd   sprint_speed            batter    ft/s on fastest runs
  P/PA         pitch_count_pa          batter    Pitches per plate appearance
  Chase%       oz_swing_percent        pitcher   Batter O-swing %

  All values = unweighted league mean, min 250 PA / BF.