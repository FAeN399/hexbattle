// SIGILBORNE — Mustering Grounds (recruit screen)

function Crown({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{verticalAlign:"-1px"}}>
      <path d="M2 12 L4 5 L7 8 L8 3 L9 8 L12 5 L14 12 Z" fill="#a8864a" stroke="#7a5f2f" strokeWidth="0.6"/>
      <rect x="2" y="12" width="12" height="1.6" fill="#7a5f2f"/>
    </svg>
  );
}

function MusteringCard({ recruit, selected, affordable, recruited, onSelect }) {
  return (
    <div
      className={`muster-card ${selected ? "selected" : ""} ${recruited ? "recruited" : ""} ${!affordable && !recruited ? "unaffordable" : ""}`}
      onClick={onSelect}
    >
      <div className="muster-card-top">
        <Heraldry seed={recruit.id} sigil={recruit.sigil} size={44}/>
        <div style={{flex:1, minWidth:0}}>
          <div className="muster-name">{recruit.name}</div>
          <div className="muster-sub">
            <span>{recruit.cls}</span>
            <span className="dot">·</span>
            <span>Lv {recruit.lvl}</span>
            <span className="dot">·</span>
            <span className="italic-note" style={{fontStyle:"italic"}}>{recruit.origin}</span>
          </div>
        </div>
        <div style={{textAlign:"right", flex:"0 0 auto"}}>
          <div className="label" style={{fontSize:9, color:"var(--ink-fade)"}}>Asking</div>
          <div className="muster-price">
            <Crown/> <span>{recruit.price}</span>
          </div>
        </div>
      </div>
      <div className="muster-line">"{recruit.line}"</div>
      <div className="muster-tags">
        <span className="mtag">{recruit.nature}</span>
        <span className="mtag">{recruit.affinity}</span>
        <span className="mtag sigil">◇ {recruit.sigil}</span>
        {recruit.oath !== "None" && <span className="mtag oath">Oath</span>}
      </div>
      {recruited && (
        <div className="muster-stamp">PRESSED INTO SERVICE</div>
      )}
    </div>
  );
}

function MusteringGrounds({ pool, treasury, onRecruit, selectedId, onSelect, recruitedIds }) {
  const available = pool.filter(r => !recruitedIds.has(r.id));
  return (
    <main className="main">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8, gap:16}}>
        <div style={{minWidth:0, flex:1}}>
          <div className="display" style={{fontSize:28, color:"var(--ink)"}}>Mustering Grounds</div>
          <div className="italic-note" style={{fontSize:13}}>
            A roadhouse at the crossing. Travellers, soldiers-for-hire, and unpromised hands wait for the Warden's silver.
          </div>
        </div>
        <div style={{display:"flex", gap:10, alignItems:"center", flex:"0 0 auto"}}>
          <div className="treasury-chip">
            <span className="label" style={{fontSize:9}}>Treasury</span>
            <div style={{fontFamily:"var(--mono)", fontSize:17, color:"var(--ink)", display:"flex", alignItems:"center", gap:4}}>
              <Crown size={13}/> {treasury} <span style={{color:"var(--ink-fade)", fontSize:12, letterSpacing:"0.1em"}}>crowns</span>
            </div>
          </div>
          <button className="btn ghost sm" title="New faces drift through with the season">⟲ Call the Road</button>
        </div>
      </div>

      <div className="banner-rule" style={{margin:"14px 0 10px"}}>
        <span className="title">{available.length} souls present · {pool.length - available.length} pressed</span>
      </div>

      <div className="muster-grid">
        {pool.map(r => (
          <MusteringCard
            key={r.id}
            recruit={r}
            selected={selectedId === r.id}
            affordable={treasury >= r.price}
            recruited={recruitedIds.has(r.id)}
            onSelect={() => onSelect(r.id)}
          />
        ))}
      </div>

      <div style={{marginTop:18, padding:"10px 12px", border:"1px dashed var(--rule)", borderRadius:2, fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-fade)", fontSize:12}}>
        "You do not buy a soul. You buy their road, for a season."
      </div>
    </main>
  );
}

