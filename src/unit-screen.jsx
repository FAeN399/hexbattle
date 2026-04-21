// SIGILBORNE — Full unit screen (The Forge) — tabbed: Identity / Skills / Training / Advancement / Doctrine / Gear

function EditableName({ value, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    return (
      <input
        autoFocus
        className="name-edit"
        value={draft}
        onChange={(e)=>setDraft(e.target.value)}
        onBlur={() => { onChange(draft.trim() || value); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onChange(draft.trim() || value); setEditing(false); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:26, letterSpacing:"0.01em", border:"1px dashed var(--ink)", background:"var(--vellum)", color:"var(--ink)", padding:"1px 8px", width:"100%", minWidth:0}}
      />
    );
  }
  return (
    <span
      onClick={() => setEditing(true)}
      className="name-display"
      title="Click to rename"
      style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:26, letterSpacing:"0.01em", cursor:"text", borderBottom:"1px dotted transparent", padding:"1px 2px"}}
    >
      {value}
      <span className="rename-hint" style={{marginLeft:6, fontSize:11, color:"var(--ink-fade)", fontStyle:"italic", fontWeight:400, opacity:0.6}}>✎ rename</span>
    </span>
  );
}

function GearSlot({ slot, equipped, pool, unit, onEquip }) {
  const [open, setOpen] = React.useState(false);
  const compatible = pool.filter(i => !i.allows || i.allows.includes("*") || i.allows.includes(unit.cls));
  return (
    <div className="gear-slot">
      <div className="gear-slot-head">
        <span className="label" style={{fontSize:9.5}}>{slot}</span>
        <button className="btn ghost sm" onClick={() => setOpen(o => !o)} title="Swap">{open ? "Close" : "Swap"}</button>
      </div>
      <div className="gear-slot-body">
        <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:13.5, lineHeight:1.15, color: equipped && equipped.name !== "—" ? "var(--ink)" : "var(--ink-fade)"}}>
          {equipped ? equipped.name : "—"}
        </div>
        {equipped && (
          <div style={{fontSize:11, color:"var(--ink-fade)", marginTop:2, fontStyle:"italic"}}>
            {equipped.dmg ? <>dmg {equipped.dmg} · </> : null}
            {equipped.def ? <>def {equipped.def} · </> : null}
            {equipped.note}
          </div>
        )}
      </div>
      {open && (
        <div className="gear-picker">
          {compatible.map(it => (
            <div
              key={it.id}
              className={`gear-option ${equipped && equipped.id === it.id ? "current" : ""}`}
              onClick={() => { onEquip(slot, it); setOpen(false); }}
            >
              <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:12.5}}>{it.name}</div>
              <div style={{fontSize:10.5, color:"var(--ink-fade)", fontStyle:"italic"}}>
                {it.dmg ? <>{it.dmg} · </> : null}
                {it.def ? <>{it.def} · </> : null}
                {it.note}
              </div>
            </div>
          ))}
          {compatible.length === 0 && (
            <div className="italic-note" style={{padding:6, fontSize:11}}>Nothing in stores fits this class.</div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionSlot({ index, action, onChange, availableActions, onClear, canClear }) {
  const [open, setOpen] = React.useState(false);
  const label = ["First", "Second", "Third", "Fourth"][index] || `Slot ${index+1}`;
  return (
    <div className={`action-slot ${action ? "" : "empty"}`}>
      <div className="action-slot-index">
        <span className="label" style={{fontSize:9.5, letterSpacing:"0.2em"}}>{label}</span>
        <span style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)"}}>#{index+1}</span>
      </div>
      <div className="action-slot-body" onClick={() => setOpen(o => !o)}>
        {action ? (
          <>
            <div className="action-title-row">
              <div className="action-title">{action.name}</div>
              <span className={`action-kind ${action.kind}`}>{action.kind}</span>
            </div>
            <div className="action-trigger">
              if: {action.trigger} · cost: {action.cost}
            </div>
            {action.tags && (
              <div style={{display:"flex", gap:3, flexWrap:"wrap", marginTop:4}}>
                {action.tags.map(t => <span key={t} className="mtag" style={{fontSize:9}}>{t}</span>)}
              </div>
            )}
          </>
        ) : (
          <div className="italic-note" style={{fontSize:12}}>— empty slot — click to set —</div>
        )}
      </div>
      {open && (
        <div className="action-picker">
          {availableActions.map(a => (
            <div
              key={a.id}
              className={`action-option ${action && action.id === a.id ? "current" : ""}`}
              onClick={() => { onChange(a.id); setOpen(false); }}
            >
              <div style={{display:"flex", justifyContent:"space-between", gap:6}}>
                <span style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:12.5}}>{a.name}</span>
                <span className={`action-kind ${a.kind}`}>{a.kind}</span>
              </div>
              <div style={{fontSize:10, color:"var(--ink-fade)", fontStyle:"italic"}}>
                if: {a.trigger} · cost: {a.cost}
              </div>
            </div>
          ))}
        </div>
      )}
      {canClear && action && !open && (
        <button className="btn ghost sm" onClick={onClear} style={{marginTop:6, alignSelf:"flex-start"}}>Clear</button>
      )}
    </div>
  );
}

