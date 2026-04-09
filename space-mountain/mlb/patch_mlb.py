#!/usr/bin/env python3
"""
XLabs MLB Patcher — Replaces Momentum Heatmap with Pythagorean Luck Index
Run: python3 patch_mlb.py default.html
"""
import sys, os

if len(sys.argv) < 2:
    print("Usage: python3 patch_mlb.py <path-to-default.html>")
    sys.exit(1)

path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ═══ 1. CSS: Replace heat-* styles with luck-* styles ═══
OLD_CSS = """.heat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px}
@media(max-width:600px){.heat-grid{grid-template-columns:repeat(auto-fill,minmax(80px,1fr))}}
.heat-cell{padding:10px 6px;border-radius:8px;border:1px solid var(--bd);text-align:center;cursor:default;transition:border-color .2s,box-shadow .2s;position:relative;overflow:hidden}
.heat-cell:hover{border-color:rgba(191,13,61,.35);box-shadow:0 4px 16px rgba(191,13,61,.08)}
.heat-logo{width:22px;height:22px;object-fit:contain;margin:0 auto 3px}
.heat-abbr{font-family:var(--mono);font-size:10px;font-weight:700;color:var(--tx)}
.heat-streak{font-family:var(--mono);font-size:9px;font-weight:700;margin-top:1px}
.heat-dots{display:flex;gap:2px;justify-content:center;margin-top:3px}
.heat-dot{width:4px;height:4px;border-radius:50%}
.heat-bar{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 0 8px;transition:width .4s var(--ease)}"""

NEW_CSS = """.luck-row{display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid rgba(128,128,128,.06);transition:background .12s}
.luck-row:hover{background:rgba(128,128,128,.04)}
.luck-row:last-child{border:none}
.luck-rank{font-family:var(--mono);font-size:9px;font-weight:700;color:var(--mu);width:18px;text-align:center;flex-shrink:0}
.luck-logo{width:20px;height:20px;object-fit:contain;flex-shrink:0}
.luck-abbr{font-family:var(--mono);font-size:10px;font-weight:700;color:var(--tx);width:30px;flex-shrink:0}
.luck-bar-area{flex:1;display:flex;align-items:center;position:relative;height:22px}
.luck-center{position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--bd)}
.luck-bar{position:absolute;height:14px;border-radius:3px;top:4px;transition:width .6s var(--ease),left .6s var(--ease)}
.luck-val{font-family:var(--mono);font-size:9px;font-weight:700;width:36px;text-align:right;flex-shrink:0}
.luck-rec{font-family:var(--mono);font-size:8px;color:var(--mu);width:52px;text-align:right;flex-shrink:0}
.luck-xw{font-family:var(--mono);font-size:8px;color:var(--mu);width:44px;text-align:right;flex-shrink:0}"""

if OLD_CSS in content:
    content = content.replace(OLD_CSS, NEW_CSS)
    changes += 1
    print("  ✓ CSS: heat-* → luck-*")
else:
    print("  ✗ CSS: Could not find heat-* styles")

# ═══ 2. HTML: Replace Momentum Heatmap with Pythagorean Luck Index ═══
OLD_HTML = """  <!-- ═══ MOMENTUM HEATMAP (NEW) ═══ -->
  <div class="card reveal" style="margin-bottom:16px">
    <div class="card-hdr"><div class="card-title">Team Momentum Tracker</div><div class="card-badge">Last 10 GP</div></div>
    <div class="chart-sub">Color intensity = L10 win rate · Sorted by hottest streak · Dots = W/L sequence</div>
    <div class="heat-grid" id="heat-grid"><div class="ld">Loading…</div></div>
  </div>"""

NEW_HTML = """  <!-- ═══ PYTHAGOREAN LUCK INDEX ═══ -->
  <div class="card reveal" style="margin-bottom:16px">
    <div class="card-hdr"><div class="card-title">Pythagorean Luck Index</div><div class="card-badge">xWins vs Actual</div></div>
    <div class="chart-sub">Actual wins minus expected wins from run differential · <span style="color:#10b981">Green = overperforming</span> · <span style="color:#ef4444">Red = regression candidate</span></div>
    <div id="luck-index" style="max-height:460px;overflow-y:auto;scrollbar-width:thin"><div class="ld">Computing…</div></div>
  </div>"""

if OLD_HTML in content:
    content = content.replace(OLD_HTML, NEW_HTML)
    changes += 1
    print("  ✓ HTML: Momentum Heatmap → Luck Index")
else:
    print("  ✗ HTML: Could not find Momentum Heatmap section")

