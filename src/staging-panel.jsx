// SIGILBORNE — StagingArea: right-sidebar "battle staging" panel.
// Deployed banners from PartyCards accumulate here as face-up cards (up to 3).
// Foes are picked from the adversary catalog. Clicking "Begin rehearsal" launches the simulator.

function StagingArea({
  parties, units, stagedAllyIds, stagedFoeIds, afieldPartyIds,
  onUnstageAlly, onToggleFoe, onLaunch, onClearStaging, onSelectPartyCard,
}) {
  const foeCatalog = window.FOE_PARTIES || [];
  const stagedAllies = stagedAllyIds.map(id => parties.find(p => p.id === id)).filter(Boolean);
  const stagedFoes = stagedFoeIds.map(id => foeCatalog.find(f => f.id === id)).filter(Boolean);

  const canLaunch = stagedAllies.length >= 1 && stagedFoes.length >= 1;

  // Count total souls on each side
  const allySouls = stagedAllies.reduce((s, p) => s + Object.values(p.grid || {}).filter(Boolean).length, 0);
  const foeSouls = stagedFoes.reduce((s, p) => s + (p.units ? p.units.length : Object.values(p.grid || {}).filter(Boolean).length), 0);

  const slotIndexes = [0, 1, 2];

  return (
    <div>
      <div className="banner-rule"><span className="title">Battle Staging</span></div>
      <div className="italic-note" style={{fontSize:11.5, padding:"6px 10px 10px", lineHeight:1.5}}>
        Banners you "deploy" muster here. Up to three may ride together. Pick their adversaries below, then call the rehearsal.
      </div>

      {/* Ally slots — three positions */}
      <div style={{padding:"0 2px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
          <div className="label" style={{fontSize:9.5, color:"var(--gold-deep)", letterSpacing:"0.14em"}}>⚑ YOUR BANNERS</div>
          <span style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.08em"}}>
            {stagedAllies.length}/3 · {allySouls} souls
          </span>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {slotIndexes.map(i => {
            const p = stagedAllies[i];
            if (!p) {
              return (
                <div
                  key={`empty-${i}`}
                  style={{
                    padding:"10px 10px",
                    border:"1px dashed var(--rule)",
                    background:"rgba(26,24,20,0.015)",
                    fontSize:11, fontFamily:"var(--serif)", fontStyle:"italic",
                    color:"var(--ink-fade)",
                    textAlign:"center", lineHeight:1.4,
                  }}
                >
                  {i === 0 && stagedAllies.length === 0
                    ? <>Empty slot — click <strong style={{color:"var(--ink)"}}>⚿ Deploy to staging</strong> on a banner.</>
                    : "—"}
                </div>
              );
            }
            const present = Object.values(p.grid || {}).filter(Boolean);
            const leader = p.leaderId ? units.find(u => u.id === p.leaderId) : null;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPartyCard && onSelectPartyCard(p.id)}
                style={{
                  padding:"8px 10px",
                  border:"2px solid var(--gold-deep, #a8864a)",
                  background:"linear-gradient(180deg, rgba(168,134,74,0.06), rgba(168,134,74,0.12))",
                  cursor:"pointer",
                  position:"relative",
                }}
                title="Click to focus this banner in the grid"
              >
                <div style={{position:"absolute", top:4, right:5, fontFamily:"var(--mono)", fontSize:8.5, color:"var(--gold-deep)", letterSpacing:"0.1em"}}>
                  SLOT {i + 1}
                </div>
                <div style={{display:"flex", alignItems:"baseline", gap:6, paddingRight:36}}>
                  <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:13, color:"var(--ink)", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, minWidth:0}}>
                    {p.name}
                  </div>
                </div>
                <div style={{fontSize:10.5, color:"var(--ink-fade)", fontStyle:"italic", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                  "{p.motto}"
                </div>
                <div style={{fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink)", letterSpacing:"0.06em", marginTop:3, display:"flex", gap:8, flexWrap:"wrap"}}>
                  <span>{p.formation}</span>
                  <span style={{color:"var(--ink-fade)"}}>·</span>
                  <span>{present.length} souls</span>
                  {leader && (<>
                    <span style={{color:"var(--ink-fade)"}}>·</span>
                    <span style={{color:"var(--gold-deep)"}}>◆ {leader.name.split(" ")[0]}</span>
                  </>)}
                </div>
                <div style={{marginTop:6, display:"flex", gap:4}}>
                  <button
                    className="btn ghost sm"
                    style={{flex:1, fontSize:10, padding:"3px 5px"}}
                    onClick={(e)=>{ e.stopPropagation(); onUnstageAlly(p.id); }}
                    title="Remove from staging"
                  >↩ Withdraw</button>
                </div>
              </div>
            );
          })}
        </div>
        {stagedAllies.length > 0 && (
          <button
            className="btn ghost sm"
            style={{width:"100%", marginTop:6, fontSize:10, padding:"3px 5px", color:"var(--ink-fade)"}}
            onClick={onClearStaging}
            title="Withdraw all staged banners"
          >✕ Clear all staging</button>
        )}
      </div>

      <div style={{borderTop:"1px dotted var(--rule)", margin:"12px 0"}}/>

      {/* Adversaries picker */}
      <div style={{padding:"0 2px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
          <div className="label" style={{fontSize:9.5, color:"var(--blood)", letterSpacing:"0.14em"}}>✕ ADVERSARIES</div>
          <span style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.08em"}}>
            {stagedFoes.length}/3 · {foeSouls} souls
          </span>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:3}}>
          {foeCatalog.map(f => {
            const sel = stagedFoeIds.includes(f.id);
            const disabled = !sel && stagedFoeIds.length >= 3;
            const count = f.units ? f.units.length : Object.values(f.grid || {}).filter(Boolean).length;
            return (
              <button
                key={f.id}
                onClick={() => onToggleFoe(f.id)}
                disabled={disabled}
                style={{
                  textAlign:"left",
                  padding:"6px 8px",
                  border: sel ? "2px solid var(--blood)" : "1px solid var(--rule)",
                  background: sel ? "rgba(122,31,26,0.05)" : disabled ? "rgba(26,24,20,0.02)" : "var(--parchment)",
                  fontFamily:"var(--serif)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.45 : 1,
                  display:"flex", flexDirection:"column", gap:1,
                  width:"100%", minWidth:0,
                }}
                title={f.motto || f.rumor || ""}
              >
                <div style={{display:"flex", alignItems:"center", gap:5, minWidth:0}}>
                  <span style={{
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    width:13, height:13, border:`1.5px solid ${sel ? "var(--blood)" : "var(--rule)"}`,
                    color: sel ? "var(--blood)" : "transparent", fontSize:9.5, fontFamily:"var(--mono)", lineHeight:1, flexShrink:0,
                  }}>✓</span>
                  <span style={{fontSize:11.5, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, minWidth:0}}>{f.name}</span>
                  {f.tier && <span style={{fontFamily:"var(--mono)", fontSize:9, color:"var(--blood)", letterSpacing:"0.08em", flexShrink:0}}>T{f.tier}</span>}
                </div>
                <div style={{fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.06em", paddingLeft:18, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                  {f.formation} · {count} souls
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{borderTop:"1px dotted var(--rule)", margin:"12px 0 10px"}}/>

      {/* Match summary + launch */}
      <div style={{
        padding:"8px 10px",
        border:"1px solid var(--rule-strong)",
        background: canLaunch ? "rgba(168,134,74,0.04)" : "rgba(26,24,20,0.02)",
        marginBottom:8,
      }}>
        <div className="label" style={{fontSize:9, color:"var(--ink-fade)", letterSpacing:"0.14em"}}>the match</div>
        {canLaunch ? (
          <div style={{fontFamily:"var(--serif)", fontSize:11.5, color:"var(--ink)", lineHeight:1.45, marginTop:2}}>
            <span style={{color:"var(--gold-deep)", fontWeight:600}}>{stagedAllies.map(p=>p.name).join(" · ")}</span>
            <span style={{color:"var(--ink-fade)", margin:"0 4px"}}>vs</span>
            <span style={{color:"var(--blood)", fontWeight:600}}>{stagedFoes.map(p=>p.name).join(" · ")}</span>
          </div>
        ) : (
          <div style={{fontFamily:"var(--serif)", fontSize:11, color:"var(--ink-fade)", fontStyle:"italic", lineHeight:1.45, marginTop:2}}>
            {stagedAllies.length === 0 && "Deploy at least one banner to stage. "}
            {stagedFoes.length === 0 && "Choose an adversary."}
          </div>
        )}
      </div>

      <button
        className="btn sm"
        disabled={!canLaunch}
        onClick={()=>canLaunch && onLaunch()}
        style={{
          width:"100%", fontFamily:"var(--serif)", letterSpacing:"0.1em",
          padding:"10px 10px", fontSize:13.5,
          opacity: canLaunch ? 1 : 0.45, cursor: canLaunch ? "pointer" : "not-allowed",
        }}
        title={canLaunch ? "Open the training yard" : "Stage at least one banner and one adversary"}
      >
        ⚔ Begin rehearsal →
      </button>

      <div className="italic-note" style={{fontSize:10.5, padding:"8px 4px 0", lineHeight:1.45, color:"var(--ink-fade)"}}>
        A rehearsal is diagnostic — outcomes do not touch the household ledger.
      </div>
    </div>
  );
}

Object.assign(window, { StagingArea });
