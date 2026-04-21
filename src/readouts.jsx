// SIGILBORNE — Emergent readouts: roles, affinity star, Sigil chorus

const ROLE_ORDER = ["tank", "striker", "support", "caster"];

function roleCounts(unitList) {
  const c = { tank:0, striker:0, support:0, caster:0 };
  unitList.forEach(u => { if (u && CLASSES[u.cls]) c[CLASSES[u.cls].role]++; });
  return c;
}

function RoleCoverage({ unitList }) {
  const c = roleCounts(unitList);
  const total = Object.values(c).reduce((a,b)=>a+b,0);
  return (
    <div>
      <div className="label">Role Coverage</div>
      <div className="role-bar">
        {ROLE_ORDER.map(r => (
          <div key={r} className={`role-cell ${c[r] > 0 ? "have" : "gap"}`}>
            <div className="role-label">{r}</div>
            <div className="role-count">{c[r]}</div>
          </div>
        ))}
      </div>
      {total < 3 ? <div className="italic-note" style={{marginTop:6, fontSize:11}}>A small party. Deploy with care.</div> : null}
    </div>
  );
}

// Seven-point affinity star
function AffinityStar({ unitList }) {
  const counts = {};
  AFFINITIES.forEach(a => counts[a] = 0);
  unitList.forEach(u => { if (u && counts[u.affinity] !== undefined) counts[u.affinity]++; });
  const max = Math.max(1, ...Object.values(counts));
  const cx = 130, cy = 130, rMax = 90, rMin = 26;
  const pts = AFFINITIES.map((a, i) => {
    const ang = (-Math.PI / 2) + (i * (Math.PI * 2 / 7));
    const v = counts[a] / max;
    const r = rMin + v * (rMax - rMin);
    return {
      a,
      c: counts[a],
      x: cx + Math.cos(ang) * r,
      y: cy + Math.sin(ang) * r,
      lx: cx + Math.cos(ang) * (rMax + 16),
      ly: cy + Math.sin(ang) * (rMax + 16),
    };
  });
  const poly = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // background guide rings
  const rings = [0.33, 0.66, 1.0].map(k => {
    const r = rMin + k * (rMax - rMin);
    const axes = AFFINITIES.map((_, i) => {
      const ang = (-Math.PI / 2) + (i * (Math.PI * 2 / 7));
      return `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
    }).join(" ");
    return <polygon key={k} points={axes} fill="none" stroke="rgba(26,24,20,0.15)" strokeWidth="0.8"/>;
  });

  return (
    <div>
      <div className="label">Affinity Spread</div>
      <svg viewBox="0 0 260 260" className="affinity-star" aria-label="Affinity spread">
        {/* axes */}
        {AFFINITIES.map((_, i) => {
          const ang = (-Math.PI / 2) + (i * (Math.PI * 2 / 7));
          const x2 = cx + Math.cos(ang) * rMax;
          const y2 = cy + Math.sin(ang) * rMax;
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(26,24,20,0.18)" strokeWidth="0.7"/>;
        })}
        {rings}
        <polygon points={poly} fill="rgba(43,58,90,0.22)" stroke="#2b3a5a" strokeWidth="1.5" strokeLinejoin="round"/>
        {pts.map(p => (
          <g key={p.a}>
            <circle cx={p.x} cy={p.y} r={p.c > 0 ? 3.5 : 2} fill={p.c > 0 ? "#2b3a5a" : "rgba(26,24,20,0.35)"}/>
            <text x={p.lx} y={p.ly} fontFamily="var(--serif)" fontSize="10.5" fill="var(--ink-2)" textAnchor="middle" dominantBaseline="middle" style={{letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:600}}>
              {p.a}
            </text>
            {p.c > 0 && (
              <text x={p.lx} y={p.ly + 11} fontFamily="var(--mono)" fontSize="9" fill="var(--ink-fade)" textAnchor="middle">×{p.c}</text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function SigilChorus({ unitList }) {
  const sigils = unitList.filter(u => u).map(u => u.sigil);
  if (sigils.length === 0) {
    return <div className="chorus-dim"><span className="label">Sigil Chorus</span> <span className="italic-note">— no souls present —</span></div>;
  }
  const allSame = sigils.every(s => s === sigils[0]);
  if (allSame && sigils.length >= 3) {
    return (
      <div className="chorus-lit">
        <SigilGlyph sigil={sigils[0]} size={22}/>
        <div>
          <div className="label-lg" style={{color:"var(--gold-deep)"}}>Chorus of {sigils[0]}</div>
          <div className="italic-note" style={{fontSize:11, color:"var(--ink-2)"}}>"{SIGILS[sigils[0]].line}" — passive lit for all.</div>
        </div>
      </div>
    );
  }
  const spread = Array.from(new Set(sigils));
  return (
    <div className="chorus-dim">
      <div style={{display:"flex", gap:3}}>{spread.map(s => <SigilGlyph key={s} sigil={s} size={14}/>)}</div>
      <div>
        <div className="label">Sigil Chorus</div>
        <div className="italic-note" style={{fontSize:11}}>
          {spread.length} voices — unity passive unlit.
        </div>
      </div>
    </div>
  );
}

function Readouts({ units }) {
  return (
    <div>
      <RoleCoverage unitList={units}/>
      <div style={{height:10}}/>
      <AffinityStar unitList={units}/>
      <div style={{height:10}}/>
      <SigilChorus unitList={units}/>
    </div>
  );
}

Object.assign(window, { Readouts, roleCounts });