# ═══ 3. JS: Replace buildMomentumHeatmap function with buildLuckIndex ═══
OLD_JS = """// ============================================================
//  NEW: MOMENTUM HEATMAP
// ============================================================
function buildMomentumHeatmap(){
  const grid=el('heat-grid');if(!grid||!S.allStandings?.length)return;
  const teams=S.allStandings.map(t=>{const w=t.l10W||0,l=t.l10L||0,total=w+l||1;const winRate=w/total;const sNum=parseInt((t.streak||'').replace(/[WL]/,''))||0;const isW=(t.streak||'').startsWith('W');return{...t,winRate,sNum,isW,l10W:w,l10L:l};})
    .sort((a,b)=>{if(a.isW&&!b.isW)return-1;if(!a.isW&&b.isW)return 1;if(a.isW&&b.isW)return b.sNum-a.sNum;return a.sNum-b.sNum;});
  grid.innerHTML=teams.map(t=>{const hue=t.winRate>=.7?'152':t.winRate>=.5?'48':'0';const alpha=.08+t.winRate*.35;const bg=`hsla(${hue},65%,${S.dark?'40%':'50%'},${alpha})`;const sc=t.isW?'#10b981':'#ef4444';const bw=Math.min(100,t.sNum*12);
    let dots='';for(let i=0;i<10;i++)dots+=`<div class="heat-dot" style="background:${i<t.l10W?'#10b981':'#ef4444'}"></div>`;
    return `<div class="heat-cell" style="background:${bg}"><img class="heat-logo" src="${logoUrl(t.teamId)}" alt="${t.abbr}" onerror="this.style.visibility='hidden'"><div class="heat-abbr">${t.abbr}</div><div class="heat-streak" style="color:${sc}">${t.streak||'\\u2014'}</div><div class="heat-dots">${dots}</div><div class="heat-bar" style="background:${sc};width:${bw}%"></div></div>`;}).join('');
}"""

NEW_JS = """// ============================================================
//  PYTHAGOREAN LUCK INDEX
// ============================================================
function buildLuckIndex(){
  const wrap=el('luck-index');if(!wrap||!S.allStandings?.length)return;
  const STAB=20;
  const teams=S.allStandings.map(t=>{
    const gp=t.wins+t.losses||1;
    const rs=Math.max(t.runsScored||0,.1),ra=Math.max(t.runsAllowed||0,.1);
    const rsp=Math.pow(rs,1.83),rap=Math.pow(ra,1.83);
    const rawPyth=rsp/(rsp+rap);
    const w=gp/(gp+STAB);
    const pyth=rawPyth*w+.5*(1-w);
    const xWins=+(pyth*gp).toFixed(1);
    const luck=+(t.wins-xWins).toFixed(1);
    return{...t,xWins,luck,gp,pyth};
  }).sort((a,b)=>b.luck-a.luck);

  const maxLuck=Math.max(...teams.map(t=>Math.abs(t.luck)),1);

  wrap.innerHTML=teams.map((t,i)=>{
    const pos=t.luck>=0;
    const col=pos?'#10b981':'#ef4444';
    const barPct=(Math.abs(t.luck)/maxLuck*48).toFixed(1);
    const barLeft=pos?'50%':(50-parseFloat(barPct))+'%';
    const luckStr=(pos?'+':'')+t.luck.toFixed(1);
    return `<div class="luck-row">`
      +`<span class="luck-rank">${i+1}</span>`
      +`<img class="luck-logo" src="${logoUrl(t.teamId)}" alt="${t.abbr}" onerror="this.style.visibility='hidden'">`
      +`<span class="luck-abbr">${t.abbr}</span>`
      +`<div class="luck-bar-area"><div class="luck-center"></div>`
      +`<div class="luck-bar" style="left:${barLeft};width:${barPct}%;background:${col}"></div></div>`
      +`<span class="luck-val" style="color:${col}">${luckStr}</span>`
      +`<span class="luck-xw">xW ${Math.round(t.xWins)}</span>`
      +`<span class="luck-rec">${t.wins}-${t.losses}</span>`
      +`</div>`;
  }).join('');
}"""

if OLD_JS in content:
    content = content.replace(OLD_JS, NEW_JS)
    changes += 1
    print("  ✓ JS: buildMomentumHeatmap → buildLuckIndex")
else:
    # Try with the actual unicode dash character
    alt_js = OLD_JS.replace('\\u2014', '\u2014')
    if alt_js in content:
        content = content.replace(alt_js, NEW_JS)
        changes += 1
        print("  ✓ JS: buildMomentumHeatmap → buildLuckIndex (unicode variant)")
    else:
        print("  ✗ JS: Could not find buildMomentumHeatmap function")

# ═══ 4. Replace all remaining calls ═══
call_count = content.count('buildMomentumHeatmap()')
if call_count > 0:
    content = content.replace('buildMomentumHeatmap()', 'buildLuckIndex()')
    changes += 1
    print(f"  ✓ Calls: {call_count}x buildMomentumHeatmap() → buildLuckIndex()")
else:
    print("  ✗ No buildMomentumHeatmap() calls found")

# ═══ VERIFY ═══
print(f"\n  Applied {changes}/4 patches")
assert 'heat-grid' not in content, "heat-grid still present!"
assert 'buildMomentumHeatmap' not in content, "buildMomentumHeatmap still present!"
assert 'Momentum Tracker' not in content, "Momentum Tracker still present!"
assert 'buildLuckIndex' in content, "buildLuckIndex not found!"
assert 'luck-index' in content, "luck-index not found!"

# Write output
out_path = path.replace('.html', '-patched.html') if '--in-place' not in sys.argv else path
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"  ✓ Written to {out_path} ({len(content):,} chars)")
