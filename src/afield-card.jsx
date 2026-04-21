// SIGILBORNE — AfieldPartyCard: sealed-envelope placeholder shown when a banner is away on a posting.

function AfieldPartyCard({ party, posting, returnDay, dispatchedDay, currentDay }) {
  const days = typeof returnDay === "number" && typeof currentDay === "number"
    ? Math.max(0, returnDay - currentDay) : null;
  const total = typeof returnDay === "number" && typeof dispatchedDay === "number"
    ? Math.max(1, returnDay - dispatchedDay) : null;
  const elapsed = total && days != null ? total - days : null;
  const progress = total && elapsed != null ? Math.min(1, Math.max(0, elapsed / total)) : 0;
  const souls = Object.values(party.grid).filter(Boolean).length;

  return (
    <div className="party-card" style={{
      borderStyle: "dashed",
      borderColor: "var(--ink-fade)",
      background: "linear-gradient(180deg, rgba(26,24,20,0.02), rgba(26,24,20,0.05))",
      opacity: 0.92,
      position: "relative",
      minHeight: 200,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* Header */}
      <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8}}>
        <div style={{display:"flex", alignItems:"baseline", gap:10, minWidth:0}}>
          <div className="display" style={{fontSize:18, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
            {party.name}
          </div>
          <span style={{
            fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em",
            padding:"2px 6px", border:"1px solid var(--ink-fade)", borderRadius:1,
            color:"var(--ink-fade)", textTransform:"uppercase", whiteSpace:"nowrap"
          }}>☰ Afield</span>
        </div>
        <div style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em"}}>
          {souls} SOULS
        </div>
      </div>

      {/* Wax seal */}
      <div style={{
        position:"absolute", top:14, right:14,
        width:42, height:42, borderRadius:"50%",
        background:"radial-gradient(circle at 35% 30%, #7a1f1a, #4a1411)",
        boxShadow:"inset 0 2px 4px rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"var(--serif)", fontSize:16, color:"rgba(255,230,200,0.9)",
        transform:"rotate(-8deg)",
        pointerEvents:"none",
      }} title="Sealed — party is afield">§</div>

      {/* Posting name */}
      <div style={{borderTop:"1px dashed var(--rule)", paddingTop:10}}>
        <div className="italic-note" style={{fontSize:11, color:"var(--ink-fade)", marginBottom:2}}>Riding on posting</div>
        <div style={{fontFamily:"var(--serif)", fontSize:16, fontWeight:600, color:"var(--ink)", lineHeight:1.2}}>
          {posting ? posting.title : "Unknown writ"}
        </div>
        {posting && (
          <div className="italic-note" style={{fontSize:11, marginTop:2}}>
            {posting.rumor || posting.region}
          </div>
        )}
      </div>

      {/* Return countdown */}
      <div style={{marginTop:"auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4}}>
          <span style={{fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:"0.12em", color:"var(--ink-fade)"}}>
            RETURN
          </span>
          <span style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink)"}}>
            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
          </span>
        </div>
        <div style={{height:3, background:"rgba(26,24,20,0.08)", position:"relative", borderRadius:1}}>
          <div style={{
            position:"absolute", left:0, top:0, bottom:0,
            width: `${progress*100}%`,
            background:"var(--accent, #a8864a)",
            transition: "width 0.4s ease",
          }}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:3,
          fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.05em"}}>
          <span>Day {dispatchedDay}</span>
          <span>Day {returnDay}</span>
        </div>
      </div>

      <div className="italic-note" style={{fontSize:10.5, color:"var(--ink-fade)", borderTop:"1px dashed var(--rule)", paddingTop:6, marginTop:4}}>
        Banner is beyond recall. Souls cannot be re-slotted or reforged until their return.
      </div>
    </div>
  );
}

Object.assign(window, { AfieldPartyCard });
