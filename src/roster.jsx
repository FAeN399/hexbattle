// SIGILBORNE — Warden's Roster sidebar

function RosterRow({ unit, state, selected, onClick, onDragStart, onDragEnd, dragging }) {
  // state: 'reserve' | 'bannered' | 'deployed' | 'afield'
  const afield = state === "afield";
  const deployedLock = state === "deployed";
  const bannered = state === "bannered";
  const draggable = state === "reserve" || state === "bannered";
  const locked = afield || deployedLock;
  const title = afield ? `${unit.name} — afield, cannot be edited`
              : deployedLock ? `${unit.name} — banner is deployed; recall to edit`
              : bannered ? `${unit.name} — bannered (drag to re-slot)`
              : `${unit.name} — drag to a slot`;
  const badge = afield ? "afield" : deployedLock ? "locked" : bannered ? "●" : "drag";
  return (
    <div
      className={`roster-row ${afield ? "afield" : ""} ${deployedLock ? "deployed" : ""} ${bannered ? "bannered" : ""} ${dragging ? "dragging" : ""} ${selected ? "selected" : ""}`}
      draggable={draggable}
      onDragStart={(e)=>{ if(!draggable) return; onDragStart && onDragStart(e, { from:"roster", unitId: unit.id }); }}
      onDragEnd={onDragEnd}
      onClick={()=>{ if (locked) return; onClick && onClick(); }}
      title={title}
      style={locked ? {cursor:"not-allowed"} : undefined}
    >
      <Heraldry seed={unit.id} sigil={unit.sigil} size={28}/>
      <div className="roster-info">
        <div className="roster-name">{unit.name}</div>
        <div className="roster-meta">{unit.cls} · Lv{unit.lvl} · {unit.sigil}</div>
      </div>
      {afield
        ? <span className="roster-badge" style={{color:"var(--ink-fade)", letterSpacing:"0.1em"}}>afield</span>
        : deployedLock
          ? <span className="roster-badge" style={{color:"var(--ink)", letterSpacing:"0.1em"}}>⚿</span>
          : bannered
            ? <span className="roster-badge" style={{color:"var(--ink)"}}>●</span>
            : <span className="roster-badge">drag</span>
      }
    </div>
  );
}

function Roster({ units, deployedIds, afieldSoulIds, lockedSoulIds, selectedUnitId, dragState, onSelect, onDragStart, onDragEnd, onDropToRoster, onDragOverRoster }) {
  const afieldSet = afieldSoulIds || new Set();
  const lockedSet = lockedSoulIds || new Set();
  // locked includes afield; afield is a subset. "Bannered" = in a party but not locked.
  const reserve  = units.filter(u => !deployedIds.has(u.id));
  const bannered = units.filter(u =>  deployedIds.has(u.id) && !lockedSet.has(u.id));
  const deployed = units.filter(u =>  lockedSet.has(u.id) && !afieldSet.has(u.id));
  const afield   = units.filter(u =>  afieldSet.has(u.id));
  const drop = dragState && dragState.overRoster;

  return (
    <div
      onDragOver={(e)=>{ e.preventDefault(); onDragOverRoster && onDragOverRoster(true); }}
      onDragLeave={()=>onDragOverRoster && onDragOverRoster(false)}
      onDrop={(e)=>{ e.preventDefault(); onDropToRoster && onDropToRoster(); }}
    >
      <div className="banner-rule"><span className="title">The Warden's Household</span></div>
      <div style={{fontSize:11.5, color:"var(--ink-fade)", fontStyle:"italic", padding:"0 4px 6px"}}>
        {units.length} souls · {bannered.length} bannered · {deployed.length} deployed · {afield.length} afield
      </div>

      <div className="roster-group-title">
        <span>Reserve</span>
        <span className="num" style={{color:"var(--ink-fade)"}}>{reserve.length}</span>
      </div>
      <div style={{
        border: drop ? "1px dashed var(--ink)" : "1px dashed transparent",
        padding: 2, borderRadius: 2, marginTop: 4, minHeight: 20,
        background: drop ? "rgba(168,134,74,0.10)" : "transparent",
      }}>
        {reserve.map(u => (
          <RosterRow
            key={u.id}
            unit={u}
            state="reserve"
            selected={selectedUnitId === u.id}
            onClick={() => onSelect(u.id)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            dragging={dragState && dragState.dragUnitId === u.id}
          />
        ))}
        {reserve.length === 0 && (
          <div className="italic-note" style={{padding:"10px 6px", fontSize:12}}>All souls are fielded.</div>
        )}
      </div>

      {bannered.length > 0 && (
        <>
          <div className="roster-group-title" style={{marginTop:14}}>
            <span>Bannered</span>
            <span className="num" style={{color:"var(--ink-fade)"}}>{bannered.length}</span>
          </div>
          {bannered.map(u => (
            <RosterRow
              key={u.id}
              unit={u}
              state="bannered"
              selected={selectedUnitId === u.id}
              onClick={() => onSelect(u.id)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              dragging={dragState && dragState.dragUnitId === u.id}
            />
          ))}
        </>
      )}

      {deployed.length > 0 && (
        <>
          <div className="roster-group-title" style={{marginTop:14}}>
            <span>Deployed</span>
            <span className="num" style={{color:"var(--ink-fade)"}}>{deployed.length}</span>
          </div>
          {deployed.map(u => (
            <RosterRow
              key={u.id}
              unit={u}
              state="deployed"
              selected={selectedUnitId === u.id}
            />
          ))}
        </>
      )}

      {afield.length > 0 && (
        <>
          <div className="roster-group-title" style={{marginTop:14}}>
            <span>Afield</span>
            <span className="num" style={{color:"var(--ink-fade)"}}>{afield.length}</span>
          </div>
          {afield.map(u => (
            <RosterRow
              key={u.id}
              unit={u}
              state="afield"
              selected={selectedUnitId === u.id}
            />
          ))}
        </>
      )}
    </div>
  );
}

Object.assign(window, { Roster });
