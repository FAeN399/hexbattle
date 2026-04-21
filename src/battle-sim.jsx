// SIGILBORNE — Battle simulator overlay
// Pure diagnostic: no persistent state changes. Runs one battle, streams events
// into a chronicle log, shows both parties side-by-side with live HP bars.

const { useState: useBSState, useEffect: useBSEffect, useRef: useBSRef, useMemo: useBSMemo } = React;

// ---- Prose helpers ----
function attackVerb(e) {
  const mag = e.usesMag;
  const crit = e.crit;
  if (mag && crit) {
    return pick(e.attackerId, ["rends", "wracks", "unmakes", "scours"]);
  }
  if (mag) {
    return pick(e.attackerId, ["wounds", "burns", "withers", "strikes with song"]);
  }
  if (crit) {
    return pick(e.attackerId, ["cleaves", "breaks", "shatters", "gores"]);
  }
  return pick(e.attackerId, ["strikes", "cuts", "drives at", "presses"]);
}
function fallLine(name, side) {
  const pool = side === "ally"
    ? [`${name} falls — the banner shudders.`, `${name} is felled. The line buckles.`, `${name} is carried from the field.`]
    : [`${name} is down.`, `${name} falls.`, `${name} is cut down.`];
  return pick(name, pool);
}
function pick(seed, pool) {
  let h = 0; for (let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

function eventProse(e) {
  if (e.kind === "open") {
    return { main: `${e.ally.name} rides out against ${e.foe.name}.`, italic: e.foe.motto !== "—" ? `"${e.foe.motto}"` : "" };
  }
  if (e.kind === "round") {
    return { main: `— Round ${e.n} —`, italic: "", heading: true };
  }
  if (e.kind === "miss") {
    const t = e.usesMag ? "the working slides past" : "the blow glances";
    return { main: `${e.attackerName} reaches for ${e.targetName}, but ${t}.`, italic: "" };
  }
  if (e.kind === "hit") {
    const verb = attackVerb(e);
    const suffix = e.crit ? " — a clean breach." : "";
    return {
      main: `${e.attackerName} ${verb} ${e.targetName} for ${e.damage}${suffix}`,
      italic: "",
      attackerSide: e.attackerSide,
    };
  }
  if (e.kind === "fall") {
    return { main: fallLine(e.unitName, e.side), italic: "", fall: true, side: e.side };
  }
  if (e.kind === "end") {
    const line = e.winner === "ally" ? "The field is yours."
               : e.winner === "foe"  ? "The banner is broken."
               : "Both sides withdraw, bloodied.";
    return { main: `— ${line} —`, italic: `${e.rounds} rounds · ${e.allyAlive} of yours stand · ${e.foeAlive} of theirs`, heading: true };
  }
  return { main: "", italic: "" };
}

// ---- Grid slot for battle view ----
function BattleSlot({ coord, unit, side, liveState, isLeader, isActing, isTargeted, isDead, flash }) {
  const row = parseInt(coord.split(",")[0], 10);
  const rowClass = row === 0 ? "highlight-front" : row === 1 ? "highlight-mid" : "highlight-back";
  if (!unit) return <div className={`slot empty ${rowClass}`}/>;

  const hpData = liveState && liveState[unit.id];
  const hp = hpData ? hpData.hp : (unit.hp || unit.hpmax);
  const hpmax = hpData ? hpData.hpmax : unit.hpmax;
  const alive = hpData ? hpData.alive : true;
  const hpPct = alive ? Math.max(0.02, hp / hpmax) : 0;

  const border = isActing ? "2px solid var(--gold-deep, #a8864a)"
               : isTargeted ? "2px solid var(--blood, #7a1f1a)"
               : "1px solid var(--rule)";
  const opacity = !alive ? 0.32 : 1;

  return (
    <div className={`slot ${rowClass}`} style={{
      position:"relative", opacity,
      outline: border,
      outlineOffset: "-2px",
      background: isActing ? "rgba(168,134,74,0.15)" : isTargeted ? "rgba(122,31,26,0.10)" : undefined,
      transition: "background 0.2s ease, outline 0.15s ease",
    }}>
      <div className={`unit-token ${isLeader ? "leader" : ""}`} style={{cursor:"default"}}>
        <Heraldry seed={unit.id} sigil={unit.sigil} size={36}/>
        <div className="unit-name" style={{fontSize:10}}>{unit.name.split(" ")[0]}</div>
        <div className="unit-hp-bar"><span style={{width:`${hpPct*100}%`, background: alive ? undefined : "transparent"}}/></div>
        {!alive && (
          <div style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--blood)", fontFamily:"var(--serif)", fontSize:22, fontWeight:700,
            letterSpacing:"0.1em",
            background:"rgba(244,234,216,0.4)",
            pointerEvents:"none",
          }}>✕</div>
        )}
      </div>
      {flash != null && alive && (
        <div style={{
          position:"absolute", top:2, right:4,
          fontFamily:"var(--mono)", fontSize:11, fontWeight:700,
          color:"var(--blood)", textShadow:"0 0 4px rgba(244,234,216,0.9)",
          pointerEvents:"none",
          animation: "battleFlash 0.8s ease-out forwards",
        }}>-{flash}</div>
      )}
    </div>
  );
}

function BattleGrid({ party, allUnits, liveState, actingId, targetId, flashes, side }) {
  const coords = [];
  for (let r=0; r<3; r++) for (let c=0; c<3; c++) coords.push(`${r},${c}`);
  return (
    <div className="formation" style={{margin:"0 auto"}}>
      {coords.map(coord => {
        const uid = party.grid[coord];
        const unit = uid ? (allUnits.find(u => u.id === uid) || (party.units && party.units.find(u => u.id === uid))) : null;
        return (
          <BattleSlot
            key={coord}
            coord={coord}
            unit={unit}
            side={side}
            liveState={liveState}
            isLeader={uid === party.leaderId}
            isActing={uid && uid === actingId}
            isTargeted={uid && uid === targetId}
            isDead={liveState && liveState[uid] && !liveState[uid].alive}
            flash={flashes && uid ? flashes[uid] : null}
          />
        );
      })}
    </div>
  );
}

