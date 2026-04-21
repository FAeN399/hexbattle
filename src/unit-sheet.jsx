// SIGILBORNE — Unit drill-down sheet

function StatRow({ label, val, max=30 }) {
  const pct = Math.min(1, val / max);
  return (
    <div className="stat-row">
      <div className="stat-name">{label}</div>
      <div className="stat-bar"><span style={{width:`${pct*100}%`}}/></div>
      <div className="stat-val">{val}</div>
    </div>
  );
}

function UnitSheet({ unit, onClose, onMakeLeader, isLeader, onUnassign, assigned, onOpenInForge }) {
  if (!unit) return null;
  const cls = CLASSES[unit.cls] || {};
  return (
    <div className="unit-sheet">
      <header className="sheet-head">
        <Heraldry seed={unit.id} sigil={unit.sigil} size={58}/>
        <div style={{flex:1, minWidth:0}}>
          <div className="sheet-title">{unit.name}</div>
          <div className="sheet-sub">{unit.cls} · Lv {unit.lvl} · <span style={{color:"var(--ink-soft)"}}>{unit.origin}</span></div>
        </div>
        {onClose && <button className="btn ghost sm" onClick={onClose}>Close</button>}
      </header>

      <div className="kv-grid">
        <div><span className="k">Sigil</span><span className="v">{unit.sigil}</span></div>
        <div><span className="k">Affinity</span><span className="v">{unit.affinity}</span></div>
        <div><span className="k">Nature</span><span className="v">{unit.nature}</span></div>
        <div><span className="k">Alignment</span><span className="v">{unit.align}</span></div>
        <div><span className="k">HP</span><span className="v"><span className="num">{unit.hp}/{unit.hpmax}</span></span></div>
        <div><span className="k">Move</span><span className="v"><span className="num">{unit.move}</span></span></div>
      </div>

      <div className="banner-rule"><span className="title">Oath · Wound</span></div>
      <div style={{fontSize:12.5, lineHeight:1.5, color:"var(--ink-2)"}}>
        <div><span className="label" style={{color:"var(--blood)"}}>Oath</span> <span className="italic-note" style={{color:"var(--ink-2)"}}>{unit.oath}.</span></div>
        <div style={{marginTop:4}}><span className="label" style={{color:"var(--ink-fade)"}}>Wound</span> <span className="italic-note" style={{color:"var(--ink-2)"}}>{unit.wound}.</span></div>
      </div>

      <div className="banner-rule"><span className="title">The Substrate</span></div>
      <StatRow label="Vigor"    val={unit.stats.vig}/>
      <StatRow label="Focus"    val={unit.stats.foc}/>
      <StatRow label="Strength" val={unit.stats.str}/>
      <StatRow label="Arcana"   val={unit.stats.arc}/>
      <StatRow label="Skill"    val={unit.stats.skl}/>
      <StatRow label="Speed"    val={unit.stats.spd}/>
      <StatRow label="Ward"     val={unit.stats.wrd}/>
      <StatRow label="Resolve"  val={unit.stats.res}/>
      <StatRow label="Fortune"  val={unit.stats.frt}/>

      <div className="banner-rule"><span className="title">Attacks</span></div>
      {unit.attacks.map((a,i) => (
        <div key={i} style={{display:"grid", gridTemplateColumns:"1fr auto auto", gap:8, alignItems:"baseline", padding:"4px 0", borderBottom:"1px dotted var(--rule-faint)"}}>
          <div>
            <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:13.5}}>{a.name}</div>
            <div style={{fontSize:11, color:"var(--ink-fade)", fontStyle:"italic"}}>
              {a.type} · rng {a.rng} · rate ×{a.rate}
              {a.rider ? <> · <span style={{color:"var(--blood)"}}>{a.rider}</span></> : null}
            </div>
          </div>
          <div className="num" style={{fontSize:12, color:"var(--ink-2)"}}>{a.dmg}</div>
          <button className="btn ghost sm" onClick={(e)=>{e.preventDefault();}}>Edit</button>
        </div>
      ))}

      <div className="banner-rule"><span className="title">Equipment</span></div>
      <div className="kv-grid">
        <div><span className="k">Main</span><span className="v">{unit.gear.main}</span></div>
        <div><span className="k">Off</span><span className="v">{unit.gear.off}</span></div>
        <div><span className="k">Armor</span><span className="v">{unit.gear.armor}</span></div>
        <div><span className="k">Locket</span><span className="v" style={{color: unit.gear.locket === "—" ? "var(--ink-fade)" : "var(--gold-deep)"}}>{unit.gear.locket}</span></div>
      </div>

      <div className="banner-rule"><span className="title">Skills Travelled</span></div>
      <div className="chip-strip">
        {unit.skills.map(s => <span key={s} className="tag">{s}</span>)}
      </div>

      <div style={{marginTop:16, display:"flex", gap:8, flexWrap:"wrap"}}>
        {assigned && onMakeLeader && (
          <button className={`btn ${isLeader ? "" : "ghost"}`} onClick={onMakeLeader}>
            {isLeader ? "◆ Leader" : "Name Leader"}
          </button>
        )}
        {assigned && onUnassign && (
          <button className="btn ghost" onClick={onUnassign}>Return to roster</button>
        )}
        <button className="btn" onClick={onOpenInForge}>Open in Forge →</button>
      </div>
      <div className="italic-note" style={{marginTop:10, fontSize:11, textAlign:"right"}}>
        More surfaces — stances, bond activations — will slot here.
      </div>
    </div>
  );
}

Object.assign(window, { UnitSheet });