function MusterDetail({ recruit, canAfford, recruited, onRecruit, onClose }) {
  if (!recruit) {
    return (
      <div>
        <div className="banner-rule"><span className="title">Mustering — Detail</span></div>
        <div className="italic-note" style={{fontSize:12, padding:10}}>
          Choose a soul from the roadhouse. Their full particulars will show here — stats, oath, wound, and the price of their promise.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
        <Heraldry seed={recruit.id} sigil={recruit.sigil} size={52}/>
        <div style={{minWidth:0, flex:1}}>
          <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:19, lineHeight:1.1}}>{recruit.name}</div>
          <div className="italic-note" style={{fontSize:12}}>{recruit.cls} · Lv {recruit.lvl} · {recruit.origin}</div>
        </div>
        <button className="btn ghost sm" onClick={onClose} title="Close">✕</button>
      </div>

      <div style={{fontSize:13, fontStyle:"italic", color:"var(--ink-soft)", margin:"0 0 12px", lineHeight:1.45, borderLeft:"2px solid var(--rule-strong)", paddingLeft:8}}>
        "{recruit.line}"
      </div>

      <div className="banner-rule"><span className="title">Substance</span></div>
      <div className="unit-meta-grid" style={{display:"grid", gridTemplateColumns:"max-content 1fr", gap:"3px 10px", fontSize:12, marginBottom:12}}>
        <span className="label" style={{fontSize:9.5}}>Nature</span><span>{recruit.nature}</span>
        <span className="label" style={{fontSize:9.5}}>Affinity</span><span>{recruit.affinity}</span>
        <span className="label" style={{fontSize:9.5}}>Sigil</span><span>{recruit.sigil} — <em className="italic-note">{(window.SIGILS[recruit.sigil]||{}).line}</em></span>
        <span className="label" style={{fontSize:9.5}}>Alignment</span><span>{recruit.align}</span>
        <span className="label" style={{fontSize:9.5}}>Oath</span><span style={{color: recruit.oath === "None" ? "var(--ink-fade)" : "var(--ink)"}}>{recruit.oath}</span>
        <span className="label" style={{fontSize:9.5}}>Wound</span><span style={{fontStyle:"italic", color:"var(--ink-soft)"}}>{recruit.wound}</span>
      </div>

      <div className="banner-rule"><span className="title">Stats</span></div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"4px 10px", fontFamily:"var(--mono)", fontSize:11.5, marginBottom:12}}>
        {Object.entries(recruit.stats).map(([k,v]) => (
          <div key={k} style={{display:"flex", justifyContent:"space-between", borderBottom:"1px dotted var(--rule)", padding:"1px 0"}}>
            <span style={{textTransform:"uppercase", color:"var(--ink-fade)"}}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
        <div style={{display:"flex", justifyContent:"space-between", borderBottom:"1px dotted var(--rule)", padding:"1px 0"}}>
          <span style={{textTransform:"uppercase", color:"var(--ink-fade)"}}>mov</span><span>{recruit.move}</span>
        </div>
      </div>

      <div className="banner-rule"><span className="title">Skills carried</span></div>
      <div style={{display:"flex", flexWrap:"wrap", gap:4, marginBottom:14}}>
        {recruit.skills.map(s => <span key={s} className="mtag sigil">{s}</span>)}
      </div>

      <div className="banner-rule"><span className="title">Terms</span></div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", border:"1px solid var(--rule-strong)", borderRadius:2, background:"rgba(168,134,74,0.08)", marginBottom:10}}>
        <div>
          <div className="label" style={{fontSize:9}}>Asking price</div>
          <div style={{fontFamily:"var(--mono)", fontSize:18, display:"flex", alignItems:"center", gap:4}}>
            <Crown size={14}/> {recruit.price}
          </div>
        </div>
        {!recruited && (
          <button
            className="btn"
            disabled={!canAfford}
            onClick={onRecruit}
            title={canAfford ? "Press this soul into the household's service" : "The coffers are too light."}
          >
            {canAfford ? "Press into service →" : "Coffers too light"}
          </button>
        )}
        {recruited && (
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--serif)", fontSize:13, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--blood)"}}>Sworn</div>
            <div className="italic-note" style={{fontSize:11}}>Now of the Warden's Household.</div>
          </div>
        )}
      </div>

      <div className="italic-note" style={{fontSize:11, color:"var(--ink-fade)"}}>
        The soul will be added to the household roster. Their oath and wound travel with them.
      </div>
    </div>
  );
}

Object.assign(window, { MusteringGrounds, MusterDetail });
