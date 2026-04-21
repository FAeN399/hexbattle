// SIGILBORNE — Postings / Job Board

function RiskBadge({ risk }) {
  const map = {
    "Low":       { c:"var(--verdant)",  fg:"#f1e9d1" },
    "Moderate":  { c:"var(--iron-blue)",fg:"#f1e9d1" },
    "Hard":      { c:"var(--gold-deep)",fg:"#f1e9d1" },
    "Grim":      { c:"var(--blood)",    fg:"#f1e9d1" },
    "Bitter":    { c:"var(--blood)",    fg:"#f1e9d1" },
    "Perilous":  { c:"#4e2a2a",         fg:"#f1e9d1" },
    "Grave":     { c:"var(--void)",     fg:"#f1e9d1" },
    "Unknown":   { c:"#3a2a4a",         fg:"#e9dfc6" },
  };
  const s = map[risk] || map.Moderate;
  return (
    <span style={{
      background: s.c, color: s.fg, padding:"2px 8px",
      fontFamily:"var(--serif)", fontWeight:600, fontSize:10,
      letterSpacing:"0.18em", textTransform:"uppercase",
      border:"1px solid rgba(0,0,0,0.25)", borderRadius:1,
    }}>{risk}</span>
  );
}

function PartyRequirementDots({ min, max, committed }) {
  const dots = [];
  for (let i = 0; i < max; i++) {
    const filled = i < committed;
    const required = i < min;
    dots.push(
      <span key={i} className={`banner-dot ${filled ? "filled" : ""} ${required ? "req" : "opt"}`}
        title={required ? "Required banner slot" : "Optional banner slot"}/>
    );
  }
  return <span style={{display:"inline-flex", gap:3, alignItems:"center"}}>{dots}</span>;
}

function PostingCard({ posting, assignedPartyIds, selected, sealed, onSelect }) {
  const committed = assignedPartyIds.length;
  const canAccept = committed >= posting.minParties;
  return (
    <div
      className={`posting-card ${selected ? "selected" : ""} ${sealed ? "sealed" : ""}`}
      onClick={onSelect}
    >
      <div className="posting-wax">◉</div>
      <div className="posting-head">
        <div style={{minWidth:0, flex:1}}>
          <div className="posting-title">{posting.title}</div>
          <div className="posting-sub">
            <span>{posting.petitioner}</span>
          </div>
        </div>
        <RiskBadge risk={posting.risk}/>
      </div>

      <div className="posting-region">{posting.region}</div>

      <div className="posting-stakes">{posting.stakes}</div>

      <div className="posting-foot">
        <div>
          <div className="label" style={{fontSize:9, color:"var(--ink-fade)"}}>Banners required</div>
          <div className="banners-readout">
            <PartyRequirementDots min={posting.minParties} max={posting.maxParties} committed={committed}/>
            <span style={{color: canAccept ? "var(--ink)" : "var(--ink-fade)"}}>
              {committed}/{posting.maxParties}
            </span>
            {posting.minParties !== posting.maxParties && (
              <span style={{color:"var(--ink-fade)", fontSize:10.5}}>· min {posting.minParties}</span>
            )}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className="label" style={{fontSize:9, color:"var(--ink-fade)"}}>Reward</div>
          <div style={{fontFamily:"var(--mono)", fontSize:14, display:"flex", alignItems:"center", gap:3, justifyContent:"flex-end"}}>
            <Crown size={12}/> {posting.reward}
          </div>
        </div>
      </div>

      {sealed && <div className="posting-seal-stamp">SEALED · RIDING</div>}
    </div>
  );
}