Object.assign(window, { GearSlot, ActionSlot });

function UnitScreen({
  unit, parties, allUnits, onClose, onRename, onEquip, onSetDoctrine, doctrine,
  onMakeLeader, onUnassign, isLeader, assigned,
  onLearnSkill, onStartTraining, training, onAssignMentor, onCancelTraining, onSetIntensity,
  onChooseMastery, onPromote,
  onTakeFeat, onRemoveFeat, onAutoTune,
  initialTab,
}) {
  if (!unit) return null;
  const [tab, setTab] = React.useState(initialTab || "identity");
  React.useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab, unit.id]);

  const cls = CLASSES[unit.cls] || {};

  return (
    <main className="main unit-screen">
      {/* Breadcrumb + close */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, borderBottom:"1px solid var(--rule-faint)", paddingBottom:8}}>
        <div style={{display:"flex", alignItems:"center", gap:8, fontSize:11.5, color:"var(--ink-fade)"}}>
          <span className="label" style={{fontSize:9.5}}>◄ Banners</span>
          <span>/</span>
          <span style={{fontStyle:"italic"}}>The Forge · {unit.name}</span>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button
            className="btn ghost sm"
            onClick={() => onAutoTune && onAutoTune(unit.id)}
            title="Auto-pick mastery, skills, feats, and gear from what's eligible"
          >
            ✦ Auto-tune
          </button>
          <button className="btn ghost sm" onClick={onClose}>✕ Close</button>
        </div>
      </div>

      {/* Header */}
      <div className="unit-screen-head">
        <Heraldry seed={unit.id} sigil={unit.sigil} size={82}/>
        <div style={{flex:1, minWidth:0}}>
          <EditableName value={unit.name} onChange={onRename}/>
          <div style={{fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink-soft)", marginTop:2, fontStyle:"italic"}}>
            {unit.cls} <span style={{color:"var(--ink-fade)"}}>— {cls.hint}</span>
          </div>
          <div style={{display:"flex", gap:12, marginTop:6, fontSize:12, color:"var(--ink-2)", flexWrap:"wrap"}}>
            <span><span className="label" style={{fontSize:9}}>Level</span> <strong>{unit.lvl}</strong></span>
            <span><span className="label" style={{fontSize:9}}>Origin</span> {unit.origin}</span>
            <span><span className="label" style={{fontSize:9}}>Alignment</span> {unit.align}</span>
            <span><span className="label" style={{fontSize:9}}>Nature</span> {unit.nature}</span>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className="label" style={{fontSize:9.5}}>Vital</div>
          <div style={{fontFamily:"var(--mono)", fontSize:20, color:"var(--ink)"}}>
            {unit.hp}<span style={{color:"var(--ink-fade)"}}>/{unit.hpmax}</span>
          </div>
          <div className="hp-gauge" style={{width:120, marginTop:4}}>
            <span style={{width:`${(unit.hp/unit.hpmax)*100}%`}}/>
          </div>
          <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end"}}>
            {assigned && (
              <button className={`btn sm ${isLeader ? "" : "ghost"}`} onClick={onMakeLeader}>
                {isLeader ? "◆ Leader" : "Name Leader"}
              </button>
            )}
            {assigned && (
              <button className="btn ghost sm" onClick={onUnassign}>Return to roster</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ForgeTabs active={tab} onChange={setTab}/>

      {/* Tab content */}
      <div className="forge-tab-body">
        {tab === "identity"    && <TabIdentity unit={unit} allUnits={allUnits} />}
        {tab === "skills"      && <TabSkills unit={unit} allUnits={allUnits} onLearn={(sk)=>onLearnSkill(unit.id, sk)} onStartTraining={(sk, mentor)=>onAssignMentor(unit.id, sk.id, mentor.id)} />}
        {tab === "training"    && <TabTraining unit={unit} allUnits={allUnits} training={training || {}} onAssignMentor={onAssignMentor} onCancelTraining={onCancelTraining} onSetIntensity={onSetIntensity} />}
        {tab === "advancement" && <TabAdvancement unit={unit} onChooseMastery={onChooseMastery} onPromote={onPromote} />}
        {tab === "feats"       && <TabFeats unit={unit} onTakeFeat={onTakeFeat} onRemoveFeat={onRemoveFeat} />}
        {tab === "doctrine"    && <TabDoctrine unit={unit} doctrine={doctrine} onSetDoctrine={onSetDoctrine} />}
        {tab === "gear"        && <TabGear unit={unit} onEquip={onEquip} />}
      </div>

      <div style={{marginTop:14, padding:"8px 12px", border:"1px dashed var(--rule)", borderRadius:2, fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-fade)", fontSize:12}}>
        "A unit is not configured. A unit is answered into being — and tuned for the road ahead."
      </div>
    </main>
  );
}

Object.assign(window, { UnitScreen });
