// SIGILBORNE — App shell

const { useState, useEffect, useMemo, useRef } = React;

// ---- Presets ----
function buildArmy(preset) {
  // returns {units, parties}
  const units = JSON.parse(JSON.stringify(ROSTER));
  try {
    const raw = localStorage.getItem("sigilborne.oath-recruits.v1");
    const recruits = raw ? JSON.parse(raw) : [];
    if (Array.isArray(recruits)) {
      recruits.forEach(r => units.push(JSON.parse(JSON.stringify(r))));
    }
  } catch {}
  let parties;
  if (preset === "spread") {
    parties = [
      { id:"p1", name:"First Hand of Aelric", motto:"Stand and be counted.", formation:"Shieldwall", leaderId:"u01",
        grid:{ "0,0":"u13","0,1":"u01","0,2":"u08","1,1":"u05","2,0":"u09","2,2":null } },
      { id:"p2", name:"Lance of Morrow", motto:"Swift and sworn.", formation:"Wedge", leaderId:"u06",
        grid:{ "0,1":"u06","1,0":"u10","1,1":null,"1,2":"u04","2,1":"u12" } },
      { id:"p3", name:"Green Spear", motto:"Given the wood; given the arrow.", formation:"Crescent", leaderId:"u02",
        grid:{ "0,0":"u02","0,2":"u14","1,1":"u07","2,0":null,"2,1":"u03","2,2":null } },
      { id:"p4", name:"Lantern Choir", motto:"A light against the hollow.", formation:"Aegis", leaderId:"u11",
        grid:{ "0,1":"u15","1,0":null,"1,2":"u11","2,1":"u16" } },
    ];
  } else if (preset === "chorus") {
    // Lumen chorus — stack all Lumen units together
    parties = [
      { id:"p1", name:"Choir of Lanternfall", motto:"Many voices, one sigil.", formation:"Aegis", leaderId:"u05",
        grid:{ "0,1":"u08","1,0":"u05","1,2":"u11","2,1":"u06" } },
      { id:"p2", name:"First Hand of Aelric", motto:"Stand and be counted.", formation:"Shieldwall", leaderId:"u01",
        grid:{ "0,0":"u13","0,1":"u01","0,2":"u04","1,1":"u10","2,0":"u03" } },
      { id:"p3", name:"Green Spear", motto:"Given the wood.", formation:"Crescent", leaderId:"u02",
        grid:{ "0,0":"u02","0,2":"u14","1,1":"u07","2,1":"u09" } },
      { id:"p4", name:"Fifth", motto:"Scouts afar.", formation:"Wedge", leaderId:null,
        grid:{ "0,1":null, "1,1":"u15","2,1":"u16","2,0":"u12" } },
    ];
  } else {
    parties = JSON.parse(JSON.stringify(INITIAL_PARTIES));
  }
  return { units, parties };
}