// ---- Main simulator ----
function BattleSimulator({ parties: partiesProp, party, allUnits, availableAllies, initialFoeIds, onClose }) {
  // Accept either { parties: [...] } (multi) or { party: {...} } (legacy single-party)
  const initialParties = partiesProp && partiesProp.length ? partiesProp : [party];
  const [allyParties, setAllyParties] = useBSState(initialParties);
  const [foeIds, setFoeIds] = useBSState(initialFoeIds && initialFoeIds.length ? initialFoeIds : ["bandit_pack"]);
  const [seed, setSeed] = useBSState(() => Math.floor(Math.random() * 1e9));
  const [battle, setBattle] = useBSState(null); // { events, winner, ... }
  const [eventIdx, setEventIdx] = useBSState(0);
  const [playing, setPlaying] = useBSState(false);
  const [speed, setSpeed] = useBSState(1); // 1, 2, 4, 0 (instant)
  const [liveState, setLiveState] = useBSState({}); // unitId -> {hp, hpmax, alive}
  const [actingId, setActingId] = useBSState(null);
  const [targetId, setTargetId] = useBSState(null);
  const [flashes, setFlashes] = useBSState({}); // unitId -> damage number
  const [summaryOpen, setSummaryOpen] = useBSState(false);
  // Only open the staging modal if the caller didn't pre-stage allies + foes.
  const [stagingOpen, setStagingOpen] = useBSState(() => !(partiesProp && partiesProp.length && initialFoeIds && initialFoeIds.length));
  const logRef = useBSRef(null);

  const foeCatalog = window.FOE_PARTIES || [];
  const foeParties = foeIds.map(id => foeCatalog.find(f => f.id === id)).filter(Boolean);
  const primaryFoe = foeParties[0] || foeCatalog[0];

  // Synthesize composite "ally" and "foe" pseudo-parties for components that still take a single party.
  const compositeAlly = useBSMemo(() => {
    if (!allyParties.length) return null;
    if (allyParties.length === 1) return allyParties[0];
    const grid = {};
    // Merge grids — use a row/col stamped with party index so coords don't collide.
    // For display we keep the per-party BattleGrid separate, but RosterPanel iterates grid values.
    allyParties.forEach((ap, pi) => {
      Object.entries(ap.grid).forEach(([c, uid]) => {
        if (uid) grid[`${pi}:${c}`] = uid;
      });
    });
    return {
      id: "__composite_ally",
      name: allyParties.map(ap => ap.name).join(" & "),
      motto: allyParties[0].motto,
      formation: allyParties.map(ap => ap.formation).join(" + "),
      leaderId: allyParties[0].leaderId,
      grid,
      _parties: allyParties,
    };
  }, [allyParties]);

  const compositeFoe = useBSMemo(() => {
    if (!foeParties.length) return null;
    if (foeParties.length === 1) return foeParties[0];
    const grid = {};
    const units = [];
    foeParties.forEach((fp, pi) => {
      Object.entries(fp.grid).forEach(([c, uid]) => {
        if (uid) grid[`${pi}:${c}`] = uid;
      });
      units.push(...fp.units);
    });
    return {
      id: "__composite_foe",
      name: foeParties.map(fp => fp.name).join(" & "),
      motto: foeParties[0].motto,
      formation: foeParties.map(fp => fp.formation).join(" + "),
      leaderId: foeParties[0].leaderId,
      tier: Math.max(...foeParties.map(fp => fp.tier || 1)),
      grid,
      units,
      _parties: foeParties,
    };
  }, [foeIds]);

  const foe = compositeFoe; // keep legacy var name for downstream

  // Run battle
  const runBattle = (newSeed) => {
    const s = typeof newSeed === "number" ? newSeed : seed;
    const unitsIndex = allUnits.reduce((m, u) => { m[u.id] = u; return m; }, {});
    const res = window.simulateBattle(allyParties, foeParties, unitsIndex, { seed: s });
    setBattle(res);
    setEventIdx(0);
    setPlaying(false);
    setActingId(null); setTargetId(null); setFlashes({});
    // Initialize live state to full HP
    const init = {};
    const allFoeUnits = foeParties.flatMap(fp => fp.units);
    [...allUnits, ...allFoeUnits].forEach(u => {
      init[u.id] = { hp: u.hpmax || u.hp || 20, hpmax: u.hpmax || u.hp || 20, alive: true };
    });
    setLiveState(init);
  };

  // Step one event
  const stepOne = () => {
    if (!battle) return;
    if (eventIdx >= battle.events.length) return;
    const e = battle.events[eventIdx];
    applyEvent(e);
    setEventIdx(i => i + 1);
  };

  const applyEvent = (e) => {
    if (e.kind === "hit" || e.kind === "miss") {
      setActingId(e.attackerId);
      setTargetId(e.targetId);
      if (e.kind === "hit") {
        setLiveState(prev => ({
          ...prev,
          [e.targetId]: { ...prev[e.targetId], hp: e.targetHp, alive: e.targetHp > 0 },
        }));
        setFlashes(prev => ({ ...prev, [e.targetId]: e.damage }));
        // Clear flash after a moment
        setTimeout(() => {
          setFlashes(prev => { const n = { ...prev }; delete n[e.targetId]; return n; });
        }, 800);
      }
    } else if (e.kind === "round") {
      setActingId(null); setTargetId(null);
    } else if (e.kind === "end") {
      setActingId(null); setTargetId(null);
    }
  };

  // Auto-play loop
  useBSEffect(() => {
    if (!playing || !battle) return;
    if (eventIdx >= battle.events.length) { setPlaying(false); return; }
    const e = battle.events[eventIdx];
    // Instant = speed 0
    if (speed === 0) {
      // Apply everything at once
      let i = eventIdx;
      while (i < battle.events.length) {
        applyEvent(battle.events[i]);
        i++;
      }
      setEventIdx(battle.events.length);
      setPlaying(false);
      return;
    }
    // Different delays by event kind
    let baseDelay = 900;
    if (e.kind === "round") baseDelay = 700;
    else if (e.kind === "hit") baseDelay = 950;
    else if (e.kind === "miss") baseDelay = 650;
    else if (e.kind === "fall") baseDelay = 750;
    else if (e.kind === "open" || e.kind === "end") baseDelay = 1200;
    const delay = Math.max(80, baseDelay / speed);
    const t = setTimeout(() => {
      applyEvent(e);
      setEventIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [playing, eventIdx, battle, speed]);

  // Scroll log to bottom when events appear
  useBSEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [eventIdx]);

  // Init first run on mount / foe / seed change — but only after staging closes.
  useBSEffect(() => { if (!stagingOpen) runBattle(); }, [foeIds.join(","), allyParties.map(p=>p.id).join(","), stagingOpen]);

  // Auto-open summary when battle concludes in real time
  useBSEffect(() => {
    if (battle && eventIdx >= battle.events.length && eventIdx > 0) {
      const t = setTimeout(() => setSummaryOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [eventIdx, battle]);

  const canStep = battle && eventIdx < battle.events.length;
  const endEvent = battle ? battle.events[battle.events.length - 1] : null;
  const finished = battle && eventIdx >= battle.events.length;

  const shownEvents = battle ? battle.events.slice(0, eventIdx) : [];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"var(--parchment, #f4ead8)",
      display:"flex", flexDirection:"column",
    }}>
      <div className="parchment" style={{
        flex:1, display:"flex", flexDirection:"column",
        padding:"14px 22px 16px",
        overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, borderBottom:"1px solid var(--rule)", paddingBottom:8}}>
          <div>
            <div className="display" style={{fontSize:22, color:"var(--ink)"}}>The Training Yard</div>
            <div className="italic-note" style={{fontSize:12}}>
              A diagnostic engagement. No souls are wounded, no coin spent. The fight is a rehearsal.
            </div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{fontFamily:"var(--serif)"}}>✕ Close</button>
        </div>

        {/* Staging summary + controls */}
        <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", paddingTop:6}}>
          <span className="label" style={{fontSize:10}}>Match</span>
          <span style={{
            fontFamily:"var(--serif)", fontSize:12.5, color:"var(--ink)",
            border:"1px solid var(--rule-strong)", padding:"3px 8px", background:"rgba(168,134,74,0.06)",
          }}>
            {allyParties.map(p => p.name).join(" + ")}
            <span style={{color:"var(--ink-fade)", margin:"0 8px"}}>vs</span>
            {foeParties.map(p => p.name).join(" + ")}
          </span>
          <button className="btn ghost sm" onClick={()=>setStagingOpen(true)} title="Change banners or foes">
            ⚑ Staging…
          </button>
          <span style={{width:1, height:18, background:"var(--rule)"}}/>
          <button className="btn sm" onClick={()=>{ const s = Math.floor(Math.random()*1e9); setSeed(s); runBattle(s); }}>
            ↻ New rehearsal
          </button>
          <button className="btn ghost sm" onClick={()=>runBattle(seed)} title="Re-run with same seed">
            ↺ Same seed
          </button>
          <span style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.08em"}}>
            seed · {seed}
          </span>

          <span style={{marginLeft:"auto", display:"flex", gap:6, alignItems:"center"}}>
            <button className="btn ghost sm" onClick={stepOne} disabled={!canStep} title="Reveal the next action">
              ▶ Step
            </button>
            {!playing ? (
              <button className="btn sm" onClick={()=>setPlaying(true)} disabled={!canStep}>
                ▶▶ Play
              </button>
            ) : (
              <button className="btn sm" onClick={()=>setPlaying(false)}>
                ‖ Pause
              </button>
            )}
            <div style={{display:"flex", border:"1px solid var(--rule)", borderRadius:2, overflow:"hidden"}}>
              {[1,2,4,0].map(s => (
                <button
                  key={s}
                  onClick={()=>setSpeed(s)}
                  style={{
                    fontFamily:"var(--mono)", fontSize:11, padding:"3px 8px",
                    background: speed === s ? "var(--ink)" : "transparent",
                    color: speed === s ? "var(--parchment)" : "var(--ink)",
                    border:"none", cursor:"pointer",
                    borderLeft: s !== 1 ? "1px solid var(--rule)" : "none",
                  }}
                  title={s === 0 ? "Resolve instantly" : `${s}× playback`}
                >{s === 0 ? "∞" : `${s}×`}</button>
              ))}
            </div>
          </span>
        </div>

        {/* Main arena */}
        <div style={{
          display:"grid", gridTemplateColumns:"320px 1fr 420px 1fr 320px", gap:14,
          flex:1, minHeight:0,
        }}>
          {/* Ally roster panel */}
          <RosterPanel side="ally" party={compositeAlly} allUnits={allUnits} liveState={liveState} actingId={actingId} targetId={targetId} shownEvents={shownEvents}/>

          {/* Ally grids — one per party, stacked */}
          <div style={{display:"flex", flexDirection:"column", gap:10, minWidth:0, borderLeft:"1px solid var(--rule)", borderRight:"1px solid var(--rule)", padding:"0 12px", overflowY:"auto"}}>
            {allyParties.map((ap, i) => {
              const scale = allyParties.length >= 3 ? 0.85 : allyParties.length === 2 ? 1.05 : 1.3;
              return (
                <div key={ap.id} style={{display:"flex", flexDirection:"column", gap:6, borderTop: i > 0 ? "1px dashed var(--rule-faint)" : "none", paddingTop: i > 0 ? 8 : 0}}>
                  <SideHeader party={ap} tier={null} liveState={liveState} side="ally" allUnits={allUnits}/>
                  <div style={{flex:"0 0 auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px 0"}}>
                    <div style={{transform:`scale(${scale})`, transformOrigin:"center"}}>
                      <BattleGrid
                        party={ap}
                        allUnits={allUnits}
                        liveState={liveState}
                        actingId={actingId}
                        targetId={targetId}
                        flashes={flashes}
                        side="ally"
                      />
                    </div>
                  </div>
                  <FormationStrip party={ap} side="ally"/>
                </div>
              );
            })}
          </div>

          {/* Chronicle log */}
          <div style={{
            border:"1px solid var(--ink)",
            background:"rgba(244,234,216,0.6)",
            display:"flex", flexDirection:"column", minHeight:0,
            boxShadow:"inset 0 0 0 1px rgba(26,24,20,0.04)",
          }}>
            <div style={{padding:"8px 12px", borderBottom:"1px solid var(--rule)", fontFamily:"var(--serif)", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--ink-fade)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span>Chronicle</span>
              <span style={{fontFamily:"var(--mono)", fontSize:10}}>
                {battle ? `${eventIdx}/${battle.events.length}` : ""}
              </span>
            </div>
            <div ref={logRef} style={{flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:7}}>
              {shownEvents.map((e, i) => {
                const p = eventProse(e);
                if (!p.main) return null;
                const isAction = e.kind === "hit" || e.kind === "miss";
                const fall = p.fall;
                return (
                  <div key={i} style={{
                    fontFamily:"var(--serif)",
                    fontSize: p.heading ? 12.5 : 14,
                    fontStyle: p.heading ? "italic" : "normal",
                    color: p.heading ? "var(--ink-fade)" : fall ? "var(--blood)" : "var(--ink)",
                    fontWeight: fall ? 600 : 400,
                    textAlign: p.heading ? "center" : "left",
                    letterSpacing: p.heading ? "0.05em" : "0",
                    borderLeft: isAction ? `2px solid ${p.attackerSide === "ally" ? "var(--gold-deep, #a8864a)" : "var(--blood)"}` : "none",
                    paddingLeft: isAction ? 8 : 0,
                    lineHeight: 1.45,
                  }}>
                    {p.main}
                    {p.italic && (
                      <div className="italic-note" style={{fontSize:11.5, marginTop:3}}>{p.italic}</div>
                    )}
                  </div>
                );
              })}
              {shownEvents.length === 0 && (
                <div className="italic-note" style={{fontSize:13, textAlign:"center", padding:"20px 0"}}>
                  Press Play or Step to begin the rehearsal.
                </div>
              )}
              {finished && endEvent && (
                <BattleSummaryCard
                  endEvent={endEvent}
                  party={compositeAlly}
                  foe={compositeFoe}
                  allUnits={allUnits}
                  shownEvents={shownEvents}
                  onExpand={() => setSummaryOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Foe grids — one per party, stacked */}
          <div style={{display:"flex", flexDirection:"column", gap:10, minWidth:0, borderLeft:"1px solid var(--rule)", borderRight:"1px solid var(--rule)", padding:"0 12px", overflowY:"auto"}}>
            {foeParties.map((fp, i) => {
              const scale = foeParties.length >= 3 ? 0.85 : foeParties.length === 2 ? 1.05 : 1.3;
              return (
                <div key={fp.id} style={{display:"flex", flexDirection:"column", gap:6, borderTop: i > 0 ? "1px dashed var(--rule-faint)" : "none", paddingTop: i > 0 ? 8 : 0}}>
                  <SideHeader party={fp} tier={fp.tier} liveState={liveState} side="foe" allUnits={fp.units}/>
                  <div style={{flex:"0 0 auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"4px 0"}}>
                    <div style={{transform:`scale(${scale})`, transformOrigin:"center"}}>
                      <BattleGrid
                        party={fp}
                        allUnits={fp.units}
                        liveState={liveState}
                        actingId={actingId}
                        targetId={targetId}
                        flashes={flashes}
                        side="foe"
                      />
                    </div>
                  </div>
                  <FormationStrip party={fp} side="foe"/>
                </div>
              );
            })}
          </div>

          {/* Foe roster panel */}
          <RosterPanel side="foe" party={compositeFoe} allUnits={compositeFoe.units} liveState={liveState} actingId={actingId} targetId={targetId} shownEvents={shownEvents}/>
        </div>

        {/* Telemetry footer */}
        <TelemetryFooter party={compositeAlly} foe={compositeFoe} allUnits={allUnits} liveState={liveState} shownEvents={shownEvents} finished={finished} endEvent={endEvent}/>

        <div style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em", borderTop:"1px dashed var(--rule)", paddingTop:6, textAlign:"center"}}>
          DIAGNOSTIC — NO CAMPAIGN STATE WILL CHANGE · SEED {seed}
        </div>
      </div>

      {summaryOpen && finished && endEvent && battle && (
        <BattleSummaryModal
          endEvent={endEvent}
          party={compositeAlly}
          foe={compositeFoe}
          allUnits={allUnits}
          events={battle.events}
          seed={seed}
          onClose={() => setSummaryOpen(false)}
          onRematch={() => { setSummaryOpen(false); const s = Math.floor(Math.random()*1e9); setSeed(s); runBattle(s); }}
        />
      )}

      {stagingOpen && (
        <StagingModal
          allyParties={allyParties}
          availableAllies={availableAllies || allyParties}
          foeIds={foeIds}
          foeCatalog={foeCatalog}
          onCancel={() => setStagingOpen(false)}
          onConfirm={(nextAllies, nextFoeIds) => {
            setAllyParties(nextAllies);
            setFoeIds(nextFoeIds);
            setStagingOpen(false);
          }}
        />
      )}
    </div>
  );
}

function countAlive(party, liveState, allUnits) {
  return Object.values(party.grid).filter(id => id && liveState[id] && liveState[id].alive).length;
}
function countAliveFoe(foeParty, liveState) {
  return foeParty.units.filter(u => liveState[u.id] && liveState[u.id].alive).length;
}

// ---- Side header ----
function SideHeader({ party, tier, liveState, side, allUnits }) {
  const totalSouls = party.units
    ? party.units.length
    : Object.values(party.grid).filter(Boolean).length;
  const standing = party.units
    ? party.units.filter(u => liveState[u.id] && liveState[u.id].alive).length
    : Object.values(party.grid).filter(id => id && liveState[id] && liveState[id].alive).length;
  const tint = side === "ally" ? "var(--gold-deep, #a8864a)" : "var(--blood)";
  return (
    <div style={{textAlign:"center", paddingBottom:6, borderBottom:"1px solid var(--rule-faint)"}}>
      <div style={{fontFamily:"var(--serif)", fontSize:18, fontWeight:600, color:"var(--ink)", letterSpacing:"0.02em"}}>
        {party.name}
      </div>
      <div className="italic-note" style={{fontSize:11.5, marginTop:2}}>
        {party.motto ? `"${party.motto}"` : (party.rumor || "")}
      </div>
      <div style={{display:"flex", gap:10, justifyContent:"center", marginTop:6, fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em"}}>
        {tier != null && <span style={{color:tint, fontWeight:700}}>TIER {tier}</span>}
        <span>{party.formation}</span>
        <span>{standing}/{totalSouls} STANDING</span>
      </div>
    </div>
  );
}

// ---- Formation strip: shows leader + retinue doctrine, plus row-fill indicator ----
function FormationStrip({ party, side }) {
  const formation = window.FORMATIONS && window.FORMATIONS[party.formation];
  const rows = [
    { name: "FRONT", r: 0 },
    { name: "MIDDLE", r: 1 },
    { name: "BACK", r: 2 },
  ];
  const fmtBonus = (b) => {
    if (!b) return "";
    const parts = [];
    if (b.atk) parts.push(`${b.atk>0?"+":""}${b.atk} ATK`);
    if (b.def) parts.push(`${b.def>0?"+":""}${b.def} DEF`);
    if (b.mag) parts.push(`${b.mag>0?"+":""}${b.mag} MAG`);
    if (b.spd) parts.push(`${b.spd>0?"+":""}${b.spd} SPD`);
    if (b.wrd) parts.push(`${b.wrd>0?"+":""}${b.wrd} WRD`);
    if (b.res) parts.push(`${b.res>0?"+":""}${b.res} RES`);
    return parts.join(" · ");
  };
  const tint = side === "ally" ? "var(--gold-deep, #a8864a)" : "var(--blood)";
  return (
    <div style={{display:"flex", flexDirection:"column", gap:6, paddingTop:6, borderTop:"1px solid var(--rule-faint)"}}>
      {/* Leader doctrine */}
      {formation && formation.leaderBonus && (
        <div style={{border:`1px solid ${tint}`, borderLeft:`3px solid ${tint}`, padding:"4px 6px", background:"rgba(244,234,216,0.5)"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
            <span style={{fontFamily:"var(--mono)", fontSize:9, color: tint, fontWeight:700, letterSpacing:"0.12em"}}>
              ⚑ {formation.leaderBonus.tag}
            </span>
            <span style={{fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink)", fontWeight:600}}>
              {fmtBonus(formation.leaderBonus)}
            </span>
          </div>
          <div className="italic-note" style={{fontSize:10, marginTop:1, lineHeight:1.25}}>
            {formation.leaderBonus.note}
          </div>
        </div>
      )}
      {/* Retinue doctrine */}
      {formation && formation.retinueBonus && (
        <div style={{border:"1px solid var(--rule)", borderLeft:`3px solid var(--ink-soft, #3d362c)`, padding:"4px 6px", background:"rgba(244,234,216,0.35)"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
            <span style={{fontFamily:"var(--mono)", fontSize:9, color:"var(--ink-soft, #3d362c)", fontWeight:700, letterSpacing:"0.12em"}}>
              ⚔ {formation.retinueBonus.tag}
            </span>
            <span style={{fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink)", fontWeight:600}}>
              {fmtBonus(formation.retinueBonus)}
            </span>
          </div>
          <div className="italic-note" style={{fontSize:10, marginTop:1, lineHeight:1.25}}>
            {formation.retinueBonus.note}
          </div>
        </div>
      )}
      {/* Row fill */}
      <div style={{display:"flex", flexDirection:"column", gap:3, marginTop:2}}>
        {rows.map(row => {
          const filled = [0,1,2].filter(c => party.grid[`${row.r},${c}`]).length;
          return (
            <div key={row.r} style={{display:"flex", alignItems:"center", gap:6, fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.08em"}}>
              <span style={{width:48, textAlign:"right"}}>{row.name}</span>
              <div style={{display:"flex", gap:3}}>
                {[0,1,2].map(c => (
                  <div key={c} style={{
                    width:10, height:5, borderRadius:1,
                    background: party.grid[`${row.r},${c}`] ? tint : "transparent",
                    border: "1px solid var(--rule)",
                  }}/>
                ))}
              </div>
              <span style={{marginLeft:"auto"}}>{filled}/3</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Roster panel: detailed per-soul stats ----
function RosterPanel({ side, party, allUnits, liveState, actingId, targetId, shownEvents }) {
  // For ally: iterate party.grid. For foe: iterate party.units (they're all in the grid)
  const unitIds = party.units
    ? party.units.map(u => u.id)
    : Object.values(party.grid).filter(Boolean);
  const unitLookup = (id) => {
    if (party.units) return party.units.find(u => u.id === id);
    return allUnits.find(u => u.id === id);
  };

  // Compute damage dealt / taken per soul from events
  const stats = {};
  unitIds.forEach(id => { stats[id] = { dealt: 0, taken: 0, hits: 0, misses: 0 }; });
  shownEvents.forEach(e => {
    if (e.kind === "hit") {
      if (stats[e.attackerId]) { stats[e.attackerId].dealt += e.damage; stats[e.attackerId].hits += 1; }
      if (stats[e.targetId]) { stats[e.targetId].taken += e.damage; }
    } else if (e.kind === "miss") {
      if (stats[e.attackerId]) { stats[e.attackerId].misses += 1; }
    }
  });

  const tint = side === "ally" ? "var(--gold-deep, #a8864a)" : "var(--blood)";
  return (
    <div style={{display:"flex", flexDirection:"column", gap:6, minWidth:0, minHeight:0}}>
      <div style={{
        fontFamily:"var(--serif)", fontSize:11, letterSpacing:"0.14em",
        textTransform:"uppercase", color:"var(--ink-fade)",
        borderBottom:"1px solid var(--rule)", paddingBottom:4,
        display:"flex", justifyContent:"space-between", alignItems:"baseline",
      }}>
        <span>{side === "ally" ? "Your Souls" : "Their Souls"}</span>
        <span style={{fontFamily:"var(--mono)", fontSize:9.5, color: tint}}>{unitIds.length} SOULS</span>
      </div>
      <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:5, paddingRight:4}}>
        {unitIds.map(id => {
          const u = unitLookup(id);
          if (!u) return null;
          const hpd = liveState[id];
          const hp = hpd ? hpd.hp : (u.hpmax || u.hp || 20);
          const hpmax = hpd ? hpd.hpmax : (u.hpmax || u.hp || 20);
          const alive = hpd ? hpd.alive : true;
          const hpPct = alive ? Math.max(0, hp / hpmax) : 0;
          const isActing = id === actingId;
          const isTarget = id === targetId;
          const s = stats[id] || { dealt:0, taken:0, hits:0, misses:0 };
          const acc = (s.hits + s.misses) > 0 ? Math.round(100 * s.hits / (s.hits + s.misses)) : null;
          const isLeader = id === party.leaderId;

          return (
            <div key={id} style={{
              padding:"6px 7px",
              border: isActing ? `1.5px solid ${tint}` : isTarget ? "1.5px solid var(--blood)" : "1px solid var(--rule)",
              background: isActing ? "rgba(168,134,74,0.08)" : isTarget ? "rgba(122,31,26,0.06)" : "rgba(244,234,216,0.4)",
              borderRadius:2,
              opacity: alive ? 1 : 0.5,
              display:"flex", flexDirection:"column", gap:4,
              position:"relative",
            }}>
              {/* Row 1: name + class + leader */}
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <Heraldry seed={id} sigil={u.sigil} size={20}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontFamily:"var(--serif)", fontSize:12.5, fontWeight: isLeader ? 700 : 500, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                    {isLeader && "⚑ "}{u.name}
                  </div>
                  <div style={{fontFamily:"var(--mono)", fontSize:9, color:"var(--ink-fade)", letterSpacing:"0.08em", textTransform:"uppercase"}}>
                    {u.cls || "—"}{u.trait ? ` · ${u.trait}` : ""}
                  </div>
                </div>
                {!alive && <span style={{fontFamily:"var(--serif)", fontSize:14, color:"var(--blood)", fontWeight:700}}>✕</span>}
              </div>
              {/* HP bar */}
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <div style={{flex:1, height:5, background:"rgba(26,24,20,0.12)", borderRadius:1, overflow:"hidden"}}>
                  <div style={{
                    height:"100%", width:`${hpPct*100}%`,
                    background: hpPct > 0.5 ? "var(--gold-deep, #a8864a)" : hpPct > 0.25 ? "#b8a042" : "var(--blood)",
                    transition:"width 0.3s ease, background 0.3s ease",
                  }}/>
                </div>
                <div style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink)", fontWeight:600, minWidth:42, textAlign:"right"}}>
                  {Math.max(0, hp)}/{hpmax}
                </div>
              </div>
              {/* Stats line */}
              <div style={{display:"flex", gap:6, fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.05em"}}>
                <span title="Attack">⚔{u.atk || 0}</span>
                <span title="Defense">✦{u.def || 0}</span>
                <span title="Magic">◊{u.mag || 0}</span>
                <span title="Speed">»{u.spd || 0}</span>
                <span style={{marginLeft:"auto"}} title="Damage dealt / taken · accuracy">
                  <span style={{color:"var(--ink)"}}>{s.dealt}d</span>
                  <span> / </span>
                  <span style={{color:"var(--blood)"}}>{s.taken}t</span>
                  {acc != null && <span style={{marginLeft:4, color:"var(--ink-fade)"}}>· {acc}%</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Telemetry footer: HP totals bars + round counter ----
function TelemetryFooter({ party, foe, allUnits, liveState, shownEvents, finished, endEvent }) {
  // Total HP remaining each side
  const allyIds = Object.values(party.grid).filter(Boolean);
  const foeIds = foe.units.map(u => u.id);
  const sumHp = (ids) => ids.reduce((sum, id) => {
    const s = liveState[id];
    return sum + (s ? Math.max(0, s.hp) : 0);
  }, 0);
  const sumHpMax = (ids) => ids.reduce((sum, id) => {
    const s = liveState[id];
    return sum + (s ? s.hpmax : 0);
  }, 0);
  const allyHp = sumHp(allyIds), allyMax = sumHpMax(allyIds);
  const foeHp = sumHp(foeIds), foeMax = sumHpMax(foeIds);
  const allyPct = allyMax ? allyHp / allyMax : 0;
  const foePct = foeMax ? foeHp / foeMax : 0;

  // Round tracking
  const lastRound = [...shownEvents].reverse().find(e => e.kind === "round");
  const roundN = lastRound ? lastRound.n : 0;

  // Running damage tallies
  const allyDealt = shownEvents.filter(e => e.kind === "hit" && e.attackerSide === "ally").reduce((s,e)=>s+e.damage,0);
  const foeDealt = shownEvents.filter(e => e.kind === "hit" && e.attackerSide === "foe").reduce((s,e)=>s+e.damage,0);
  const allyHits = shownEvents.filter(e => (e.kind === "hit" || e.kind === "miss") && e.attackerSide === "ally");
  const foeHits = shownEvents.filter(e => (e.kind === "hit" || e.kind === "miss") && e.attackerSide === "foe");
  const allyAcc = allyHits.length ? Math.round(100 * allyHits.filter(e=>e.kind==="hit").length / allyHits.length) : 0;
  const foeAcc = foeHits.length ? Math.round(100 * foeHits.filter(e=>e.kind==="hit").length / foeHits.length) : 0;

  return (
    <div style={{
      display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:16,
      alignItems:"center",
      padding:"10px 14px",
      border:"1px solid var(--rule)",
      background:"rgba(26,24,20,0.03)",
      marginTop:8,
    }}>
      {/* Ally HP bar + stats */}
      <div>
        <div style={{display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em", marginBottom:3}}>
          <span>{party.name.toUpperCase()}</span>
          <span>{allyHp} / {allyMax} HP · {allyDealt} DMG · {allyAcc}% ACC</span>
        </div>
        <div style={{height:10, background:"rgba(26,24,20,0.1)", borderRadius:1, overflow:"hidden", border:"1px solid var(--rule)"}}>
          <div style={{height:"100%", width:`${allyPct*100}%`, background:"var(--gold-deep, #a8864a)", transition:"width 0.3s ease"}}/>
        </div>
      </div>

      {/* Round badge */}
      <div style={{textAlign:"center", padding:"0 14px"}}>
        <div style={{fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.14em"}}>ROUND</div>
        <div style={{fontFamily:"var(--serif)", fontSize:24, fontWeight:700, color:"var(--ink)", lineHeight:1}}>
          {roundN || "—"}
        </div>
      </div>

      {/* Foe HP bar + stats */}
      <div>
        <div style={{display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em", marginBottom:3}}>
          <span>{foeAcc}% ACC · {foeDealt} DMG · {foeHp} / {foeMax} HP</span>
          <span>{foe.name.toUpperCase()}</span>
        </div>
        <div style={{height:10, background:"rgba(26,24,20,0.1)", borderRadius:1, overflow:"hidden", border:"1px solid var(--rule)", direction:"rtl"}}>
          <div style={{height:"100%", width:`${foePct*100}%`, background:"var(--blood)", transition:"width 0.3s ease"}}/>
        </div>
      </div>
    </div>
  );
}

// ---- Stats aggregation from event log ----
function aggregateStats(events, allyUnits, foeUnits) {
  const allUnits = [...allyUnits, ...foeUnits];
  const index = allUnits.reduce((m, u) => { m[u.id] = u; return m; }, {});
  const stats = {};
  allUnits.forEach(u => {
    stats[u.id] = {
      id: u.id, name: u.name, cls: u.cls, sigil: u.sigil,
      side: allyUnits.find(a => a.id === u.id) ? "ally" : "foe",
      dealt: 0, taken: 0,
      physDealt: 0, magDealt: 0,
      hits: 0, misses: 0, crits: 0, kills: 0,
      targeted: 0, dodged: 0,
      fellAt: null,
    };
  });
  let roundIdx = 0;
  events.forEach(e => {
    if (e.kind === "round") roundIdx = e.n;
    if (e.kind === "hit") {
      const s = stats[e.attackerId]; const t = stats[e.targetId];
      if (s) { s.dealt += e.damage; s.hits += 1; if (e.crit) s.crits += 1; if (e.usesMag) s.magDealt += e.damage; else s.physDealt += e.damage; if (e.killed) s.kills += 1; }
      if (t) { t.taken += e.damage; t.targeted += 1; }
    } else if (e.kind === "miss") {
      const s = stats[e.attackerId]; const t = stats[e.targetId];
      if (s) { s.misses += 1; }
      if (t) { t.dodged += 1; t.targeted += 1; }
    } else if (e.kind === "fall") {
      if (stats[e.unitId]) stats[e.unitId].fellAt = roundIdx;
    }
  });
  return { stats, index };
}

// ---- Inline end card (in chronicle) ----
function BattleSummaryCard({ endEvent, party, foe, allUnits, shownEvents, onExpand }) {
  const { stats } = aggregateStats(shownEvents, allUnits, foe.units);
  // MVP on ally side: most dealt
  const allyStats = Object.values(stats).filter(s => s.side === "ally");
  const foeStats = Object.values(stats).filter(s => s.side === "foe");
  const allyMvp = [...allyStats].sort((a,b) => b.dealt - a.dealt)[0];
  const foeMvp = [...foeStats].sort((a,b) => b.dealt - a.dealt)[0];
  const allyDealt = allyStats.reduce((s,x) => s+x.dealt, 0);
  const foeDealt  = foeStats.reduce((s,x) => s+x.dealt, 0);

  const titleBlock = endEvent.winner === "ally" ? { label: "⚜ Victory — the banner stands.", bg: "rgba(168,134,74,0.14)", border: "var(--gold-deep, #a8864a)" }
                   : endEvent.winner === "foe"  ? { label: "✕ Defeat — the banner falls.",   bg: "rgba(122,31,26,0.10)",   border: "var(--blood)" }
                   : { label: "≈ A bloody draw.", bg: "rgba(26,24,20,0.04)", border: "var(--ink)" };

  return (
    <div style={{
      marginTop:10, padding:"10px 12px",
      border:`1px solid ${titleBlock.border}`, borderRadius:2,
      background: titleBlock.bg,
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5}}>
        <div style={{fontFamily:"var(--serif)", fontSize:15, fontWeight:600, color:"var(--ink)"}}>
          {titleBlock.label}
        </div>
        <button className="btn ghost sm" onClick={onExpand} style={{fontSize:10}}>
          ▤ Full report →
        </button>
      </div>
      <div style={{fontFamily:"var(--mono)", fontSize:10.5, color:"var(--ink-fade)", letterSpacing:"0.08em", marginBottom:6}}>
        {endEvent.rounds} rounds · {endEvent.allyAlive}/{(endEvent.allyAlive + endEvent.allyFallen.length)} yours · {endEvent.foeAlive}/{(endEvent.foeAlive + endEvent.foeFallen.length)} theirs · {allyDealt}/{foeDealt} dmg
      </div>
      {allyMvp && allyMvp.dealt > 0 && (
        <div style={{fontFamily:"var(--serif)", fontSize:12, color:"var(--ink)", marginBottom:2}}>
          <span style={{color:"var(--gold-deep,#a8864a)", fontWeight:700}}>✦ </span>
          <b>{allyMvp.name}</b> · {allyMvp.dealt} dmg · {allyMvp.hits} hits{allyMvp.crits?`, ${allyMvp.crits} crit${allyMvp.crits>1?"s":""}`:""}{allyMvp.kills?`, ${allyMvp.kills} kill${allyMvp.kills>1?"s":""}`:""}
        </div>
      )}
      {foeMvp && foeMvp.dealt > 0 && (
        <div style={{fontFamily:"var(--serif)", fontSize:12, color:"var(--ink)"}}>
          <span style={{color:"var(--blood)", fontWeight:700}}>✦ </span>
          <b>{foeMvp.name}</b> · {foeMvp.dealt} dmg · {foeMvp.hits} hits{foeMvp.crits?`, ${foeMvp.crits} crit${foeMvp.crits>1?"s":""}`:""}{foeMvp.kills?`, ${foeMvp.kills} kill${foeMvp.kills>1?"s":""}`:""}
        </div>
      )}
      {endEvent.allyFallen.length > 0 && (
        <div className="italic-note" style={{fontSize:11.5, marginTop:6, color:"var(--blood)"}}>
          Fallen: {endEvent.allyFallen.map(f => f.name).join(", ")}
        </div>
      )}
    </div>
  );
}

// ---- Full summary modal ----
function BattleSummaryModal({ endEvent, party, foe, allUnits, events, seed, onClose, onRematch }) {
  const { stats } = aggregateStats(events, allUnits, foe.units);
  const allyStats = Object.values(stats).filter(s => s.side === "ally");
  const foeStats = Object.values(stats).filter(s => s.side === "foe");
  const allyDealt = allyStats.reduce((s,x) => s+x.dealt, 0);
  const foeDealt  = foeStats.reduce((s,x) => s+x.dealt, 0);
  const allyHits  = allyStats.reduce((s,x) => s+x.hits, 0);
  const foeHits   = foeStats.reduce((s,x) => s+x.hits, 0);
  const allyMiss  = allyStats.reduce((s,x) => s+x.misses, 0);
  const foeMiss   = foeStats.reduce((s,x) => s+x.misses, 0);
  const allyCrits = allyStats.reduce((s,x) => s+x.crits, 0);
  const foeCrits  = foeStats.reduce((s,x) => s+x.crits, 0);
  const allyKills = allyStats.reduce((s,x) => s+x.kills, 0);
  const foeKills  = foeStats.reduce((s,x) => s+x.kills, 0);
  const allyAcc = (allyHits + allyMiss) ? Math.round(100 * allyHits / (allyHits + allyMiss)) : 0;
  const foeAcc  = (foeHits + foeMiss) ? Math.round(100 * foeHits / (foeHits + foeMiss)) : 0;

  // MVP, top damage dealer, top defender (most damage absorbed while alive), etc
  const topDealer = [...Object.values(stats)].sort((a,b) => b.dealt - a.dealt)[0];
  const topTaken  = [...Object.values(stats)].sort((a,b) => b.taken - a.taken)[0];
  const mostCrits = [...Object.values(stats)].sort((a,b) => b.crits - a.crits)[0];
  const mostKills = [...Object.values(stats)].sort((a,b) => b.kills - a.kills)[0];

  const title = endEvent.winner === "ally" ? { text: "Victory", glyph: "⚜", accent: "var(--gold-deep, #a8864a)", sub: "The banner stands. The field is yours." }
              : endEvent.winner === "foe"  ? { text: "Defeat",  glyph: "✕", accent: "var(--blood)",                  sub: "The banner falls. The line is broken." }
              : { text: "Draw", glyph: "≈", accent: "var(--ink)", sub: "Both sides withdraw, bloodied." };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1100,
      background:"rgba(20,18,14,0.72)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px",
    }} onClick={onClose}>
      <div className="parchment" onClick={(e)=>e.stopPropagation()} style={{
        width:"min(1100px, 96vw)", maxHeight:"92vh",
        padding:"18px 22px", borderRadius:3, border:`2px solid ${title.accent}`,
        display:"flex", flexDirection:"column", gap:12, overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, borderBottom:`1px solid var(--rule)`, paddingBottom:10}}>
          <div>
            <div style={{display:"flex", alignItems:"baseline", gap:10}}>
              <div style={{fontFamily:"var(--serif)", fontSize:34, fontWeight:700, color: title.accent, letterSpacing:"0.04em", lineHeight:1}}>
                {title.glyph} {title.text}
              </div>
              <div style={{fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-fade)", letterSpacing:"0.12em"}}>
                AFTER-ACTION REPORT
              </div>
            </div>
            <div className="italic-note" style={{fontSize:13, marginTop:4}}>{title.sub}</div>
            <div style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em", marginTop:4}}>
              {party.name} vs {foe.name} · {endEvent.rounds} rounds · seed {seed}
            </div>
          </div>
          <button className="btn ghost sm" onClick={onClose}>✕ Close</button>
        </div>

        {/* Side totals */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
          <SideTotals side="ally" label={party.name} accent="var(--gold-deep, #a8864a)"
            dealt={allyDealt} hits={allyHits} misses={allyMiss} crits={allyCrits} kills={allyKills} acc={allyAcc}
            standing={endEvent.allyAlive} total={endEvent.allyAlive + endEvent.allyFallen.length}
            fallen={endEvent.allyFallen}/>
          <SideTotals side="foe" label={foe.name} accent="var(--blood)"
            dealt={foeDealt} hits={foeHits} misses={foeMiss} crits={foeCrits} kills={foeKills} acc={foeAcc}
            standing={endEvent.foeAlive} total={endEvent.foeAlive + endEvent.foeFallen.length}
            fallen={endEvent.foeFallen}/>
        </div>

        {/* Superlatives */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10}}>
          <Superlative label="Highest Damage" name={topDealer?.name} value={`${topDealer?.dealt||0} dmg`} side={topDealer?.side}/>
          <Superlative label="Took the Brunt" name={topTaken?.name} value={`${topTaken?.taken||0} taken`} side={topTaken?.side}/>
          <Superlative label="Most Crits" name={mostCrits?.crits ? mostCrits.name : "—"} value={mostCrits?.crits ? `${mostCrits.crits} crit${mostCrits.crits>1?"s":""}` : "none"} side={mostCrits?.side}/>
          <Superlative label="Most Felled" name={mostKills?.kills ? mostKills.name : "—"} value={mostKills?.kills ? `${mostKills.kills} kill${mostKills.kills>1?"s":""}` : "none"} side={mostKills?.side}/>
        </div>

        {/* Per-soul table */}
        <div style={{flex:1, overflowY:"auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, minHeight:0}}>
          <SoulTable title={party.name} rows={allyStats} accent="var(--gold-deep, #a8864a)"/>
          <SoulTable title={foe.name} rows={foeStats} accent="var(--blood)"/>
        </div>

        {/* Footer */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid var(--rule)", paddingTop:10}}>
          <div style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.1em"}}>
            DIAGNOSTIC — NO CAMPAIGN STATE CHANGED
          </div>
          <div style={{display:"flex", gap:6}}>
            <button className="btn ghost sm" onClick={onClose}>Review the field</button>
            <button className="btn sm" onClick={onRematch}>↻ New rehearsal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideTotals({ side, label, accent, dealt, hits, misses, crits, kills, acc, standing, total, fallen }) {
  return (
    <div style={{border:`1px solid ${accent}`, borderRadius:2, padding:"10px 12px", background:"rgba(244,234,216,0.5)"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", borderBottom:"1px solid var(--rule-faint)", paddingBottom:5, marginBottom:7}}>
        <div style={{fontFamily:"var(--serif)", fontSize:15, fontWeight:600, color:"var(--ink)"}}>{label}</div>
        <div style={{fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.1em", color: accent, fontWeight:700}}>{standing}/{total} STANDING</div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, fontFamily:"var(--mono)", fontSize:11, color:"var(--ink)"}}>
        <StatTile label="TOTAL DMG" value={dealt}/>
        <StatTile label="ACCURACY" value={`${acc}%`}/>
        <StatTile label="HITS / MISS" value={`${hits} / ${misses}`}/>
        <StatTile label="CRITICALS" value={crits}/>
        <StatTile label="KILLS" value={kills}/>
        <StatTile label="FELLED" value={fallen.length}/>
      </div>
      {fallen.length > 0 && (
        <div className="italic-note" style={{fontSize:11, marginTop:7, color:"var(--blood)"}}>
          Fallen: {fallen.map(f => f.name).join(", ")}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div style={{border:"1px solid var(--rule-faint)", padding:"5px 7px", background:"rgba(244,234,216,0.3)"}}>
      <div style={{fontSize:9, color:"var(--ink-fade)", letterSpacing:"0.1em"}}>{label}</div>
      <div style={{fontSize:16, fontWeight:700, color:"var(--ink)", lineHeight:1.1, marginTop:1}}>{value}</div>
    </div>
  );
}

function Superlative({ label, name, value, side }) {
  const accent = side === "ally" ? "var(--gold-deep, #a8864a)" : side === "foe" ? "var(--blood)" : "var(--ink-fade)";
  return (
    <div style={{border:"1px solid var(--rule)", padding:"7px 10px", background:"rgba(244,234,216,0.4)", borderTop:`3px solid ${accent}`}}>
      <div style={{fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.14em", textTransform:"uppercase"}}>{label}</div>
      <div style={{fontFamily:"var(--serif)", fontSize:14, fontWeight:600, color:"var(--ink)", marginTop:2, lineHeight:1.15}}>{name || "—"}</div>
      <div style={{fontFamily:"var(--mono)", fontSize:10.5, color: accent, marginTop:1, letterSpacing:"0.04em"}}>{value}</div>
    </div>
  );
}

function SoulTable({ title, rows, accent }) {
  const sorted = [...rows].sort((a,b) => b.dealt - a.dealt);
  return (
    <div style={{display:"flex", flexDirection:"column", minHeight:0}}>
      <div style={{fontFamily:"var(--serif)", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", color: accent, fontWeight:700, paddingBottom:4, borderBottom:`1px solid ${accent}`}}>
        {title} · Per-Soul Breakdown
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1.5fr repeat(6, 1fr)", fontFamily:"var(--mono)", fontSize:9.5, color:"var(--ink-fade)", letterSpacing:"0.1em", padding:"5px 4px", borderBottom:"1px solid var(--rule-faint)", textTransform:"uppercase"}}>
        <span>Soul</span>
        <span style={{textAlign:"right"}}>DMG</span>
        <span style={{textAlign:"right"}}>Taken</span>
        <span style={{textAlign:"right"}}>Hit/Miss</span>
        <span style={{textAlign:"right"}}>Crit</span>
        <span style={{textAlign:"right"}}>Kills</span>
        <span style={{textAlign:"right"}}>Status</span>
      </div>
      <div style={{overflowY:"auto", flex:1, minHeight:0}}>
        {sorted.map(r => (
          <div key={r.id} style={{
            display:"grid", gridTemplateColumns:"1.5fr repeat(6, 1fr)",
            fontFamily:"var(--mono)", fontSize:11, padding:"5px 4px",
            borderBottom:"1px dashed var(--rule-faint)",
            alignItems:"center",
            color: r.fellAt ? "var(--ink-fade)" : "var(--ink)",
            opacity: r.fellAt ? 0.7 : 1,
          }}>
            <span style={{fontFamily:"var(--serif)", fontSize:12, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
              {r.name}
              <span style={{fontFamily:"var(--mono)", fontSize:9, color:"var(--ink-fade)", marginLeft:4, letterSpacing:"0.06em"}}>{r.cls}</span>
            </span>
            <span style={{textAlign:"right", fontWeight:700}}>{r.dealt}</span>
            <span style={{textAlign:"right"}}>{r.taken}</span>
            <span style={{textAlign:"right"}}>{r.hits}/{r.misses}</span>
            <span style={{textAlign:"right", color: r.crits ? accent : "var(--ink-fade)"}}>{r.crits || "·"}</span>
            <span style={{textAlign:"right", color: r.kills ? accent : "var(--ink-fade)"}}>{r.kills || "·"}</span>
            <span style={{textAlign:"right", fontSize:10, color: r.fellAt ? "var(--blood)" : "var(--ink)"}}>
              {r.fellAt ? `fell R${r.fellAt}` : "stood"}
            </span>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="italic-note" style={{fontSize:11, textAlign:"center", padding:10}}>No souls recorded.</div>
        )}
      </div>
    </div>
  );
}

// ---- Staging modal — choose 1–3 ally banners and 1–3 foe banners ----
function StagingModal({ allyParties, availableAllies, foeIds, foeCatalog, onCancel, onConfirm }) {
  const [selAlly, setSelAlly] = useBSState(() => allyParties.map(p => p.id));
  const [selFoe,  setSelFoe ] = useBSState(() => [...foeIds]);

  const toggleAlly = (id) => {
    setSelAlly(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // must keep at least one
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };
  const toggleFoe = (id) => {
    setSelFoe(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const canConfirm = selAlly.length >= 1 && selAlly.length <= 3 && selFoe.length >= 1 && selFoe.length <= 3;

  const confirm = () => {
    if (!canConfirm) return;
    const alliesOrdered = selAlly.map(id => availableAllies.find(p => p.id === id)).filter(Boolean);
    onConfirm(alliesOrdered, selFoe);
  };

  const PartyTile = ({ party, selected, disabled, onToggle, accent }) => {
    const count = party.grid ? Object.values(party.grid).filter(Boolean).length : (party.units ? party.units.length : 0);
    return (
      <button
        onClick={onToggle}
        disabled={disabled}
        style={{
          textAlign:"left",
          padding:"9px 12px",
          border: selected ? `2px solid ${accent}` : "1px solid var(--rule)",
          background: selected ? "rgba(168,134,74,0.08)" : disabled ? "rgba(26,24,20,0.02)" : "var(--parchment)",
          fontFamily:"var(--serif)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          display:"flex", flexDirection:"column", gap:2,
          minWidth:0,
        }}
      >
        <div style={{display:"flex", alignItems:"center", gap:6}}>
          <span style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:16, height:16, border:`1.5px solid ${selected ? accent : "var(--rule)"}`,
            color: selected ? accent : "transparent", fontSize:11, fontFamily:"var(--mono)", lineHeight:1,
          }}>✓</span>
          <span style={{fontSize:13.5, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{party.name}</span>
          {party.tier && <span style={{marginLeft:"auto", fontFamily:"var(--mono)", fontSize:10, color:accent, letterSpacing:"0.1em"}}>T{party.tier}</span>}
        </div>
        <div style={{fontSize:11, color:"var(--ink-fade)", fontStyle:"italic", paddingLeft:22, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          {party.motto ? `"${party.motto}"` : (party.rumor || "")}
        </div>
        <div style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)", letterSpacing:"0.08em", paddingLeft:22}}>
          {party.formation} · {count} souls
        </div>
      </button>
    );
  };

  return (
    <div
      style={{
        position:"fixed", inset:0, background:"rgba(10,8,5,0.7)",
        zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
      }}
      onClick={onCancel}
    >
      <div
        className="parchment parchment-inset"
        onClick={(e)=>e.stopPropagation()}
        style={{
          width:"min(1100px, 100%)", maxHeight:"90vh", overflow:"auto",
          padding:"22px 28px",
          border:"1px solid var(--rule-strong)",
          boxShadow:"0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{borderBottom:"2px solid var(--ink)", paddingBottom:10, marginBottom:14}}>
          <div className="label-lg" style={{fontSize:11, letterSpacing:"0.18em", color:"var(--gold-deep)"}}>⚑ BATTLE STAGING</div>
          <div className="display" style={{fontSize:24, color:"var(--ink)", marginTop:4}}>
            Choose the banners on the field
          </div>
          <div className="italic-note" style={{fontSize:12.5, marginTop:4, lineHeight:1.5}}>
            Up to three of your banners may ride side-by-side. Up to three adversary bands may gather against them. Each banner keeps its own formation and leader.
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18}}>
          {/* Ally side */}
          <div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
              <div className="label-lg" style={{fontSize:11, letterSpacing:"0.16em", color:"var(--gold-deep)"}}>⚑ YOUR BANNERS</div>
              <span style={{fontFamily:"var(--mono)", fontSize:10.5, color:"var(--ink-fade)", letterSpacing:"0.1em"}}>
                {selAlly.length}/3 SELECTED
              </span>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {availableAllies.map(p => {
                const sel = selAlly.includes(p.id);
                const disabled = !sel && selAlly.length >= 3;
                return (
                  <PartyTile
                    key={p.id}
                    party={p}
                    selected={sel}
                    disabled={disabled}
                    onToggle={()=>toggleAlly(p.id)}
                    accent="var(--gold-deep, #a8864a)"
                  />
                );
              })}
            </div>
          </div>

          {/* Foe side */}
          <div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
              <div className="label-lg" style={{fontSize:11, letterSpacing:"0.16em", color:"var(--blood)"}}>✕ ADVERSARIES</div>
              <span style={{fontFamily:"var(--mono)", fontSize:10.5, color:"var(--ink-fade)", letterSpacing:"0.1em"}}>
                {selFoe.length}/3 SELECTED
              </span>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {foeCatalog.map(p => {
                const sel = selFoe.includes(p.id);
                const disabled = !sel && selFoe.length >= 3;
                return (
                  <PartyTile
                    key={p.id}
                    party={p}
                    selected={sel}
                    disabled={disabled}
                    onToggle={()=>toggleFoe(p.id)}
                    accent="var(--blood)"
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:18, borderTop:"1px dashed var(--rule)", paddingTop:12}}>
          <button className="btn ghost sm" onClick={onCancel}>Cancel</button>
          <button className="btn sm" onClick={confirm} disabled={!canConfirm}>
            ⚔ Begin rehearsal
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BattleSimulator });