// SIGILBORNE — Party card with 3×3 formation

const { useState: usePCState } = React;

function rowForCoord(coord) { return parseInt(coord.split(",")[0], 10); }

// Compact doctrine bonus display — leader effect + retinue effect
function DoctrineBonusRows({ formation }) {
  if (!formation) return null;
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
  const Row = ({ glyph, who, tag, stats, note, tint }) => (
    <div style={{
      display:"flex", flexDirection:"column",
      padding:"3px 5px",
      borderLeft:`2px solid ${tint}`,
      background:"rgba(26,24,20,0.025)",
      marginTop:3,
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:6}}>
        <span style={{fontFamily:"var(--mono)", fontSize:8.5, letterSpacing:"0.12em", fontWeight:700, color: tint, whiteSpace:"nowrap"}}>
          {glyph} {who} · {tag}
        </span>
        <span style={{fontFamily:"var(--mono)", fontSize:9.5, fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap"}}>
          {stats}
        </span>
      </div>
      <div className="italic-note" style={{fontSize:10, lineHeight:1.25, marginTop:1}}>
        {note}
      </div>
    </div>
  );
  return (
    <div style={{marginTop:5}}>
      {formation.leaderBonus && (
        <Row
          glyph="⚑"
          who="LEADER"
          tag={formation.leaderBonus.tag}
          stats={fmtBonus(formation.leaderBonus)}
          note={formation.leaderBonus.note}
          tint="var(--gold-deep, #a8864a)"
        />
      )}
      {formation.retinueBonus && (
        <Row
          glyph="⚔"
          who="RETINUE"
          tag={formation.retinueBonus.tag}
          stats={fmtBonus(formation.retinueBonus)}
          note={formation.retinueBonus.note}
          tint="var(--ink-soft, #3d362c)"
        />
      )}
    </div>
  );
}

function FormationSlot({ coord, unit, modData, showCoord, isLeader, selected, onClick, onDragStart, onDragEnd, onDrop, onDragOver, onDragLeave, dropTarget }) {
  const row = rowForCoord(coord);
  const rowClass = row === 0 ? "highlight-front" : row === 1 ? "highlight-mid" : "highlight-back";
  const bonusText = modData ? [
    modData.atk ? `+${modData.atk}A` : null,
    modData.def ? `+${modData.def}D` : null,
    modData.mag ? `+${modData.mag}M` : null,
  ].filter(Boolean).join(" ") : "";

  return (
    <div
      className={`slot ${unit ? "" : "empty"} ${modData ? rowClass : ""} ${dropTarget ? "drop-target" : ""} ${selected ? "selected" : ""}`}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {showCoord && !unit && <span className="slot-coord">{modData?.lbl || ""}</span>}
      {bonusText && <span className="slot-bonus">{bonusText}</span>}
      {unit && (
        <div
          className={`unit-token ${isLeader ? "leader" : ""}`}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          title={`${unit.name} — ${unit.cls} · Lv${unit.lvl}${bonusText ? ` · ${bonusText}` : ""}`}
        >
          <Heraldry seed={unit.id} sigil={unit.sigil} size={40}/>
          <div className="unit-name">{unit.name.split(" ")[0]}</div>
          <div className="unit-hp-bar"><span style={{width:`${(unit.hp/unit.hpmax)*100}%`}}/></div>
        </div>
      )}
    </div>
  );
}

function FormationGrid({ party, units, selectedUnitId, showGridLines, dragState, onSlotClick, onSlotDrop, onDragStart, onDragEnd, onDragOverSlot, onDragLeaveSlot }) {
  const form = FORMATIONS[party.formation];
  const coords = [];
  for (let r=0; r<3; r++) for (let c=0; c<3; c++) coords.push(`${r},${c}`);

  return (
    <div className="formation" style={{borderLeft: showGridLines ? "1px solid var(--rule)" : "none", borderRight: showGridLines ? "1px solid var(--rule)" : "none"}}>
      {coords.map(coord => {
        const uId = party.grid[coord];
        const unit = uId ? units.find(u => u.id === uId) : null;
        const mod = form.slots[coord];
        const isLeader = uId && uId === party.leaderId;
        const selected = uId && uId === selectedUnitId;
        const dropTarget = dragState && dragState.overSlot === `${party.id}:${coord}`;
        return (
          <FormationSlot
            key={coord}
            coord={coord}
            unit={unit}
            modData={mod}
            showCoord={true}
            isLeader={isLeader}
            selected={selected}
            onClick={() => unit && onSlotClick && onSlotClick(party.id, coord, unit)}
            onDragStart={(e)=>onDragStart && onDragStart(e, { from:"party", partyId: party.id, coord, unitId: uId })}
            onDragEnd={onDragEnd}
            onDrop={(e)=>{ e.preventDefault(); onSlotDrop && onSlotDrop(party.id, coord); }}
            onDragOver={(e)=>{ e.preventDefault(); onDragOverSlot && onDragOverSlot(party.id, coord); }}
            onDragLeave={(e)=>onDragLeaveSlot && onDragLeaveSlot(party.id, coord)}
            dropTarget={dropTarget}
          />
        );
      })}
    </div>
  );
}

function FormationPreviewIcon({ formation }) {
  const f = FORMATIONS[formation];
  if (!f) return null;
  return (
    <span className="form-preview" aria-hidden="true">
      {f.preview.flat().map((v,i) => <i key={i} className={v ? "on" : ""}/>)}
    </span>
  );
}

function PartyCard({ party, units, active, selectedUnitId, showGridLines, dragState, onActivate, onFormationChange, onSlotClick, onSlotDrop, onDragStart, onDragEnd, onDragOverSlot, onDragLeaveSlot, onRename, onToggleDeploy, onTestBattle, staged, canStageMore, onStage, onUnstage }) {
  const present = Object.values(party.grid).filter(Boolean).map(id => units.find(u => u.id === id)).filter(Boolean);
  const roles = roleCounts(present);
  const leader = party.leaderId ? units.find(u => u.id === party.leaderId) : null;
  const cap = partyCapacity(party, units);
  const cmd = leader ? commandFor(leader) : 0;
  const overCap = present.length > cap;
  const deployed = !!party.deployed;
  const canDeploy = present.length > 0 && !!leader && !overCap;
  const stagingMode = !!onStage;
  const canStage = stagingMode && present.length > 0 && !!leader && !overCap && !deployed && (staged || canStageMore);
  const [side, setSide] = usePCState(0); // 0 = formation, 1 = everything else
  const flipTo = (next) => (e) => { e.stopPropagation(); setSide(next); };
  const stop = (e) => e.stopPropagation();

  return (
    <div className={`party-card ${active ? "active" : ""} ${deployed ? "deployed-banner" : ""} ${staged ? "staged-banner" : ""}`} onClick={onActivate}>
      {/* Persistent top strip (card chrome): banner name + status + flip */}
      <div className="party-card-top">
        <div className="party-card-top-name">
          <div className="party-name">{party.name}</div>
          {staged && <span className="status-pill status-staged">⚑ Staged</span>}
          {deployed && !staged && <span className="status-pill status-deployed">⚿ Deployed</span>}
        </div>
        <div className="card-flip-nav" onClick={stop}>
          <button className="card-flip-btn" onClick={flipTo(0)} title="Formation" style={{opacity: side === 0 ? 1 : 0.45}} aria-label="Show formation">◀</button>
          <span className="card-flip-dots">
            <i className="card-dot" style={{background: side === 0 ? "var(--ink)" : "var(--rule)"}}/>
            <i className="card-dot" style={{background: side === 1 ? "var(--ink)" : "var(--rule)"}}/>
          </span>
          <button className="card-flip-btn" onClick={flipTo(1)} title="Details" style={{opacity: side === 1 ? 1 : 0.45}} aria-label="Show details">▶</button>
        </div>
      </div>

      {side === 0 ? (
        /* SIDE A — formation grid only */
        <div className="party-card-side side-formation" onClick={stop}>
          <FormationGrid
            party={party}
            units={units}
            selectedUnitId={selectedUnitId}
            showGridLines={showGridLines}
            dragState={dragState}
            onSlotClick={deployed ? null : onSlotClick}
            onSlotDrop={deployed ? (()=>{}) : onSlotDrop}
            onDragStart={deployed ? (()=>{}) : onDragStart}
            onDragEnd={onDragEnd}
            onDragOverSlot={deployed ? (()=>{}) : onDragOverSlot}
            onDragLeaveSlot={onDragLeaveSlot}
          />
        </div>
      ) : (
        /* SIDE B — everything else */
        <div className="party-card-side side-details" onClick={stop}>
          {party.motto && (
            <div className="party-motto">&ldquo;{party.motto}&rdquo;</div>
          )}

          <div className="party-metrics">
            <div className="metric">
              <div className="metric-label">Souls</div>
              <div className="metric-val" style={{color: overCap ? "var(--blood)" : "var(--ink)"}}>
                {present.length}<span className="metric-dim">/{cap}</span>
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Command</div>
              <div className="metric-val" style={{color: leader ? "var(--gold-deep)" : "var(--ink-fade)"}}>
                {leader ? `◈ ${cmd}` : "—"}
              </div>
            </div>
          </div>

          <div className="card-section">
            <div className="label">Formation</div>
            <select
              className="select"
              value={party.formation}
              disabled={deployed}
              onChange={(e)=>{ e.stopPropagation(); onFormationChange(party.id, e.target.value); }}
              onClick={stop}
              style={{width:"100%", opacity: deployed ? 0.55 : 1, cursor: deployed ? "not-allowed" : undefined}}
            >
              {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div className="italic-note" style={{fontSize:11, marginTop:4}}>{FORMATIONS[party.formation].desc}</div>
            <DoctrineBonusRows formation={FORMATIONS[party.formation]}/>
          </div>

          <div className="card-section">
            <div className="label">Composition</div>
            <div className="role-tag-row">
              {Object.entries(roles).filter(([,v])=>v>0).length > 0
                ? Object.entries(roles).filter(([,v])=>v>0).map(([r,v])=>(
                    <span key={r} className={`tag ${r}`}>{r} ×{v}</span>
                  ))
                : <span className="italic-note" style={{fontSize:11}}>No souls yet.</span>}
            </div>
          </div>

          <div className="card-section">
            <div className="label">Leader</div>
            {leader ? (
              <div className="leader-line">
                <Heraldry seed={leader.id} sigil={leader.sigil} size={24}/>
                <div className="leader-info">
                  <div className="leader-name">{leader.name}</div>
                  <div className="leader-sub">aura · {leader.cls}</div>
                </div>
              </div>
            ) : (
              <div className="leader-none">No leader — Broken Banner risk.</div>
            )}
          </div>

          {(onToggleDeploy || stagingMode) && (
            <div className="card-footer">
              {staged ? (
                <button className="btn ghost sm" style={{width:"100%"}} onClick={(e)=>{ e.stopPropagation(); onUnstage && onUnstage(party.id); }} title="Remove this banner from the rehearsal staging">↩ Withdraw from staging</button>
              ) : deployed ? (
                <div style={{display:"flex", gap:6}}>
                  <button className="btn sm" style={{flex:1}} onClick={(e)=>{ e.stopPropagation(); onTestBattle && onTestBattle(party.id); }} title="Rehearse a battle with this banner">⚔ Test battle</button>
                  <button className="btn ghost sm" style={{flex:1}} onClick={(e)=>{ e.stopPropagation(); onToggleDeploy(party.id); }} title="Return to the muster">↩ Recall</button>
                </div>
              ) : stagingMode ? (
                <button className="btn sm" disabled={!canStage} style={{width:"100%", opacity: canStage ? 1 : 0.5, cursor: canStage ? "pointer" : "not-allowed"}} onClick={(e)=>{ e.stopPropagation(); if (canStage) onStage(party.id); }} title={!leader ? "Appoint a leader first" : overCap ? "Over capacity" : present.length === 0 ? "Add at least one soul" : !canStageMore ? "Staging is full" : "Move to staging"}>⚿ Deploy to staging →</button>
              ) : (
                <button className="btn sm" disabled={!canDeploy} style={{width:"100%", opacity: canDeploy ? 1 : 0.5, cursor: canDeploy ? "pointer" : "not-allowed"}} onClick={(e)=>{ e.stopPropagation(); if (canDeploy) onToggleDeploy(party.id); }} title={canDeploy ? "Lock this banner" : (!leader ? "Appoint a leader first" : overCap ? "Over capacity" : "Add at least one soul")}>⚿ Deploy banner →</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PartyCard, FormationPreviewIcon });