// ---- Day Resolution Modal ----
function ResolutionModal({ log, onClose }) {
  const { day, events = [], empty } = log;
  return (
    <div
      style={{
        position:"fixed", inset:0, background:"rgba(10,8,5,0.55)",
        zIndex:100, display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
      }}
      onClick={onClose}
    >
      <div
        className="parchment parchment-inset"
        onClick={(e) => e.stopPropagation()}
        style={{
          width:"min(720px, 100%)", maxHeight:"90vh", overflow:"auto",
          padding:"22px 28px", border:"1px solid var(--rule-strong)",
          boxShadow:"0 20px 60px rgba(0,0,0,0.45)", position:"relative",
        }}
      >
        <button
          onClick={onClose}
          className="btn ghost sm"
          style={{position:"absolute", top:12, right:12}}
        >✕</button>

        <div style={{borderBottom:"2px solid var(--ink)", paddingBottom:10, marginBottom:14}}>
          <div className="label-lg" style={{fontSize:11, letterSpacing:"0.18em", color:"var(--gold-deep)"}}>☽ THE PAGE TURNS</div>
          <div className="display" style={{fontSize:26, color:"var(--ink)", marginTop:4}}>
            Day {day} — the Warden's Log
          </div>
        </div>

        {empty ? (
          <div className="italic-note" style={{fontSize:13, lineHeight:1.6, padding:"20px 0"}}>
            The board is quiet. No postings ride under your banners. Wounded souls mend a little. The light lengthens. Seal a posting and turn the page again to see banners resolved.
          </div>
        ) : events.length === 0 ? (
          <div className="italic-note" style={{fontSize:13}}>Nothing to report.</div>
        ) : (
          <>
            <div className="italic-note" style={{fontSize:12.5, marginBottom:12, lineHeight:1.55}}>
              Riders returned at dawn. What follows is what the Warden was told — three examples of how banners fare on the road. (A full campaign would resolve every sealed posting on its deadline; here we show three to give the shape of it.)
            </div>

            {events.map((ev, i) => {
              const tone = ev.outcome === "Won clean" ? "var(--verdant)" :
                           ev.outcome === "Won at cost" ? "var(--iron-blue)" :
                           ev.outcome === "Won at heavy cost" ? "var(--gold-deep)" :
                           "var(--blood)";
              return (
                <div key={ev.postingId} style={{
                  borderLeft:`3px solid ${tone}`,
                  padding:"10px 14px",
                  marginBottom:10,
                  background:"rgba(26,24,20,0.025)",
                }}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:12, marginBottom:4}}>
                    <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:14.5, color:"var(--ink)"}}>{ev.title}</div>
                    <div style={{
                      fontFamily:"var(--serif)", fontWeight:600, fontSize:10.5,
                      textTransform:"uppercase", letterSpacing:"0.18em", color:tone,
                      padding:"2px 8px", border:`1px solid ${tone}`, whiteSpace:"nowrap",
                    }}>{ev.outcome}</div>
                  </div>
                  <div style={{fontSize:11, color:"var(--ink-fade)", marginBottom:6, fontFamily:"var(--mono)"}}>
                    Risk: {ev.risk} · Sent: {ev.sent.join(", ") || "—"}
                  </div>
                  <div style={{fontSize:12.5, lineHeight:1.55, fontFamily:"var(--serif)", color:"var(--ink)"}}>
                    {ev.details}
                  </div>
                  {(ev.reward > 0 || ev.wounded > 0) && (
                    <div style={{display:"flex", gap:14, marginTop:6, fontSize:11, fontFamily:"var(--mono)"}}>
                      {ev.reward > 0 && <span style={{color:"var(--gold-deep)"}}>+{ev.reward} crowns</span>}
                      {ev.wounded > 0 && <span style={{color:"var(--blood)"}}>{ev.wounded} wounded</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        <div style={{display:"flex", justifyContent:"flex-end", marginTop:16, gap:8}}>
          <button className="btn" onClick={onClose}>Close the Log</button>
        </div>
      </div>
    </div>
  );
}

// ---- Top bar ----
function TopBar({ activePartyName, onToggleTweaks, view, onViewChange, treasury, pendingCount, day, afieldCount, onSimulateDay, onResetCampaign, onReturnToOath }) {
  const navItems = [
    { id: "banners",   glyph: "✦", label: "Banners" },
    { id: "mustering", glyph: "⚒", label: "Mustering" },
    { id: "stores",    glyph: "▥", label: "Stores", extra: pendingCount ? `§ ${pendingCount}` : null },
  ];
  return (
    <div className="topbar parchment parchment-inset" style={{flexDirection:"column", alignItems:"stretch", gap:0, padding:"10px 14px 0", paddingBottom:0}}>
      <div style={{display:"flex", alignItems:"center", gap:12, minHeight:42, paddingBottom:0}}>
        <div style={{display:"flex", flexDirection:"column", gap:0, whiteSpace:"nowrap", flex:"0 0 auto", minWidth:240, paddingRight:20}}>
          <span className="label-lg" style={{color:"var(--ink)", fontSize:12, letterSpacing:"0.16em"}}>✦ SIGILBORNE</span>
          <span className="italic-note" style={{fontSize:11, color:"var(--ink-fade)", marginTop:-1}}>The Warden's Hall</span>
        </div>
        <div className="top-nav" style={{flex:1, display:"flex", justifyContent:"center", gap:6}}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`top-nav-btn ${view === item.id ? "active" : ""}`}
              onClick={() => onViewChange(item.id)}
              title={item.label}
            >
              <span className="top-nav-glyph">{item.glyph}</span>
              <span className="top-nav-label">{item.label}</span>
              {item.extra && <span className="top-nav-extra">{item.extra}</span>}
            </button>
          ))}
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap", flex:"0 0 auto", justifyContent:"flex-end"}}>
          <span style={{fontFamily:"var(--mono)", fontSize:12.5, display:"inline-flex", alignItems:"center", gap:3, color:"var(--ink)"}}>
            <Crown size={12}/> {treasury}
          </span>
          <span style={{width:1, height:14, background:"var(--rule-strong)"}}/>
          <span style={{fontFamily:"var(--mono)", fontSize:12.5, color:"var(--ink)", display:"inline-flex", alignItems:"center", gap:4}}>
            <span style={{fontSize:11, letterSpacing:"0.14em", color:"var(--ink-fade)"}}>DAY</span>
            <span>{day}</span>
          </span>
          {afieldCount > 0 && (
            <span style={{
              fontFamily:"var(--mono)", fontSize:10.5, color:"var(--ink-fade)",
              display:"inline-flex", alignItems:"center", gap:3,
              padding:"2px 6px", border:"1px solid var(--rule)", borderRadius:1,
              letterSpacing:"0.08em", whiteSpace:"nowrap",
            }} title={`${afieldCount} banner${afieldCount===1?"":"s"} afield`}>
              <span style={{fontSize:11}}>☰</span>
              <span>{afieldCount} afield</span>
            </span>
          )}
          <button className="btn sm" onClick={onSimulateDay} title="Advance the campaign by one day" style={{fontFamily:"var(--serif)", letterSpacing:"0.1em"}}>
            ☽ Simulate Day
          </button>
          <button
            className="btn ghost sm"
            onClick={onResetCampaign}
            title="Reset the campaign to Day 1 — keeps your household, wipes postings, sealed writs, afield banners, treasury back to start"
            style={{fontFamily:"var(--serif)", letterSpacing:"0.08em"}}
          >↺ Day 1</button>
          <button
            className="btn ghost sm"
            onClick={onReturnToOath}
            title="Return to character creation — abandons this Warden and begins a new oath"
            style={{fontFamily:"var(--serif)", letterSpacing:"0.08em", color:"var(--blood)", borderColor:"var(--blood)"}}
          >⚔ New Oath</button>
          <span style={{width:1, height:14, background:"var(--rule-strong)"}}/>
          <span className="label" style={{fontSize:9.5}}>Warden · Rank III</span>
          <span style={{width:1, height:14, background:"var(--rule-strong)"}}/>
          <button className="btn ghost sm" onClick={onToggleTweaks} title="Tweaks">⚙ Tweaks</button>
        </div>
      </div>
    </div>
  );
}

// ---- Active party emergent strip ----
function ActivePartyPanel({ party, units, onClear, onSelectUnit, selectedUnitId }) {
  const present = Object.values(party.grid).filter(Boolean).map(id => units.find(u => u.id === id)).filter(Boolean);
  const leader = party.leaderId ? units.find(u => u.id === party.leaderId) : null;

  return (
    <div>
      <div className="banner-rule"><span className="title">{party.name}</span></div>
      <div className="italic-note" style={{fontSize:12, marginTop:-6, marginBottom:6}}>"{party.motto}"</div>

      {leader && (
        <div style={{border:"1px solid var(--rule-strong)", padding:"6px 8px", borderRadius:2, background:"rgba(168,134,74,0.08)", display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
          <Heraldry seed={leader.id} sigil={leader.sigil} size={28}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontFamily:"var(--serif)", fontSize:10.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--gold-deep)"}}>Leader's Aura</div>
            <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:14}}>{leader.name}</div>
            <div className="italic-note" style={{fontSize:11}}>{leader.cls} aura · if they fall, Broken Banner.</div>
          </div>
        </div>
      )}

      <Readouts units={present}/>

      <div className="banner-rule" style={{marginTop:16}}><span className="title">Souls Present · {present.length}</span></div>
      <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
        {present.map(u => (
          <button
            key={u.id}
            className="btn ghost sm"
            onClick={()=>onSelectUnit(u.id)}
            style={{padding:"3px 6px", borderColor: selectedUnitId === u.id ? "var(--ink)" : "var(--rule)", background: selectedUnitId === u.id ? "rgba(26,24,20,0.05)" : "transparent"}}
            title={`${u.name} — ${u.cls}`}
          >
            <span style={{display:"inline-flex", alignItems:"center", gap:4, textTransform:"none", letterSpacing:"0.02em", fontWeight:500, fontSize:11}}>
              <Heraldry seed={u.id} sigil={u.sigil} size={14}/>
              {u.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Main App ----
function App() {
  const [tweaks, setTweaks] = useState(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem("sb_tweaks") || "null"); } catch(e){return null;} })();
    return { ...(window.TWEAK_DEFAULTS || {}), ...(saved || {}) };
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const initial = useMemo(() => buildArmy(tweaks.armyPreset), []);
  const [units, setUnits] = useState(initial.units);
  const [parties, setParties] = useState(initial.parties);
  const [activePartyId, setActivePartyId] = useState("p1");
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [dragState, setDragState] = useState(null); // {dragUnitId, from, partyId, coord, overSlot, overRoster}

  // New state for tabs, mustering, postings, treasury
  const [view, setView] = useState("banners"); // "banners" | "mustering" | "postings"
  const [treasury, setTreasury] = useState(STARTING_TREASURY);
  const [recruitedIds, setRecruitedIds] = useState(new Set());
  const [selectedRecruitId, setSelectedRecruitId] = useState(null);
  const [selectedPostingId, setSelectedPostingId] = useState(null);
  const [postingAssignments, setPostingAssignments] = useState({}); // { postingId: [partyId, ...] }
  const [sealedPostings, setSealedPostings] = useState(new Map()); // Map<postingId, {dispatchedDay, returnDay}>

  // Stores — household stock of items (by slot → {itemId: count}), and merchant stock deltas
  const [storesStock, setStoresStock] = useState(() => (window.defaultStock ? window.defaultStock() : {main:{},off:{},armor:{},locket:{}}));
  const [merchantStock, setMerchantStock] = useState(() => {
    const s = {};
    (window.MERCHANT_OFFERS || []).forEach(o => { s[o.itemId + ":" + o.slot] = o.stock; });
    return s;
  });
  const [postingDetailOpen, setPostingDetailOpen] = useState(false);
  const [battleSimPartyId, setBattleSimPartyId] = useState(null);
  const [battleSimLaunch, setBattleSimLaunch] = useState(null); // { allyIds, foeIds } when staged
  const [stagedAllyIds, setStagedAllyIds] = useState([]);
  const [stagedFoeIds, setStagedFoeIds] = useState(["bandit_pack"]);

  // ---- Time / campaign calendar ----
  const [day, setDay] = useState(1);
  const [resolutionLog, setResolutionLog] = useState(null); // { day, events: [{postingId, title, outcome, details}] }

  // Unit Forge — full-page unit screen (rename, equip, battle doctrine)
  const [viewingUnitId, setViewingUnitId] = useState(null);
  const [forgeTab, setForgeTab] = useState("identity");
  const [doctrines, setDoctrines] = useState({}); // { unitId: [actionId, ...] }
  // Training — { unitId: {skillId, mentorId, daysLeft} }
  const [training, setTraining] = useState({});

  // swap preset when tweak changes
  useEffect(() => {
    const { units: u, parties: p } = buildArmy(tweaks.armyPreset);
    setUnits(u);
    setParties(p);
    setSelectedUnitId(null);
  }, [tweaks.armyPreset]);

  // persist tweaks
  useEffect(() => {
    localStorage.setItem("sb_tweaks", JSON.stringify(tweaks));
  }, [tweaks]);

  // Edit mode handshake
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch(e){}
    return () => window.removeEventListener("message", handler);
  }, []);

  const deployedIds = useMemo(() => {
    const set = new Set();
    parties.forEach(p => Object.values(p.grid).forEach(id => { if (id) set.add(id); }));
    return set;
  }, [parties]);

  const activeParty = parties.find(p => p.id === activePartyId) || parties[0];

  // ---- Actions ----
  const removeUnitFromAnywhere = (unitId, nextParties) => {
    nextParties.forEach(p => {
      Object.keys(p.grid).forEach(c => {
        if (p.grid[c] === unitId) p.grid[c] = null;
      });
      if (p.leaderId === unitId) p.leaderId = null;
    });
  };

  const handleSlotDrop = (partyId, coord) => {
    if (!dragState) return;
    // Block drops into a deployed party
    const targetParty = parties.find(p => p.id === partyId);
    if (targetParty && targetParty.deployed) { setDragState(null); return; }
    // Block moving a soul OUT of a deployed party
    if (dragState.from === "party") {
      const originParty = parties.find(p => p.id === dragState.partyId);
      if (originParty && originParty.deployed) { setDragState(null); return; }
    }
    const { dragUnitId } = dragState;
    const next = JSON.parse(JSON.stringify(parties));
    // If something's in that slot, swap it back to dragged origin (if from party); else return to roster
    const target = next.find(p => p.id === partyId);
    const displaced = target.grid[coord] || null;

    // --- Capacity check: if adding a NEW soul to this party, ensure under cap ---
    const alreadyInTarget = Object.values(target.grid).includes(dragUnitId);
    if (!alreadyInTarget) {
      const cap = partyCapacity(target, units);
      const currentCount = Object.values(target.grid).filter(Boolean).length;
      // If displacing, count stays the same. If dropping on empty, +1.
      const nextCount = displaced ? currentCount : currentCount + 1;
      if (nextCount > cap) {
        // party full — reject
        setDragState(null);
        return;
      }
    }

    removeUnitFromAnywhere(dragUnitId, next);

    // if drop came from a slot, place the displaced unit there
    if (dragState.from === "party" && displaced) {
      const origin = next.find(p => p.id === dragState.partyId);
      if (origin) origin.grid[dragState.coord] = displaced;
    } else if (displaced) {
      // displaced returns to roster — ensure removed (it may still be elsewhere)
      removeUnitFromAnywhere(displaced, next);
    }

    target.grid[coord] = dragUnitId;
    setParties(next);
    setActivePartyId(partyId);
    setSelectedUnitId(dragUnitId);
    setDragState(null);
  };

  const handleDropToRoster = () => {
    if (!dragState || dragState.from !== "party") { setDragState(null); return; }
    const originParty = parties.find(p => p.id === dragState.partyId);
    if (originParty && originParty.deployed) { setDragState(null); return; }
    const next = JSON.parse(JSON.stringify(parties));
    removeUnitFromAnywhere(dragState.dragUnitId, next);
    setParties(next);
    setDragState(null);
  };

  const handleToggleDeploy = (partyId) => {
    setParties(prev => prev.map(p => p.id === partyId ? { ...p, deployed: !p.deployed } : p));
  };

  const handleFormationChange = (partyId, formation) => {
    const p0 = parties.find(p => p.id === partyId);
    if (p0 && p0.deployed) return;
    setParties(parties.map(p => p.id === partyId ? {...p, formation} : p));
  };

  const handleMakeLeader = (unitId) => {
    // find party containing unit
    const next = parties.map(p => {
      const has = Object.values(p.grid).includes(unitId);
      if (has && !p.deployed) return { ...p, leaderId: unitId };
      return p;
    });
    setParties(next);
  };

  const handleUnassign = (unitId) => {
    const origin = parties.find(p => Object.values(p.grid).includes(unitId));
    if (origin && origin.deployed) return;
    const next = JSON.parse(JSON.stringify(parties));
    removeUnitFromAnywhere(unitId, next);
    setParties(next);
  };

  // Mustering — recruit a soul into the household
  const handleRecruit = (recruitId) => {
    const r = MUSTERING_POOL.find(x => x.id === recruitId);
    if (!r) return;
    if (treasury < r.price) return;
    if (recruitedIds.has(recruitId)) return;
    // Add to units roster
    setUnits(prev => [...prev, JSON.parse(JSON.stringify(r))]);
    setTreasury(t => t - r.price);
    setRecruitedIds(prev => { const n = new Set(prev); n.add(recruitId); return n; });
  };

  // Postings — toggle a party's commitment to a posting
  const handleTogglePartyOnPosting = (postingId, partyId) => {
    setPostingAssignments(prev => {
      const cur = prev[postingId] || [];
      const posting = POSTINGS.find(p => p.id === postingId);
      let next;
      if (cur.includes(partyId)) {
        next = cur.filter(id => id !== partyId);
      } else {
        if (cur.length >= posting.maxParties) return prev; // full
        next = [...cur, partyId];
      }
      return { ...prev, [postingId]: next };
    });
  };

  // Seal a posting — it becomes active (banners dispatched, returnDay computed)
  const handleSealPosting = (postingId) => {
    const assigned = postingAssignments[postingId] || [];
    const posting = POSTINGS.find(p => p.id === postingId);
    if (!posting || assigned.length < posting.minParties) return;
    const td = travelDaysFor(posting);
    setSealedPostings(prev => {
      const n = new Map(prev);
      n.set(postingId, { dispatchedDay: day, returnDay: day + td });
      return n;
    });
  };

  const handleBreakSeal = (postingId) => {
    // Can't recall banners once they ride — no-op while afield. We leave the function
    // for future "before dawn" window, but currently the drawer will not show a break button.
    setSealedPostings(prev => { const n = new Map(prev); n.delete(postingId); return n; });
  };

  // ---- Simulate Day: advance the campaign calendar ----
  // Each day: heal +1 hp to wounded souls (who are in the hall, not afield),
  // ---- Simulate Day: advance the campaign calendar ----
  // Each day: heal +1 hp to wounded souls (who are in the hall, not afield),
  // ---- Reset to Day 1: keep household, wipe campaign state ----
  const handleResetCampaign = () => {
    if (!window.confirm("Reset the campaign to Day 1?\n\nThis keeps your household (souls, equipment, training) but recalls every banner, tears up all sealed writs, and returns the treasury to its starting sum.")) return;
    setDay(1);
    setTreasury(STARTING_TREASURY);
    setPostingAssignments({});
    setSealedPostings(new Map());
    setResolutionLog(null);
    setSelectedPostingId(null);
    setPostingDetailOpen(false);
    // unlock every banner (recall from deployed)
    setParties(prev => prev.map(p => ({ ...p, deployed: false })));
    setView("banners");
    setViewingUnitId(null);
    setSelectedUnitId(null);
  };

  // ---- Return to character creation: go back to the Warden's Oath ----
  const handleReturnToOath = () => {
    if (!window.confirm("Return to character creation?\n\nThis abandons this Warden's entire campaign — every soul, every sealed writ, every crown earned. A new oath will be sworn in its place.")) return;
    try { localStorage.clear(); } catch(e){}
    window.location.href = "wardens-oath.html";
  };

  // ---- Simulate Day: advance the campaign calendar ----
  // resolve ALL postings whose returnDay <= newDay.
  const handleSimulateDay = () => {
    const newDay = day + 1;
    setDay(newDay);

    // Figure out which posting ids are returning today, and which are still afield
    const returning = [];
    const stillAfield = new Map();
    for (const [pid, meta] of sealedPostings.entries()) {
      if (meta.returnDay <= newDay) returning.push({ pid, meta });
      else stillAfield.set(pid, meta);
    }

    // The set of souls who are AFIELD on new day (won't heal, won't be touched)
    const afieldPartyIds = new Set();
    stillAfield.forEach((_, pid) => {
      const ids = postingAssignments[pid] || [];
      ids.forEach(id => afieldPartyIds.add(id));
    });
    const afieldSoulIds = new Set();
    parties.forEach(p => {
      if (afieldPartyIds.has(p.id)) {
        Object.values(p.grid).forEach(id => { if (id) afieldSoulIds.add(id); });
      }
    });

    // Heal wounded souls IN THE HALL (not afield) by 1 hp
    setUnits(prev => prev.map(u => {
      if (afieldSoulIds.has(u.id)) return u; // afield — unchanged
      if (u.hp >= u.hpmax) return u;
      return { ...u, hp: Math.min(u.hpmax, u.hp + 1) };
    }));

    if (returning.length === 0) {
      setResolutionLog({ day: newDay, events: [], empty: true });
      return;
    }

    // Resolve each returning posting
    const events = returning.map(({ pid, meta }) => {
      const posting = POSTINGS.find(p => p.id === pid);
      if (!posting) return null;
      const assignedPartyIds = postingAssignments[pid] || [];
      const assignedParties = assignedPartyIds.map(id => parties.find(p => p.id === id)).filter(Boolean);

      let totalSouls = 0;
      let totalCmd = 0;
      assignedParties.forEach(ap => {
        const present = Object.values(ap.grid).filter(Boolean);
        totalSouls += present.length;
        const leader = ap.leaderId ? units.find(u => u.id === ap.leaderId) : null;
        if (leader) totalCmd += commandFor(leader);
      });

      const riskWeight = { "Low":4, "Moderate":6, "Hard":8, "Grim":10, "Perilous":11, "Bitter":9, "Grave":12, "Unknown":7 }[posting.risk] || 6;
      const banner = totalSouls + totalCmd;

      let outcome, details, reward, wounded;
      if (banner >= riskWeight + 3) {
        outcome = "Won clean";
        reward = posting.reward;
        wounded = 0;
        details = `${totalSouls} souls answered. The banner held; none fell. ${posting.reputation} entered the ledger. +${reward} crowns received.`;
      } else if (banner >= riskWeight) {
        outcome = "Won at cost";
        reward = Math.floor(posting.reward * 0.85);
        wounded = Math.max(1, Math.floor(totalSouls * 0.3));
        details = `${totalSouls} souls answered; the fight was long. ${wounded} return with wounds that will need mending. +${reward} crowns.`;
      } else if (banner >= riskWeight - 2) {
        outcome = "Won at heavy cost";
        reward = Math.floor(posting.reward * 0.5);
        wounded = Math.max(2, Math.floor(totalSouls * 0.6));
        details = `The task was done, barely. ${wounded} souls carried home on shields. +${reward} crowns — but the price was real.`;
      } else {
        outcome = "Broke the banner";
        reward = 0;
        wounded = Math.max(2, Math.floor(totalSouls * 0.75));
        details = `The banner broke. ${wounded} souls wounded; the posting is failed. Petitioner's favor lost. 0 crowns.`;
      }

      if (reward > 0) setTreasury(t => t + reward);
      if (wounded > 0) {
        const allAssignedUnitIds = [];
        assignedParties.forEach(ap => {
          Object.values(ap.grid).filter(Boolean).forEach(id => allAssignedUnitIds.push(id));
        });
        const victims = allAssignedUnitIds.slice(0, wounded);
        setUnits(prev => prev.map(u => {
          if (!victims.includes(u.id)) return u;
          const dmg = Math.floor(u.hpmax * 0.35);
          return { ...u, hp: Math.max(1, u.hp - dmg) };
        }));
      }

      return {
        postingId: pid,
        title: posting.title,
        risk: posting.risk,
        outcome,
        details,
        reward,
        wounded,
        sent: assignedParties.map(ap => ap.name),
      };
    }).filter(Boolean);

    // Remove returned postings from sealed map
    setSealedPostings(stillAfield);

    setResolutionLog({ day: newDay, events });
  };

  const handleRename = (unitId, newName) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, name: newName } : u));
  };

  const handleEquip = (unitId, slot, itemName) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, gear: { ...u.gear, [slot]: itemName } } : u));
  };

  // Stores — buy items from merchant
  const handleBuyItem = (offer, qty) => {
    const cost = offer.price * qty;
    if (treasury < cost) return;
    const key = offer.itemId + ":" + offer.slot;
    const available = merchantStock[key] ?? offer.stock;
    if (qty > available) return;
    setTreasury(t => t - cost);
    setMerchantStock(prev => ({ ...prev, [key]: available - qty }));
    setStoresStock(prev => {
      const slotStock = { ...(prev[offer.slot] || {}) };
      slotStock[offer.itemId] = (slotStock[offer.itemId] || 0) + qty;
      return { ...prev, [offer.slot]: slotStock };
    });
  };

  // Stores — auto-equip the whole household
  const handleAutoEquipAll = () => {
    if (!window.autoEquipAll) return;
    const newGearMap = window.autoEquipAll(units);
    setUnits(prev => prev.map(u => newGearMap[u.id] ? { ...u, gear: newGearMap[u.id] } : u));
  };

  const handleSetDoctrine = (unitId, doctrineArr) => {
    setDoctrines(prev => ({ ...prev, [unitId]: doctrineArr }));
  };

  // ---- Forge handlers: learn, mentor, mastery, promote ----
  const handleLearnSkill = (unitId, skill) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      if ((u.skills || []).includes(skill.name)) return u;
      return { ...u, skills: [...(u.skills || []), skill.name] };
    }));
  };

  const handleAssignMentor = (unitId, skillId, mentorId) => {
    setTraining(prev => ({ ...prev, [unitId]: { skillId, mentorId, daysLeft: 5, intensity: (prev[unitId] && prev[unitId].intensity) || "steady" } }));
  };

  const handleSetIntensity = (unitId, intensity) => {
    setTraining(prev => prev[unitId] ? { ...prev, [unitId]: { ...prev[unitId], intensity } } : prev);
  };

  const handleCancelTraining = (unitId) => {
    setTraining(prev => { const n = { ...prev }; delete n[unitId]; return n; });
  };

  const handleChooseMastery = (unitId, masteryId) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, mastery: masteryId } : u));
  };

  const handlePromote = (unitId, targetClass) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, cls: targetClass, mastery: null } : u));
  };

  const handleTakeFeat = (unitId, featId) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      const feats = u.feats || [];
      if (feats.includes(featId) || feats.length >= 2) return u;
      return { ...u, feats: [...feats, featId] };
    }));
  };

  const handleRemoveFeat = (unitId, featId) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, feats: (u.feats || []).filter(f => f !== featId) } : u));
  };

  const handleAutoTune = (unitId) => {
    setUnits(prev => {
      const target = prev.find(u => u.id === unitId);
      if (!target) return prev;
      const patch = autoTuneUnit(target, prev);
      return prev.map(u => u.id === unitId ? { ...u, ...patch } : u);
    });
  };

  const selectedUnit = selectedUnitId ? units.find(u => u.id === selectedUnitId) : null;
  const selectedIsDeployed = selectedUnitId && deployedIds.has(selectedUnitId);
  const isLeader = selectedUnit && parties.some(p => p.leaderId === selectedUnit.id);

  const selectedRecruit = selectedRecruitId ? MUSTERING_POOL.find(r => r.id === selectedRecruitId) : null;
  const selectedPosting = selectedPostingId ? POSTINGS.find(p => p.id === selectedPostingId) : null;

  const paletteClass = tweaks.paletteMode === "dark" ? "palette-dark" : "";
  const densityClass = tweaks.density === "compact" ? "density-compact" : "";

  // Pending postings count for the tab badge
  const pendingPostings = POSTINGS.filter(p => !sealedPostings.has(p.id)).length;

  // --- Afield computation: which parties & souls are currently riding ---
  const afieldPartyIds = useMemo(() => {
    const s = new Set();
    sealedPostings.forEach((_, pid) => {
      (postingAssignments[pid] || []).forEach(id => s.add(id));
    });
    return s;
  }, [sealedPostings, postingAssignments]);

  const afieldSoulIds = useMemo(() => {
    const s = new Set();
    parties.forEach(p => {
      if (afieldPartyIds.has(p.id)) {
        Object.values(p.grid).forEach(id => { if (id) s.add(id); });
      }
    });
    return s;
  }, [parties, afieldPartyIds]);

  // Map of partyId -> { postingId, returnDay, posting }
  const afieldByPartyId = useMemo(() => {
    const m = {};
    sealedPostings.forEach((meta, pid) => {
      const posting = POSTINGS.find(p => p.id === pid);
      (postingAssignments[pid] || []).forEach(partyId => {
        m[partyId] = { postingId: pid, returnDay: meta.returnDay, dispatchedDay: meta.dispatchedDay, posting };
      });
    });
    return m;
  }, [sealedPostings, postingAssignments]);

  // Souls in any party marked deployed (locked — no in/out, no forge edits)
  const lockedSoulIds = useMemo(() => {
    const s = new Set();
    parties.forEach(p => {
      if (p.deployed) Object.values(p.grid).forEach(id => { if (id) s.add(id); });
    });
    return s;
  }, [parties]);

  const afieldCount = afieldPartyIds.size;
  const deployedCount = parties.filter(p => p.deployed && !afieldPartyIds.has(p.id)).length;

  return (
    <div className={`parchment app-shell ${paletteClass} ${densityClass}`}>
      <TopBar
        activePartyName={activeParty.name}
        onToggleTweaks={() => setTweaksOpen(v => !v)}
        view={view}
        onViewChange={(v) => { setView(v); setSelectedUnitId(null); setViewingUnitId(null); setPostingDetailOpen(false); }}
        treasury={treasury}
        pendingCount={pendingPostings}
        day={day}
        afieldCount={afieldCount}
        onSimulateDay={handleSimulateDay}
        onResetCampaign={handleResetCampaign}
        onReturnToOath={handleReturnToOath}
      />

      {/* Left — Roster (shared across all views) */}
      <aside className="sidebar parchment-inset">
        <Roster
          units={units}
          deployedIds={deployedIds}
          afieldSoulIds={afieldSoulIds}
          lockedSoulIds={lockedSoulIds}
          selectedUnitId={selectedUnitId}
          dragState={dragState}
          onSelect={(id) => { setSelectedUnitId(id); setView("banners"); }}
          onDragStart={(e, payload) => {
            setDragState({ dragUnitId: payload.unitId, from: payload.from, partyId: payload.partyId, coord: payload.coord });
            e.dataTransfer.effectAllowed = "move";
            try { e.dataTransfer.setData("text/plain", payload.unitId); } catch(err){}
          }}
          onDragEnd={() => setDragState(null)}
          onDropToRoster={handleDropToRoster}
          onDragOverRoster={(on) => setDragState(ds => ds ? { ...ds, overRoster: on } : ds)}
        />
      </aside>

      {/* Main — view switch */}
      {view === "banners" && viewingUnitId && units.find(u=>u.id===viewingUnitId) && !lockedSoulIds.has(viewingUnitId) ? (
        (() => {
          const u = units.find(x=>x.id===viewingUnitId);
          const isForgeLeader = parties.some(p => p.leaderId === u.id);
          const isForgeAssigned = deployedIds.has(u.id);
          return (
            <UnitScreen
              unit={u}
              parties={parties}
              allUnits={units}
              doctrine={doctrines[u.id]}
              isLeader={isForgeLeader}
              assigned={isForgeAssigned}
              initialTab={forgeTab}
              training={training}
              onRename={(n) => handleRename(u.id, n)}
              onEquip={(slot, name) => handleEquip(u.id, slot, name)}
              onSetDoctrine={(d) => handleSetDoctrine(u.id, d)}
              onMakeLeader={() => handleMakeLeader(u.id)}
              onUnassign={() => handleUnassign(u.id)}
              onLearnSkill={(uid, sk) => handleLearnSkill(uid, sk)}
              onAssignMentor={handleAssignMentor}
              onCancelTraining={handleCancelTraining}
              onSetIntensity={handleSetIntensity}
              onChooseMastery={handleChooseMastery}
              onPromote={handlePromote}
              onTakeFeat={handleTakeFeat}
              onRemoveFeat={handleRemoveFeat}
              onAutoTune={handleAutoTune}
              onClose={() => setViewingUnitId(null)}
            />
          );
        })()
      ) : view === "banners" && (
        <main className="main">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8}}>
            <div>
              <div className="display" style={{fontSize:28, color:"var(--ink)"}}>The Four Banners</div>
              <div className="italic-note" style={{fontSize:13}}>
                Four parties ride where the Warden cannot. Click a banner to tune it; drag souls between them.
              </div>
            </div>
            <div style={{display:"flex", gap:6}}>
              <button className="btn ghost sm">Save muster</button>
              <button className="btn sm">Deploy →</button>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:14, marginTop:10}}>
            {parties.map(p => {
              if (afieldPartyIds.has(p.id)) {
                const info = afieldByPartyId[p.id];
                return (
                  <AfieldPartyCard
                    key={p.id}
                    party={p}
                    posting={info && info.posting}
                    returnDay={info && info.returnDay}
                    dispatchedDay={info && info.dispatchedDay}
                    currentDay={day}
                  />
                );
              }
              return (
              <PartyCard
                key={p.id}
                party={p}
                units={units}
                active={activePartyId === p.id}
                selectedUnitId={selectedUnitId}
                showGridLines={tweaks.showGridLines}
                dragState={dragState}
                onActivate={() => { setActivePartyId(p.id); setSelectedUnitId(null); }}
                onFormationChange={handleFormationChange}
                onSlotClick={(pid, coord, unit) => {
                  setActivePartyId(pid);
                  setSelectedUnitId(unit.id);
                }}
                onSlotDrop={handleSlotDrop}
                onDragStart={(e, payload) => {
                  setDragState({ dragUnitId: payload.unitId, from: payload.from, partyId: payload.partyId, coord: payload.coord });
                  e.dataTransfer.effectAllowed = "move";
                  try { e.dataTransfer.setData("text/plain", payload.unitId); } catch(err){}
                }}
                onDragEnd={() => setDragState(null)}
                onDragOverSlot={(pid, coord) => setDragState(ds => ds ? { ...ds, overSlot: `${pid}:${coord}` } : ds)}
                onDragLeaveSlot={() => setDragState(ds => ds ? { ...ds, overSlot: null } : ds)}
                onToggleDeploy={handleToggleDeploy}
                onTestBattle={(pid) => setBattleSimPartyId(pid)}
                staged={stagedAllyIds.includes(p.id)}
                canStageMore={stagedAllyIds.length < 3}
                onStage={(pid) => setStagedAllyIds(prev => prev.includes(pid) ? prev : (prev.length >= 3 ? prev : [...prev, pid]))}
                onUnstage={(pid) => setStagedAllyIds(prev => prev.filter(x => x !== pid))}
              />
              );
            })}
          </div>

          <div style={{marginTop:18, padding:"10px 12px", border:"1px dashed var(--rule)", borderRadius:2, fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-fade)", fontSize:12}}>
            "You are not assembling a team. You are keeping a household of souls."
          </div>
        </main>
      )}

      {view === "mustering" && (
        <MusteringGrounds
          pool={MUSTERING_POOL}
          treasury={treasury}
          selectedId={selectedRecruitId}
          recruitedIds={recruitedIds}
          onSelect={(id) => setSelectedRecruitId(id)}
        />
      )}

      {view === "stores" && !postingDetailOpen && (
        <StoresView
          units={units}
          parties={parties}
          treasury={treasury}
          storesStock={storesStock}
          onEquipUnit={handleEquip}
          onBuy={handleBuyItem}
          onAutoEquip={handleAutoEquipAll}
          postings={POSTINGS}
          postingAssignments={postingAssignments}
          sealedPostings={sealedPostings}
          onOpenPostingDetail={(id) => { setSelectedPostingId(id); setPostingDetailOpen(true); }}
          equipmentLayout={tweaks.equipmentLayout || "columns"}
          merchantVisible={tweaks.merchantVisible !== false}
        />
      )}

      {view === "stores" && postingDetailOpen && (
        <PostingBoard
          postings={POSTINGS}
          assignments={postingAssignments}
          sealed={sealedPostings}
          selectedId={selectedPostingId}
          onSelect={(id) => setSelectedPostingId(id)}
        />
      )}

      {/* Right — Context panel (depends on view) */}
      <aside className="sidebar right parchment-inset">
        {view === "banners" && viewingUnitId ? (
          <div>
            <div className="banner-rule"><span className="title">In the Forge</span></div>
            <div className="italic-note" style={{fontSize:12, padding:"8px 10px", lineHeight:1.5}}>
              You are tuning a single soul. Their Sheet, equipment, and battle doctrine are open in the main panel.
            </div>
            <div style={{borderTop:"1px dotted var(--rule)", margin:"10px 0"}}/>
            <div className="label" style={{fontSize:9.5, marginBottom:4}}>Also in the roster</div>
            <div style={{display:"flex", flexDirection:"column", gap:4}}>
              {units.filter(u => u.id !== viewingUnitId).slice(0, 10).map(u => (
                <button
                  key={u.id}
                  className="btn ghost sm"
                  onClick={() => setViewingUnitId(u.id)}
                  style={{justifyContent:"flex-start", textAlign:"left", padding:"4px 6px", textTransform:"none", letterSpacing:"0.02em", fontWeight:500, fontSize:11, display:"flex", gap:6, alignItems:"center"}}
                >
                  <Heraldry seed={u.id} sigil={u.sigil} size={16}/>
                  <span style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", minWidth:0, flex:1}}>{u.name.split(" ")[0]}</span>
                  <span style={{color:"var(--ink-fade)", fontSize:10}}>{u.cls}</span>
                </button>
              ))}
              {units.length > 11 && <div className="italic-note" style={{fontSize:10.5, padding:"4px 6px"}}>…and {units.length - 11} more.</div>}
            </div>
          </div>
        ) : view === "banners" && (
          selectedUnit ? (
            <UnitSheet
              unit={selectedUnit}
              isLeader={isLeader}
              assigned={selectedIsDeployed}
              onMakeLeader={() => handleMakeLeader(selectedUnit.id)}
              onUnassign={() => handleUnassign(selectedUnit.id)}
              onClose={() => setSelectedUnitId(null)}
              onOpenInForge={() => setViewingUnitId(selectedUnit.id)}
            />
          ) : (
            <StagingArea
              parties={parties}
              units={units}
              stagedAllyIds={stagedAllyIds}
              stagedFoeIds={stagedFoeIds}
              afieldPartyIds={afieldPartyIds}
              onUnstageAlly={(pid) => setStagedAllyIds(prev => prev.filter(x => x !== pid))}
              onToggleFoe={(fid) => setStagedFoeIds(prev => {
                if (prev.includes(fid)) {
                  if (prev.length === 1) return prev;
                  return prev.filter(x => x !== fid);
                }
                if (prev.length >= 3) return prev;
                return [...prev, fid];
              })}
              onLaunch={() => {
                if (stagedAllyIds.length === 0 || stagedFoeIds.length === 0) return;
                setBattleSimLaunch({
                  allyIds: [...stagedAllyIds],
                  foeIds: [...stagedFoeIds],
                });
              }}
              onClearStaging={() => setStagedAllyIds([])}
              onSelectPartyCard={(pid) => setActivePartyId(pid)}
            />
          )
        )}

        {view === "mustering" && (
          <MusterDetail
            recruit={selectedRecruit}
            canAfford={selectedRecruit && treasury >= selectedRecruit.price}
            recruited={selectedRecruit && recruitedIds.has(selectedRecruit.id)}
            onRecruit={() => selectedRecruit && handleRecruit(selectedRecruit.id)}
            onClose={() => setSelectedRecruitId(null)}
          />
        )}

        {view === "stores" && postingDetailOpen && (
          <div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
              <button className="btn ghost sm" onClick={() => { setPostingDetailOpen(false); setSelectedPostingId(null); }}>◄ Back to Stores</button>
            </div>
            <PostingDetail
              posting={selectedPosting}
              parties={parties}
              assignedIds={selectedPostingId ? (postingAssignments[selectedPostingId] || []) : []}
              sealed={selectedPostingId ? sealedPostings.has(selectedPostingId) : false}
              onToggleParty={handleTogglePartyOnPosting}
              onSeal={handleSealPosting}
              onBreak={handleBreakSeal}
            />
          </div>
        )}

        {view === "stores" && !postingDetailOpen && (
          <div>
            <div className="banner-rule"><span className="title">Quartermaster's Ledger</span></div>
            <div className="italic-note" style={{fontSize:12, padding:"8px 10px", lineHeight:1.5}}>
              The rack on the wall, the stall at the side door, the board by the lintel. Click an item to inspect; <strong>Equip →</strong> to assign; <strong>Buy</strong> to add to stores. <strong>Outfit the Household</strong> assigns the best fitting kit on hand to every soul.
            </div>
            <div style={{borderTop:"1px dotted var(--rule)", margin:"10px 0"}}/>
            <div className="label" style={{fontSize:9.5, marginBottom:6}}>Kit summary</div>
            {(() => {
              const slotCounts = { main:0, off:0, armor:0, locket:0 };
              units.forEach(u => {
                ["main","off","armor","locket"].forEach(s => {
                  if (u.gear && u.gear[s] && u.gear[s] !== "—") slotCounts[s]++;
                });
              });
              return (
                <div style={{display:"flex", flexDirection:"column", gap:3, fontSize:11.5}}>
                  {[
                    ["main","Main-hand","⚔"],
                    ["off","Off-hand","◈"],
                    ["armor","Armor","▥"],
                    ["locket","Locket","◉"],
                  ].map(([k,lbl,g]) => (
                    <div key={k} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"2px 0", borderBottom:"1px dotted var(--rule-faint)"}}>
                      <span style={{display:"inline-flex", alignItems:"center", gap:6}}><span style={{fontSize:13}}>{g}</span> {lbl}</span>
                      <span style={{fontFamily:"var(--mono)"}}><strong>{slotCounts[k]}</strong><span style={{color:"var(--ink-fade)"}}>/{units.length}</span> equipped</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div style={{borderTop:"1px dotted var(--rule)", margin:"12px 0 8px"}}/>
            <div className="italic-note" style={{fontSize:11, lineHeight:1.5}}>
              <strong style={{color:"var(--ink)"}}>◉ Postings</strong> — the board still hangs here. Pull the tab at the right edge of the Stores to read what's pinned.
            </div>
          </div>
        )}
      </aside>

      {resolutionLog && (
        <ResolutionModal log={resolutionLog} onClose={() => setResolutionLog(null)} />
      )}

      <Tweaks
        tweaks={tweaks}
        setTweaks={setTweaks}
        visible={tweaksOpen}
        onClose={()=>setTweaksOpen(false)}
      />

      {battleSimPartyId && !battleSimLaunch && (
        <BattleSimulator
          party={parties.find(p => p.id === battleSimPartyId)}
          allUnits={units}
          onClose={() => setBattleSimPartyId(null)}
        />
      )}

      {battleSimLaunch && (
        <BattleSimulator
          parties={battleSimLaunch.allyIds.map(id => parties.find(p => p.id === id)).filter(Boolean)}
          initialFoeIds={battleSimLaunch.foeIds}
          availableAllies={parties.filter(p => !afieldPartyIds.has(p.id))}
          allUnits={units}
          onClose={() => { setBattleSimLaunch(null); }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
