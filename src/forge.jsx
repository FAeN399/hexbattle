// SIGILBORNE — Forge: Identity / Skills / Training / Advancement / Doctrine / Gear

function ForgeTabs({ active, onChange }) {
  const tabs = [
    { id:"identity",    label:"Identity" },
    { id:"skills",      label:"Skills" },
    { id:"training",    label:"Training" },
    { id:"advancement", label:"Advancement" },
    { id:"feats",       label:"Feats" },
    { id:"doctrine",    label:"Doctrine" },
    { id:"gear",        label:"Gear" },
  ];
  return (
    <div className="forge-tabs" role="tablist">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`forge-tab ${active === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- IDENTITY ----------
function TabIdentity({ unit, allUnits }) {
  const cls = CLASSES[unit.cls] || {};
  const node = PROMOTION_TREE[unit.cls] || {};
  // Chain: find the base → current → promotesTo
  const findBase = (c) => {
    const n = PROMOTION_TREE[c];
    if (!n) return c;
    if (n.tier === 1) return c;
    return (n.from && n.from[0]) ? findBase(n.from[0]) : c;
  };
  const base = findBase(unit.cls);
  const currentNode = PROMOTION_TREE[unit.cls] || {};
  const roleLine = {
    tank:    "Holds the line. Takes blows so others may strike.",
    striker: "Deals the telling blow. Moves to the fight.",
    support: "Mends, wards, sustains. Makes the blade behind the blade.",
    caster:  "Speaks the syllables. Bends the substance.",
  }[cls.role || currentNode.role || ""] || "";

  return (
    <div className="forge-identity">
      {/* Class identity card */}
      <div className="forge-card">
        <div className="forge-card-head">
          <div className="forge-eyebrow">Class Identity — Tier {currentNode.tier || cls.tier || "—"}</div>
          <div className="forge-card-title">{unit.cls}</div>
          <div className="forge-card-sub">{currentNode.hint || cls.hint}</div>
        </div>
        <div className="forge-role-grid">
          <div>
            <div className="label">Role</div>
            <div className="forge-role"><strong>{(currentNode.role||cls.role||"—").toUpperCase()}</strong></div>
            <div className="italic-note" style={{fontSize:11.5, marginTop:3, color:"var(--ink-soft)"}}>{roleLine}</div>
          </div>
          <div>
            <div className="label">Promotion Chain</div>
            <div className="forge-chain">
              <span className={`forge-chain-node ${base === unit.cls ? "current" : ""}`}>{base}</span>
              {base !== unit.cls && <>
                <span className="forge-chain-arrow">→</span>
                <span className="forge-chain-node current">{unit.cls}</span>
              </>}
              {(currentNode.promotesTo || []).map((p,i) => (
                <React.Fragment key={p}>
                  <span className="forge-chain-arrow">→</span>
                  <span className="forge-chain-node future">{p}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sigil + Oath */}
      <div className="forge-card">
        <div className="forge-eyebrow">Soul — what they are</div>
        <div className="forge-identity-kv">
          <div>
            <div className="label">Sigil</div>
            <div><strong style={{color:"var(--gold-deep)"}}>◇ {unit.sigil}</strong> <em style={{color:"var(--ink-fade)"}}>— {(SIGILS[unit.sigil]||{}).line}</em></div>
          </div>
          <div>
            <div className="label">Affinity</div>
            <div>{unit.affinity}</div>
          </div>
          <div>
            <div className="label" style={{color:"var(--blood)"}}>Oath</div>
            <div style={{fontStyle:"italic"}}>{unit.oath}.</div>
          </div>
          <div>
            <div className="label">Wound</div>
            <div style={{fontStyle:"italic", color:"var(--ink-soft)"}}>{unit.wound}.</div>
          </div>
          <div>
            <div className="label">Nature</div>
            <div>{unit.nature}</div>
          </div>
          <div>
            <div className="label">Alignment</div>
            <div>{unit.align}</div>
          </div>
        </div>
      </div>

      {/* Substrate condensed */}
      <div className="forge-card">
        <div className="forge-eyebrow">The Substrate</div>
        <div className="forge-stats-compact">
          {[
            ["Vig","vig"],["Foc","foc"],["Str","str"],
            ["Arc","arc"],["Skl","skl"],["Spd","spd"],
            ["Wrd","wrd"],["Res","res"],["Frt","frt"],
          ].map(([lbl,k]) => (
            <div key={k} className="forge-stat-pill">
              <span className="forge-stat-name">{lbl}</span>
              <span className="forge-stat-val">{unit.stats[k]}</span>
            </div>
          ))}
          <div className="forge-stat-pill move">
            <span className="forge-stat-name">Mv</span>
            <span className="forge-stat-val">{unit.move}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- SKILLS ----------
function TabSkills({ unit, allUnits, onLearn, onStartTraining }) {
  const [filter, setFilter] = React.useState("all"); // all | available | locked | known
  const known = new Set(unit.skills || []);

  // Build a relevant skill list: any skill whose class prereqs match unit OR is universal/sigil
  const relevant = SKILL_LIBRARY.filter(sk => {
    const p = sk.prereqs || {};
    if (sk.source === "universal") return true;
    if (!p.classes) return true;
    return p.classes.includes(unit.cls);
  });

  // Evaluate
  const rows = relevant.map(sk => {
    const isKnown = known.has(sk.name);
    const check = checkSkill(unit, sk, allUnits);
    return { sk, isKnown, check };
  });

  const filtered = rows.filter(r => {
    if (filter === "known") return r.isKnown;
    if (filter === "available") return !r.isKnown && r.check.ok;
    if (filter === "locked") return !r.isKnown && !r.check.ok;
    return true;
  });

  // Group by source
  const bySource = {};
  filtered.forEach(r => {
    const key = r.sk.source;
    if (!bySource[key]) bySource[key] = [];
    bySource[key].push(r);
  });

  const sourceOrder = ["class","sigil","universal","mastery"];
  const sourceLabel = { class:"Class Skills", sigil:"Sigil Skills", universal:"Universal", mastery:"Mastery Signatures" };

  return (
    <div className="forge-skills">
      <div className="forge-filter-row">
        <div className="forge-eyebrow">Known {known.size} · Relevant {relevant.length}</div>
        <div className="forge-chip-row">
          {["all","available","locked","known"].map(f => (
            <button key={f} className={`forge-chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {sourceOrder.filter(s => bySource[s]).map(s => (
        <div key={s} className="forge-skill-group">
          <div className="banner-rule"><span className="title">{sourceLabel[s]}</span></div>
          <div className="forge-skill-list">
            {bySource[s].map(({ sk, isKnown, check }) => {
              const mentors = isKnown ? [] : findMentors(sk, allUnits, unit.id);
              return (
                <div key={sk.id} className={`forge-skill-row ${isKnown ? "known" : check.ok ? "available" : "locked"}`}>
                  <div className="forge-skill-main">
                    <div className="forge-skill-title">
                      <span className={`forge-skill-dot tier-${sk.tier}`}></span>
                      <span className="forge-skill-name">{sk.name}</span>
                      <span className="forge-skill-tier">T{sk.tier}</span>
                      {isKnown && <span className="forge-badge known-badge">✓ learned</span>}
                      {!isKnown && check.ok && <span className="forge-badge ok-badge">eligible</span>}
                      {!isKnown && !check.ok && <span className="forge-badge lock-badge">locked</span>}
                    </div>
                    <div className="forge-skill-desc">{sk.desc}</div>
                    {!isKnown && (
                      <div className="forge-skill-reqs">
                        <span className="label" style={{fontSize:9}}>Requires</span>
                        {Object.entries(sk.prereqs || {}).map(([k,v]) => {
                          if (k === "stat") {
                            return Object.entries(v).map(([sk2,sv])=><span key={sk2} className="req-chip">{sk2.toUpperCase()} {sv}+</span>);
                          }
                          if (k === "level") return <span key={k} className="req-chip">Lv {v}+</span>;
                          if (k === "classes") return <span key={k} className="req-chip">{v.join("/")}</span>;
                          if (k === "sigil") return <span key={k} className="req-chip">Sigil: {v.join("/")}</span>;
                          if (k === "needs") return v.map(n => {
                            const needed = SKILL_LIBRARY.find(s2=>s2.id===n);
                            return needed && <span key={n} className="req-chip">needs {needed.name}</span>;
                          });
                          return null;
                        })}
                        {sk.mastery && (
                          <span className="req-chip">mastery-gated</span>
                        )}
                      </div>
                    )}
                    {!isKnown && !check.ok && check.reasons.length > 0 && (
                      <div className="forge-skill-reasons">
                        {check.reasons.map((r,i) => <div key={i}>· {r}</div>)}
                      </div>
                    )}
                  </div>
                  <div className="forge-skill-actions">
                    {!isKnown && check.ok && (
                      <button className="btn sm" onClick={()=>onLearn(sk)}>Learn</button>
                    )}
                    {!isKnown && mentors.length > 0 && (
                      <button className="btn ghost sm" onClick={()=>onStartTraining(sk, mentors[0])}>
                        Train · {mentors.length} {mentors.length === 1 ? "mentor" : "mentors"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- TRAINING (mentor system with bonds + intensity) ----------
function TabTraining({ unit, allUnits, training, onAssignMentor, onCancelTraining, onSetIntensity }) {
  const current = training[unit.id];
  const known = new Set(unit.skills || []);
  const [intensity, setIntensityLocal] = React.useState((current && current.intensity) || "steady");

  // Helper: active mentor object
  const mentor = current && allUnits.find(u => u.id === current.mentorId);
  const bond = mentor ? bondEffect(mentor) : null;
  const currentSkill = current && SKILL_LIBRARY.find(s => s.id === current.skillId);

  // Intensity options — affects training speed and side effects
  const INTENSITIES = [
    { id:"gentle",   label:"Gentle",   sub:"slower · preserves strength",     mult:1.5, side:"+1 Morale/day · no HP drain" },
    { id:"steady",   label:"Steady",   sub:"measured · the middle way",       mult:1.0, side:"No side-effects" },
    { id:"rigorous", label:"Rigorous", sub:"faster · a wound for a lesson",   mult:0.6, side:"-2 HP/day · +XP on completion" },
  ];

  // All skills this unit *could* learn via mentorship
  const trainable = SKILL_LIBRARY.filter(sk => {
    if (known.has(sk.name)) return false;
    const p = sk.prereqs || {};
    if (p.classes && !p.classes.includes(unit.cls)) return false;
    return true;
  });

  // Pre-compute eligible trainers across household (who CAN teach anything)
  const eligibleTrainers = allUnits.filter(u => u.id !== unit.id && canTrain(u));

  return (
    <div className="forge-training">
      {current ? (
        <div className="forge-card training-active">
          <div className="forge-eyebrow">Currently Training</div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap"}}>
            <div style={{flex:1, minWidth:0}}>
              <div className="forge-card-title">{currentSkill?.name || current.skillId}</div>
              <div className="forge-card-sub">
                under <strong>{mentor?.name || "—"}</strong>
                {mentor && <span style={{color:"var(--ink-fade)"}}> · {mentor.cls} · Lv {mentor.lvl}</span>}
                <span> · {current.daysLeft} day{current.daysLeft === 1 ? "" : "s"} remain</span>
              </div>
            </div>
            <button className="btn ghost sm" onClick={()=>onCancelTraining(unit.id)}>Break the pact</button>
          </div>
          <div className="forge-training-bar">
            <span style={{width:`${Math.max(5, 100 - (current.daysLeft/5)*100)}%`}}/>
          </div>

          {/* Intensity picker */}
          <div style={{marginTop:14}}>
            <div className="forge-eyebrow" style={{marginBottom:6}}>Intensity of the Pact</div>
            <div className="forge-intensity-row">
              {INTENSITIES.map(it => (
                <button
                  key={it.id}
                  className={`forge-intensity-chip ${intensity === it.id ? "active" : ""}`}
                  onClick={()=>{ setIntensityLocal(it.id); onSetIntensity && onSetIntensity(unit.id, it.id); }}
                >
                  <div className="forge-intensity-label">{it.label}</div>
                  <div className="forge-intensity-sub">{it.sub}</div>
                  <div className="forge-intensity-side">{it.side}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Battle Bond panel — the big feature */}
          {bond && (
            <div className="forge-bond-panel">
              <div className="forge-eyebrow">Battle Bond</div>
              <div className="forge-bond-body">
                <div className="forge-bond-pair">
                  <div className="forge-bond-node mentor">
                    <div className="forge-bond-role">{bond.role.toUpperCase()}</div>
                    <div className="forge-bond-name">{mentor.name}</div>
                    <div className="forge-bond-cls">{mentor.cls}</div>
                  </div>
                  <div className="forge-bond-link">
                    <span>◆</span>
                    <span className="forge-bond-link-label">teaches</span>
                    <span>◆</span>
                  </div>
                  <div className="forge-bond-node trainee">
                    <div className="forge-bond-role">TRAINEE</div>
                    <div className="forge-bond-name">{unit.name}</div>
                    <div className="forge-bond-cls">{unit.cls}</div>
                  </div>
                </div>
                <div className="forge-bond-effect">
                  <div className="label" style={{fontSize:9.5}}>When both ride the same banner</div>
                  <div className="forge-bond-effect-text">{bond.note}</div>
                </div>
                <div className="italic-note" style={{fontSize:11, marginTop:6, color:"var(--ink-fade)"}}>
                  The mentor's presence shapes the trainee in battle. {bond.role === "tank" ? "A shield-bearer's calm steadies the untried." : bond.role === "striker" ? "A killer's edge teaches where to strike." : bond.role === "support" ? "A healer's hand teaches where to hold." : "A scholar's word teaches what to say."}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="italic-note" style={{fontSize:12, padding:"10px 12px", marginBottom:12, lineHeight:1.5}}>
          {unit.name.split(" ")[0]} studies alone. A <strong>mentor</strong> shapes more than skill — a bond forms. When mentor and trainee ride the same banner, the mentor's strength flows sidelong into the trainee. Only the proven may teach: veterans at Lv 15+, or the tempered classes — Warden, Templar, Scholar, Sentinel, and their kin.
        </div>
      )}

      {/* Eligible trainers summary */}
      {!current && (
        <div className="forge-card" style={{padding:"10px 12px"}}>
          <div className="forge-eyebrow">The Household's Teachers</div>
          {eligibleTrainers.length === 0 ? (
            <div className="italic-note" style={{fontSize:12}}>No one in the household is proven enough to teach. Veterans come from deeds, or from time.</div>
          ) : (
            <div className="forge-trainers-row">
              {eligibleTrainers.map(t => {
                const tb = bondEffect(t);
                return (
                  <div key={t.id} className="forge-trainer-chip" title={`${t.cls} · ${trainerReason(t)}`}>
                    <div className="forge-trainer-name">{t.name}</div>
                    <div className="forge-trainer-meta">
                      <span>{t.cls}</span>
                      <span style={{color:"var(--ink-fade)"}}>·</span>
                      <span>Lv {t.lvl}</span>
                    </div>
                    <div className="forge-trainer-bond">{tb.role} bond · {tb.note.split("·")[0].trim()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="banner-rule"><span className="title">{current ? "Other Skills to Pursue" : "Find a Mentor"}</span></div>

      <div className="forge-training-list">
        {trainable.map(sk => {
          const mentors = findMentors(sk, allUnits, unit.id);
          const check = checkSkill(unit, sk, allUnits);
          if (mentors.length === 0) return null;
          return (
            <div key={sk.id} className="forge-training-row">
              <div className="forge-training-main">
                <div className="forge-skill-title">
                  <span className={`forge-skill-dot tier-${sk.tier}`}></span>
                  <span className="forge-skill-name">{sk.name}</span>
                  <span className="forge-skill-tier">T{sk.tier}</span>
                  {!check.ok && <span className="forge-badge lock-badge">prereqs not met</span>}
                </div>
                <div className="forge-skill-desc">{sk.desc}</div>
                <div className="forge-mentor-list">
                  <span className="label" style={{fontSize:9}}>Proven teachers</span>
                  {mentors.slice(0, 4).map(m => {
                    const mb = bondEffect(m);
                    return (
                      <button
                        key={m.id}
                        className="forge-mentor-chip"
                        disabled={!!current}
                        onClick={()=>onAssignMentor(unit.id, sk.id, m.id)}
                        title={current ? "Already training" : `Learn ${sk.name} under ${m.name} — forges a ${mb.role} bond`}
                      >
                        <span className="forge-mentor-name">{m.name}</span>
                        <span className="forge-mentor-cls">{m.cls} · Lv {m.lvl}</span>
                        <span className="forge-mentor-bond">{mb.role}</span>
                      </button>
                    );
                  })}
                  {mentors.length > 4 && <span className="italic-note" style={{fontSize:10}}>+{mentors.length - 4} more</span>}
                </div>
              </div>
            </div>
          );
        }).filter(Boolean)}
        {trainable.filter(sk => findMentors(sk, allUnits, unit.id).length > 0).length === 0 && (
          <div className="italic-note" style={{fontSize:12, padding:"10px 12px"}}>
            No proven teacher in the household carries a skill this soul lacks. Recruit veterans, promote those who are ready, or travel the road and earn by deed.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- ADVANCEMENT (promotion gates + mastery) ----------
function TabAdvancement({ unit, onChooseMastery, onPromote }) {
  const currentNode = PROMOTION_TREE[unit.cls] || {};
  const currentMastery = unit.mastery;
  const masteries = MASTERY_PATHS[unit.cls] || [];

  return (
    <div className="forge-advancement">
      {/* Mastery panel — only for tier-2 classes with paths */}
      {masteries.length > 0 && (
        <div className="forge-card">
          <div className="forge-eyebrow">Mastery — {unit.cls}</div>
          <div className="italic-note" style={{fontSize:11.5, marginBottom:10, color:"var(--ink-soft)"}}>
            A tier-two soul commits to one path. The other two remain possible at the cost of stepping back to Squire and walking again — few ever do.
          </div>
          <div className="forge-mastery-grid">
            {masteries.map(m => {
              const chosen = currentMastery === m.id;
              const locked = currentMastery && !chosen;
              return (
                <div key={m.id} className={`forge-mastery-card ${chosen ? "chosen" : ""} ${locked ? "locked" : ""}`}>
                  <div className="forge-mastery-head">
                    <div className="forge-mastery-name">{m.name}</div>
                    {chosen && <span className="forge-badge known-badge">✓ walking</span>}
                  </div>
                  <div className="forge-mastery-kv">
                    <div><span className="label" style={{fontSize:9}}>Passive</span><div>{m.passive}</div></div>
                    <div><span className="label" style={{fontSize:9}}>Signature</span><div style={{fontStyle:"italic"}}>{m.signature}</div></div>
                  </div>
                  {!chosen && !locked && (
                    <button className="btn sm" style={{marginTop:8}} onClick={()=>onChooseMastery(unit.id, m.id)}>
                      Take this path
                    </button>
                  )}
                  {locked && <div className="italic-note" style={{fontSize:10, marginTop:6, textAlign:"right"}}>— unreachable until re-squired —</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Promotion chain */}
      <div className="forge-card">
        <div className="forge-eyebrow">Promotion — where they could go</div>
        {(currentNode.promotesTo || []).length === 0 ? (
          <div className="italic-note" style={{fontSize:12, padding:"8px 0"}}>
            {unit.cls} has no further promotions — this is a final tier.
          </div>
        ) : (
          <div className="forge-promotion-list">
            {(currentNode.promotesTo || []).map(target => {
              const targetNode = PROMOTION_TREE[target];
              if (!targetNode) return null;
              const check = checkPromotion(unit, target);
              return (
                <div key={target} className={`forge-promotion-row ${check.ok ? "ready" : "gated"}`}>
                  <div className="forge-promotion-main">
                    <div className="forge-promotion-head">
                      <span className="forge-promotion-name">{target}</span>
                      <span className="forge-promotion-tier">Tier {targetNode.tier}</span>
                      <span className="forge-promotion-role">{(targetNode.role || "").toUpperCase()}</span>
                      {check.ok && <span className="forge-badge ok-badge">ready</span>}
                    </div>
                    <div className="forge-promotion-hint">{targetNode.hint}</div>
                    <div className="forge-promotion-gates">
                      {targetNode.gate?.level && (
                        <div className={`gate ${unit.lvl >= targetNode.gate.level ? "met" : ""}`}>
                          <span className="label" style={{fontSize:9}}>Level</span>
                          <span>{unit.lvl} / {targetNode.gate.level}</span>
                        </div>
                      )}
                      {targetNode.gate?.deed && (
                        <div className={`gate deed ${(unit.deedsDone||[]).includes(target) ? "met" : ""}`}>
                          <span className="label" style={{fontSize:9, color:"var(--blood)"}}>Deed</span>
                          <span style={{fontStyle:"italic"}}>{targetNode.gate.deed}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="forge-promotion-actions">
                    <button className="btn sm" disabled={!check.ok} onClick={()=>check.ok && onPromote(unit.id, target)}>
                      {check.ok ? "Promote →" : "Gated"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-use existing ActionSlot / GearSlot by re-declaring locally? They already live in unit-screen.jsx as globals.
// For doctrine + gear tabs, call the existing functions.

function TabDoctrine({ unit, doctrine, onSetDoctrine }) {
  const availableActions = BATTLE_ACTIONS.filter(a => a.always || (a.requires || []).some(r => (unit.skills || []).includes(r)));
  const resolvedDoctrine = (doctrine || defaultDoctrine(unit)).map(id => BATTLE_ACTIONS.find(a => a.id === id) || null);
  return (
    <div className="forge-doctrine">
      <div className="italic-note" style={{fontSize:11.5, marginBottom:8, lineHeight:1.45, color:"var(--ink-soft)"}}>
        When the banner rides, {unit.name.split(" ")[0]} will try each choice in order. The first whose condition is met, fires. Untriggered choices pass; an empty slot yields the turn.
      </div>
      <div className="action-slots">
        {resolvedDoctrine.map((action, i) => (
          <ActionSlot
            key={i}
            index={i}
            action={action}
            availableActions={availableActions}
            onChange={(id) => {
              const cur = [...(doctrine || defaultDoctrine(unit))];
              cur[i] = id;
              onSetDoctrine(cur);
            }}
            onClear={() => {
              const cur = [...(doctrine || defaultDoctrine(unit))];
              cur[i] = null;
              onSetDoctrine(cur);
            }}
            canClear={i > 0}
          />
        ))}
      </div>
      <div style={{marginTop:6, fontSize:11, color:"var(--ink-fade)", fontStyle:"italic"}}>
        {availableActions.length} choices unlocked from class, skills, and equipped gear.
      </div>
    </div>
  );
}

function TabGear({ unit, onEquip }) {
  const findGear = (slot, name) => {
    if (!name) return null;
    const pool = INVENTORY[slot] || [];
    const m = pool.find(i => i.name === name);
    if (m) return m;
    return { id:`${slot}_custom`, name, note:"(household issue)" };
  };
  const equipped = {
    main:   findGear("main",   unit.gear.main),
    off:    findGear("off",    unit.gear.off),
    armor:  findGear("armor",  unit.gear.armor),
    locket: findGear("locket", unit.gear.locket),
  };
  return (
    <div className="forge-gear">
      <div className="gear-grid">
        <GearSlot slot="main"   equipped={equipped.main}   pool={INVENTORY.main}   unit={unit} onEquip={(s,it)=>onEquip(s,it.name)}/>
        <GearSlot slot="off"    equipped={equipped.off}    pool={INVENTORY.off}    unit={unit} onEquip={(s,it)=>onEquip(s,it.name)}/>
        <GearSlot slot="armor"  equipped={equipped.armor}  pool={INVENTORY.armor}  unit={unit} onEquip={(s,it)=>onEquip(s,it.name)}/>
        <GearSlot slot="locket" equipped={equipped.locket} pool={INVENTORY.locket} unit={unit} onEquip={(s,it)=>onEquip(s,it.name)}/>
      </div>
    </div>
  );
}

// ---------- FEATS (capped at 2) ----------
function TabFeats({ unit, onTakeFeat, onRemoveFeat }) {
  const taken = unit.feats || [];
  const slotsLeft = 2 - taken.length;
  const relevant = relevantFeats(unit);

  const takenObjs = taken.map(id => FEATS.find(f => f.id === id)).filter(Boolean);
  const available = relevant.filter(f => !taken.includes(f.id));

  return (
    <div className="forge-feats">
      {/* Header card */}
      <div className="forge-card">
        <div className="forge-eyebrow">Feats — {taken.length}/2 taken</div>
        <div className="italic-note" style={{fontSize:11.5, lineHeight:1.5, color:"var(--ink-soft)"}}>
          A feat is a singular distinction. Where skills are learned, feats are <em>earned</em> — marks of what this soul has proven against the world. None may carry more than two.
        </div>
      </div>

      {/* Taken feats */}
      {takenObjs.length > 0 && (
        <div className="forge-card">
          <div className="forge-eyebrow">Carried</div>
          <div className="forge-feats-grid">
            {takenObjs.map(f => (
              <div key={f.id} className="forge-feat-card taken">
                <div className="forge-feat-head">
                  <span className="forge-feat-seal">✦</span>
                  <div>
                    <div className="forge-feat-name">{f.name}</div>
                    <div className="forge-feat-tagline">{f.tagline}</div>
                  </div>
                </div>
                <div className="forge-feat-desc">{f.desc}</div>
                <div className="forge-feat-effect">{f.effect}</div>
                <button className="btn ghost sm" onClick={()=>onRemoveFeat(unit.id, f.id)}>Renounce</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available feats */}
      <div className="forge-card">
        <div className="forge-eyebrow">Available — {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft===1?"":"s"} remaining` : "slots full"}</div>
        <div className="forge-feats-grid">
          {available.map(f => {
            const check = checkFeat(unit, f);
            const canTake = check.ok && slotsLeft > 0;
            return (
              <div key={f.id} className={`forge-feat-card ${canTake ? "ready" : check.ok ? "full" : "locked"}`}>
                <div className="forge-feat-head">
                  <span className="forge-feat-seal">{check.ok ? "◈" : "·"}</span>
                  <div>
                    <div className="forge-feat-name">{f.name}</div>
                    <div className="forge-feat-tagline">{f.tagline}</div>
                  </div>
                </div>
                <div className="forge-feat-desc">{f.desc}</div>
                <div className="forge-feat-effect">{f.effect}</div>
                {!check.ok && (
                  <ul className="forge-feat-reasons">
                    {check.reasons.map((r,i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
                <button className="btn sm" disabled={!canTake} onClick={()=>canTake && onTakeFeat(unit.id, f.id)}>
                  {canTake ? "Take feat" : check.ok ? "Slots full" : "Locked"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ForgeTabs, TabIdentity, TabSkills, TabTraining, TabAdvancement, TabFeats, TabDoctrine, TabGear
});