function PostingBoard({ postings, assignments, sealed, selectedId, onSelect }) {
  return (
    <main className="main">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8, gap:16}}>
        <div style={{minWidth:0, flex:1}}>
          <div className="display" style={{fontSize:28, color:"var(--ink)"}}>Postings</div>
          <div className="italic-note" style={{fontSize:13}}>
            The board at the gate. Letters nailed in wax. Each says: here is a thing that wants doing, and here is the price of doing it. The Warden decides how many banners to send.
          </div>
        </div>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <div style={{display:"flex", gap:4, alignItems:"center", fontSize:10.5, color:"var(--ink-fade)"}}>
            <span className="banner-dot req"/><span>required</span>
            <span className="banner-dot opt" style={{marginLeft:6}}/><span>optional</span>
            <span className="banner-dot filled" style={{marginLeft:6}}/><span>committed</span>
          </div>
        </div>
      </div>

      <div className="banner-rule" style={{margin:"14px 0 10px"}}>
        <span className="title">{postings.length} postings · {sealed.size} sealed</span>
      </div>

      <div className="posting-grid">
        {postings.map(p => (
          <PostingCard
            key={p.id}
            posting={p}
            assignedPartyIds={assignments[p.id] || []}
            selected={selectedId === p.id}
            sealed={sealed.has(p.id)}
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>

      <div style={{marginTop:18, padding:"10px 12px", border:"1px dashed var(--rule)", borderRadius:2, fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-fade)", fontSize:12}}>
        "No work is dishonourable; some work is merely dearer than others."
      </div>
    </main>
  );
}

function PostingDetail({ posting, parties, assignedIds, sealed, onToggleParty, onSeal, onBreak }) {
  if (!posting) {
    return (
      <div>
        <div className="banner-rule"><span className="title">Posting — Detail</span></div>
        <div className="italic-note" style={{fontSize:12, padding:10}}>
          Choose a posting from the board. Its full terms, the petitioner's name, the shape of the work, and which of your banners may ride on it — all here.
        </div>
      </div>
    );
  }

  const committed = assignedIds.length;
  const canSeal = !sealed && committed >= posting.minParties;

  return (
    <div>
      <div style={{display:"flex", alignItems:"flex-start", gap:8, marginBottom:4}}>
        <div style={{minWidth:0, flex:1}}>
          <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:17, lineHeight:1.15}}>{posting.title}</div>
          <div className="italic-note" style={{fontSize:12, marginTop:2}}>{posting.petitioner}</div>
        </div>
        <RiskBadge risk={posting.risk}/>
      </div>

      <div style={{fontSize:11, color:"var(--ink-fade)", letterSpacing:"0.04em", marginBottom:10}}>{posting.region}</div>

      <div style={{fontSize:12.5, color:"var(--ink-soft)", lineHeight:1.5, borderLeft:"2px solid var(--rule-strong)", paddingLeft:10, marginBottom:14, fontStyle:"italic"}}>
        "{posting.stakes}"
      </div>

      <div className="banner-rule"><span className="title">Terms</span></div>
      <div className="unit-meta-grid" style={{display:"grid", gridTemplateColumns:"max-content 1fr", gap:"3px 10px", fontSize:12, marginBottom:14}}>
        <span className="label" style={{fontSize:9.5}}>Reward</span>
        <span style={{display:"flex", alignItems:"center", gap:4}}><Crown/> {posting.reward} crowns</span>
        <span className="label" style={{fontSize:9.5}}>Standing</span><span>{posting.reputation}</span>
        <span className="label" style={{fontSize:9.5}}>By when</span><span>{posting.timeLimit}</span>
        <span className="label" style={{fontSize:9.5}}>Favours</span><span>{posting.affinityBias}</span>
        <span className="label" style={{fontSize:9.5}}>Banners</span>
        <span>
          {posting.minParties === posting.maxParties
            ? <>exactly <strong>{posting.maxParties}</strong></>
            : <><strong>{posting.minParties}</strong>–<strong>{posting.maxParties}</strong></>}
          <span className="italic-note" style={{marginLeft:6, fontSize:11}}>
            {posting.maxParties === 1
              ? "— a single banner ; sending more draws attention."
              : posting.minParties === posting.maxParties
              ? "— the work demands this exact commitment."
              : "— more banners, more force; more banners, more cost."}
          </span>
        </span>
      </div>

      <div className="banner-rule"><span className="title">Commit banners</span></div>
      <div style={{fontSize:11, color:"var(--ink-fade)", marginBottom:8, fontStyle:"italic"}}>
        Tick up to {posting.maxParties} of your four banners. The work cannot be sealed until at least {posting.minParties} {posting.minParties === 1 ? "banner is" : "banners are"} committed.
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:12}}>
        {parties.map(p => {
          const checked = assignedIds.includes(p.id);
          const notDeployed = !p.deployed;
          const disabled = sealed || notDeployed || (!checked && committed >= posting.maxParties);
          return (
            <label
              key={p.id}
              className={`banner-row ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}`}
              style={{opacity: disabled && !checked ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer"}}
              title={notDeployed ? "Banner is not deployed — lock it in the muster first" : undefined}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => !disabled && onToggleParty(posting.id, p.id)}
              />
              <div style={{minWidth:0, flex:1}}>
                <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                  {p.name}
                  {p.deployed && <span style={{marginLeft:6, fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"var(--ink)"}}>⚿</span>}
                </div>
                <div className="italic-note" style={{fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                  {p.formation} · {Object.values(p.grid).filter(Boolean).length}/9 souls
                  {p.leaderId && <> · led by {window.ROSTER.concat(window.__addedUnits||[]).find(u=>u.id===p.leaderId)?.name?.split(" ")[0] || "—"}</>}
                  {notDeployed && <span style={{color:"var(--blood)", marginLeft:6}}>· not deployed</span>}
                </div>
              </div>
              <PartyRequirementDots min={0} max={1} committed={checked ? 1 : 0}/>
            </label>
          );
        })}
      </div>

      <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
        {sealed ? (
          <>
            <div style={{marginRight:"auto", fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--blood)", fontSize:12.5}}>
              The banners ride. Return is pending.
            </div>
            <button className="btn ghost sm" onClick={() => onBreak(posting.id)}>Break seal</button>
          </>
        ) : (
          <>
            <div style={{marginRight:"auto", fontSize:11, color: canSeal ? "var(--ink)" : "var(--ink-fade)", fontStyle:"italic"}}>
              {committed}/{posting.maxParties} banners committed
              {!canSeal && posting.minParties > committed && <> — need {posting.minParties - committed} more</>}
            </div>
            <button className="btn" disabled={!canSeal} onClick={() => onSeal(posting.id)}>
              Seal with wax →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PostingBoard, PostingDetail });
