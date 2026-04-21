// SIGILBORNE — Forge data: promotion tree, masteries, skill library, training

// ---- Promotion tree: base → tier-2 → tier-3 ----
// Each node: {id, tier, role, hint, from[], promotesTo[], gate:{level, deed, sigil?}}
const PROMOTION_TREE = {
  // Tier 1 (bases)
  "Squire":   { tier:1, role:"tank",    hint:"Young steel; promise-bearing.",
                promotesTo:["Sentinel","Knight","Templar","Reaver","Ronin","Blackguard"] },
  "Ranger":   { tier:1, role:"striker", hint:"Long reach; reads the trees.",
                promotesTo:["Warden-Strider","Hunter"] },
  "Scout":    { tier:1, role:"support", hint:"Sees what others miss.",
                promotesTo:["Outrider","Shade"] },
  "Acolyte":  { tier:1, role:"support", hint:"Mends wounds, tempers souls.",
                promotesTo:["Cleric","Templar"] },
  "Scholar":  { tier:1, role:"caster",  hint:"Reads the old syllables.",
                promotesTo:["Invoker","Archivist"] },
  "Initiate": { tier:1, role:"caster",  hint:"Mystery-student; glyphs in hand.",
                promotesTo:["Invoker","Sigil-Weaver"] },

  // Tier 2
  "Sentinel":   { tier:2, role:"tank",    hint:"Shield-sworn; holds a lane.",
                  from:["Squire"], promotesTo:["Warden","Bulwark-Lord"],
                  gate:{ level:15, deed:"Hold a line without yielding in 3 postings." } },
  "Knight":     { tier:2, role:"striker", hint:"Mounted blade; charges the flank.",
                  from:["Squire"], promotesTo:["Warden","Paragon"],
                  gate:{ level:15, deed:"Complete 4 postings with oath intact." } },
  "Templar":    { tier:2, role:"support", hint:"Steel and prayer; guards the line.",
                  from:["Squire","Acolyte"], promotesTo:["Paragon","High-Templar"],
                  gate:{ level:15, deed:"Close a Void-cairn or stand a Vigil." } },
  "Ronin":      { tier:2, role:"striker", hint:"Unsworn blade; faster than fate.",
                  from:["Squire"], promotesTo:["Sword-Saint","Blackguard"],
                  gate:{ level:15, deed:"Win 3 duels unshielded." } },
  "Reaver":     { tier:2, role:"striker", hint:"A red edge; no quarter.",
                  from:["Squire"], promotesTo:["Berserker","Blackguard"],
                  gate:{ level:15, deed:"Fell a foe at <20% HP, 5 times." } },
  "Blackguard": { tier:2, role:"tank",    hint:"Corrupted vow; grim fortitude.",
                  from:["Squire","Ronin"], promotesTo:["Dread-Knight"],
                  gate:{ level:15, deed:"Break an oath — knowingly." } },
  "Cleric":     { tier:2, role:"support", hint:"Blessing-bearer.",
                  from:["Acolyte"], promotesTo:["High-Templar","Lightbringer"],
                  gate:{ level:15, deed:"Mend in the field, 20 times." } },
  "Invoker":    { tier:2, role:"caster",  hint:"Names the elements and they answer.",
                  from:["Scholar","Initiate"], promotesTo:["Archon","Sigil-Weaver"],
                  gate:{ level:15, deed:"Cast 3 named-element spells in one battle." } },

  // Tier 3
  "Warden":       { tier:3, role:"tank",    hint:"Oath-bound bulwark.",
                    from:["Sentinel","Knight"], gate:{ level:25, deed:"Keep household intact across 6 postings." } },
  "Bulwark-Lord": { tier:3, role:"tank",    hint:"The line that never breaks.",
                    from:["Sentinel"],       gate:{ level:25, deed:"Survive a Grave posting without retreating." } },
  "Paragon":      { tier:3, role:"striker", hint:"Lance of the Crown.",
                    from:["Knight","Templar"],gate:{ level:25, deed:"Lead a banner in 8 postings." } },
  "High-Templar": { tier:3, role:"support", hint:"Ward and blade, unbroken.",
                    from:["Templar","Cleric"],gate:{ level:25, deed:"Perform a full Lumen Vigil." } },
  "Sword-Saint":  { tier:3, role:"striker", hint:"A blade that has learned stillness.",
                    from:["Ronin"],           gate:{ level:25, deed:"Win a duel with no skills spent." } },
  "Berserker":    { tier:3, role:"striker", hint:"The red edge unchained.",
                    from:["Reaver"],          gate:{ level:25, deed:"Finish a battle at 1 HP." } },
  "Dread-Knight": { tier:3, role:"tank",    hint:"A darker vow.",
                    from:["Blackguard"],      gate:{ level:25, deed:"Refuse succour three times." } },
  "Lightbringer": { tier:3, role:"support", hint:"Walks with Lumen.",
                    from:["Cleric"],          gate:{ level:25, deed:"Mend a Void-wound." } },
  "Archon":       { tier:3, role:"caster",  hint:"Speaks and the storm answers.",
                    from:["Invoker"],         gate:{ level:25, deed:"Cast every named element at least once." } },
  "Sigil-Weaver": { tier:3, role:"caster",  hint:"Threads two sigils as one.",
                    from:["Invoker","Initiate"], gate:{ level:25, deed:"Slot two Embers; survive a battle." } },
};

// ---- Mastery paths within each tier-2 class ----
// Three specializations per class, picked at tier-2 entry; grants a passive + biases skill pool.
const MASTERY_PATHS = {
  Sentinel: [
    { id:"path_bulwark", name:"The Bulwark",   passive:"+2 Ward when front-row; adjacent allies take −1 dmg.",
      signature:"Unyielding — once per battle, cannot be moved." },
    { id:"path_lancer",  name:"The Lancer",    passive:"Reach 1–2 on main weapon; +2 vs charge.",
      signature:"Counter-charge — on charge aimed at you, deal first strike." },
    { id:"path_warden_s",name:"The Warden's Shadow", passive:"Mark one foe per turn; +3 to strike marked.",
      signature:"Oathbound Gaze — marked foes cannot flee." },
  ],
  Knight: [
    { id:"path_lance",    name:"The Lance",    passive:"Charge bonus +4 instead of +3.",
      signature:"Tournament Tilt — Couched Lance crits on 19+." },
    { id:"path_banner",   name:"The Banner",   passive:"Adjacent allies: +1 Resolve, +1 morale.",
      signature:"Banner-Cry every round, not just the first." },
    { id:"path_honor",    name:"The Honourable", passive:"+2 to all rolls while oath intact.",
      signature:"Oath Unbroken — if oath held entire battle, full HP regen after." },
  ],
  Templar: [
    { id:"path_sun",     name:"Path of the Sun",   passive:"+2 vs Void; immune to Silence.",
      signature:"Dawn-Ward — once per battle, all allies: +Lumen bulwark, 2 rounds." },
    { id:"path_vigil",   name:"Path of the Vigil", passive:"Regen 1 HP per end of turn for self and adjacent.",
      signature:"Hold the Night — cannot be reduced below 1 HP while allies stand." },
    { id:"path_sword",   name:"Path of the Sword", passive:"Blessed Blade stacks up to 3 times.",
      signature:"Smite — single attack deals +2d6 radiant, once per battle." },
  ],
  Ronin: [
    { id:"path_two",     name:"Two-Blades",    passive:"Off-hand attacks at full rate.",
      signature:"Cross-Cut — if both hit, +50% dmg." },
    { id:"path_one",     name:"One-Blade",     passive:"+2 crit range when off-hand empty.",
      signature:"Sword-Saint's Rest — refuse all attacks this turn; next turn, all attacks crit." },
    { id:"path_wander",  name:"Wanderer",      passive:"+1 Spd per map-region explored.",
      signature:"Ghost-Step — swap places with any adjacent ally as free action." },
  ],
  Reaver: [
    { id:"path_red",     name:"The Red Edge",  passive:"+1 dmg per missing 10% HP.",
      signature:"Bloodmane — at <40% HP, attacks cannot miss." },
    { id:"path_no_q",    name:"No Quarter",    passive:"On kill, may immediately strike again.",
      signature:"Red Harvest — unlimited follow-ups this turn if each kills." },
    { id:"path_warcry",  name:"Warcry",        passive:"Foes in 2 tiles: −1 Resolve.",
      signature:"Terror — adjacent foes must save or flee one turn." },
  ],
  Blackguard: [
    { id:"path_dread",   name:"Dread",         passive:"Adjacent foes: −1 to attack rolls.",
      signature:"Mark of Woe — target takes double from all allies for 2 rounds." },
    { id:"path_grim",    name:"Grim Fortitude",passive:"Cannot be healed, but +3 Ward.",
      signature:"Unkillable — at 0 HP, continue fighting one more round." },
    { id:"path_void_b",  name:"Void-Touched",  passive:"+2 Arcana; can learn Void skills.",
      signature:"Hollow Name — deal extra dmg vs Lumen." },
  ],
  Cleric: [
    { id:"path_mend",    name:"The Mender",    passive:"Mend restores +50%.",
      signature:"Mass Mend — heal all allies in 2 tiles, once per battle." },
    { id:"path_choir",   name:"Choir",         passive:"Chant of Rest heals adjacent too.",
      signature:"Benediction — entire party regens 2 HP / turn for 3 rounds." },
    { id:"path_lumen",   name:"Lumen-Keeper",  passive:"+2 vs Void; banish undead.",
      signature:"Sunburst — radiant damage to all foes in 3 tiles." },
  ],
  Invoker: [
    { id:"path_ember",   name:"Emberspeaker",  passive:"+2 fire dmg; ignite on crit.",
      signature:"Firestorm — AoE fire, 4-tile radius." },
    { id:"path_frost",   name:"Frost-Tongue",  passive:"+2 cold; spells slow.",
      signature:"Winter's Hall — freeze 3-tile area for 2 rounds." },
    { id:"path_void_i",  name:"Void-Singer",   passive:"Silence on hit; +1 spell focus.",
      signature:"Unname — target loses one skill for rest of battle." },
  ],
};

// ---- Skill library — everything learnable in the Forge ----
// Each skill: {id, name, desc, source(class|sigil|mastery|universal), tier, prereqs:{level,stat,classes,sigil,needs:[skillId]}, signature?:bool}
const SKILL_LIBRARY = [
  // Universal
  { id:"sk_brace",       name:"Brace",            source:"universal", tier:1, desc:"Ready against a charge; cannot be moved.",
    prereqs:{ level:5, stat:{vig:12} } },
  { id:"sk_guard",       name:"Iron Guard",       source:"universal", tier:1, desc:"+2 Ward when defending.",
    prereqs:{ level:7, stat:{wrd:14} } },
  { id:"sk_rally",       name:"Rally",            source:"universal", tier:2, desc:"Restore 1 Resolve to all allies in 2 tiles.",
    prereqs:{ level:12, stat:{res:16} } },

  // Class — Sentinel
  { id:"sk_holdline",    name:"Hold the Line",    source:"class", tier:1, desc:"Allies adjacent gain +1 Ward.",
    prereqs:{ classes:["Sentinel","Squire"], level:6 } },
  { id:"sk_bulwark",     name:"Bulwark",          source:"class", tier:2, desc:"Below 60% HP, gain +3 Ward.",
    prereqs:{ classes:["Sentinel"], level:10, needs:["sk_holdline"] } },
  { id:"sk_cover",       name:"Cover",            source:"class", tier:2, desc:"Intercept an attack on an adjacent ally.",
    prereqs:{ classes:["Sentinel","Templar"], level:10 } },
  { id:"sk_shieldslam",  name:"Shield Slam",      source:"class", tier:1, desc:"Stun an adjacent foe.",
    prereqs:{ classes:["Sentinel","Templar"], level:8, stat:{str:14} } },

  // Class — Knight
  { id:"sk_couched",     name:"Couched Lance",    source:"class", tier:1, desc:"Charge with lance couched; +3 dmg on charge.",
    prereqs:{ classes:["Knight"], level:6 } },
  { id:"sk_rideby",      name:"Ride-By",          source:"class", tier:2, desc:"Attack without ending movement.",
    prereqs:{ classes:["Knight"], level:10, needs:["sk_couched"] } },
  { id:"sk_honorbound",  name:"Honorbound",       source:"class", tier:1, desc:"+2 to all rolls while oath intact.",
    prereqs:{ classes:["Knight","Templar"], level:8 } },
  { id:"sk_bannercry",   name:"Banner-Cry",       source:"class", tier:2, desc:"First turn: all allies +1 atk.",
    prereqs:{ classes:["Knight"], level:12, stat:{res:15} } },

  // Class — Ranger / Scout
  { id:"sk_markquarry",  name:"Mark Quarry",      source:"class", tier:1, desc:"Marked foe takes +2 from next attack.",
    prereqs:{ classes:["Ranger","Scout"], level:5 } },
  { id:"sk_thricedrawn", name:"Thrice-Drawn",     source:"class", tier:2, desc:"Three arrows at marked quarry.",
    prereqs:{ classes:["Ranger"], level:11, needs:["sk_markquarry"] } },
  { id:"sk_leafstep",    name:"Leaf-Step",        source:"class", tier:1, desc:"Move through woodland without cost.",
    prereqs:{ classes:["Ranger","Scout"], level:6 } },
  { id:"sk_feint",       name:"Feint",            source:"class", tier:1, desc:"Before first attack, reduce target's Ward by 2.",
    prereqs:{ classes:["Scout","Ronin"], level:6 } },
  { id:"sk_lowtide",     name:"Low Tide",         source:"class", tier:1, desc:"Adjacent to water: +2 Spd.",
    prereqs:{ classes:["Scout"], level:5 } },

  // Class — Ronin / Reaver
  { id:"sk_twincuts",    name:"Twin Cuts",        source:"class", tier:1, desc:"Off-hand attack at full rate.",
    prereqs:{ classes:["Ronin","Reaver"], level:6 } },
  { id:"sk_sidestep",    name:"Sidestep",         source:"class", tier:1, desc:"Dodge one attack per turn.",
    prereqs:{ classes:["Ronin"], level:7 } },
  { id:"sk_rededge",     name:"Red Edge",         source:"class", tier:2, desc:"Below 40% HP, +30% dmg.",
    prereqs:{ classes:["Reaver"], level:10 } },
  { id:"sk_noquarter",   name:"No Quarter",       source:"class", tier:2, desc:"On kill, take an extra attack.",
    prereqs:{ classes:["Reaver"], level:11, needs:["sk_rededge"] } },

  // Class — Cleric / Acolyte
  { id:"sk_mend",        name:"Mend",             source:"class", tier:1, desc:"Heal an ally 1d6+Focus.",
    prereqs:{ classes:["Acolyte","Cleric","Templar"], level:4 } },
  { id:"sk_lumenward",   name:"Lumen Ward",       source:"class", tier:2, desc:"Ward an ally vs Void.",
    prereqs:{ classes:["Cleric","Templar"], level:10, sigil:["Lumen"] } },
  { id:"sk_chantrest",   name:"Chant of Rest",    source:"class", tier:2, desc:"End-of-turn regen for self & adjacent.",
    prereqs:{ classes:["Cleric","Acolyte"], level:9 } },
  { id:"sk_wardofdawn",  name:"Ward of Dawn",     source:"class", tier:2, desc:"Aura: +Lumen, −Void.",
    prereqs:{ classes:["Templar"], level:12, sigil:["Lumen"] } },
  { id:"sk_blessedblade",name:"Blessed Blade",    source:"class", tier:2, desc:"+1d4 radiant on strike.",
    prereqs:{ classes:["Templar","Cleric"], level:10 } },
  { id:"sk_vigil",       name:"Vigil",            source:"class", tier:1, desc:"Regen 1 HP per end of turn.",
    prereqs:{ classes:["Templar","Acolyte"], level:8 } },

  // Class — Scholar / Invoker / Initiate
  { id:"sk_glyphstone",  name:"Glyph: Stone",     source:"class", tier:1, desc:"Ward ground tile; +2 Def standing on it.",
    prereqs:{ classes:["Scholar","Invoker"], sigil:["Stone"], level:7 } },
  { id:"sk_hoarfrost",   name:"Hoarfrost",        source:"class", tier:1, desc:"Cold spell; slows target.",
    prereqs:{ classes:["Invoker","Initiate"], sigil:["Frost"], level:7 } },
  { id:"sk_embercall",   name:"Ember-Call",       source:"class", tier:1, desc:"Fire spell; burns.",
    prereqs:{ classes:["Invoker"], sigil:["Ember"], level:7 } },
  { id:"sk_echo",        name:"Echo",             source:"class", tier:2, desc:"Cast same spell twice in two turns.",
    prereqs:{ classes:["Scholar","Invoker"], level:11 } },

  // Sigil — unlocked by locket
  { id:"sk_namevoid",    name:"Name the Void",    source:"sigil", tier:2, desc:"Silence a foe for 2 rounds.",
    prereqs:{ sigil:["Void"], stat:{arc:18}, level:10 } },
  { id:"sk_silentsyll",  name:"Silent Syllable",  source:"sigil", tier:1, desc:"Ward vs spellcast.",
    prereqs:{ sigil:["Void"], level:8 } },
  { id:"sk_lumenkindle", name:"Holy Kindle",      source:"sigil", tier:1, desc:"Short-range radiant.",
    prereqs:{ sigil:["Lumen"], classes:["Cleric","Templar","Acolyte"], level:6 } },
  { id:"sk_bramble",     name:"Bramble",          source:"sigil", tier:1, desc:"Entangle adjacent foes.",
    prereqs:{ sigil:["Verdant"], level:6 } },
  { id:"sk_ashenbargain",name:"Ashen Bargain",    source:"sigil", tier:3, desc:"Trade HP for bonus Arcana damage.",
    prereqs:{ sigil:["Ember"], level:14, stat:{arc:20} } },
  { id:"sk_stillair",    name:"Still the Air",    source:"sigil", tier:1, desc:"Nullify ranged attacks, 1 round.",
    prereqs:{ sigil:["Frost"], level:9 } },
  { id:"sk_kindle",      name:"Kindle",           source:"sigil", tier:1, desc:"Rekindle Lumen; adjacent heal.",
    prereqs:{ sigil:["Lumen","Ember"], level:6 } },

  // Mastery signatures — unlocked only via mastery choice
  { id:"sk_crosscut",    name:"Cross-Cut",        source:"mastery", tier:3, desc:"Both-hit combo for bonus dmg.",
    prereqs:{ classes:["Ronin"], level:14 }, mastery:"path_two" },
  { id:"sk_ghoststep",   name:"Ghost-Step",       source:"mastery", tier:3, desc:"Swap places with an ally.",
    prereqs:{ classes:["Ronin"], level:14 }, mastery:"path_wander" },
  { id:"sk_oathgaze",    name:"Oathbound Gaze",   source:"mastery", tier:3, desc:"Marked foes cannot flee.",
    prereqs:{ classes:["Sentinel"], level:14 }, mastery:"path_warden_s" },
  { id:"sk_firestorm",   name:"Firestorm",        source:"mastery", tier:3, desc:"AoE fire; 4-tile radius.",
    prereqs:{ classes:["Invoker"], level:14 }, mastery:"path_ember" },
];

// Get the class's current mastery from unit state (we stash it on unit.mastery)
function getMastery(unit) {
  return unit.mastery || null;
}

// Check whether a unit meets a skill's prerequisites (returns {ok:bool, reasons:[]})
function checkSkill(unit, skill, allUnits) {
  const reasons = [];
  const p = skill.prereqs || {};
  if (p.level && unit.lvl < p.level) {
    reasons.push(`Level ${p.level} required (at ${unit.lvl}).`);
  }
  if (p.classes && !p.classes.includes(unit.cls)) {
    reasons.push(`Class must be one of: ${p.classes.join(", ")}.`);
  }
  if (p.sigil) {
    const unitSigil = unit.sigil;
    const locketSigil = ((window.INVENTORY||{}).locket || []).find(l => l.name === unit.gear.locket)?.sigil;
    const sigils = [unitSigil, locketSigil].filter(Boolean);
    if (!p.sigil.some(s => sigils.includes(s))) {
      reasons.push(`Sigil ${p.sigil.join(" or ")} required (via base or locket).`);
    }
  }
  if (p.stat) {
    Object.entries(p.stat).forEach(([k, v]) => {
      if ((unit.stats[k] || 0) < v) {
        reasons.push(`${k.toUpperCase()} ${v}+ (at ${unit.stats[k] || 0}).`);
      }
    });
  }
  if (p.needs) {
    p.needs.forEach(sid => {
      const needed = SKILL_LIBRARY.find(s => s.id === sid);
      if (needed && !(unit.skills || []).includes(needed.name)) {
        reasons.push(`Must first learn ${needed.name}.`);
      }
    });
  }
  if (skill.mastery && unit.mastery !== skill.mastery) {
    const masterObj = (MASTERY_PATHS[unit.cls] || []).find(m => m.id === skill.mastery);
    reasons.push(`Requires mastery: ${masterObj ? masterObj.name : skill.mastery}.`);
  }
  return { ok: reasons.length === 0, reasons };
}

// ---- Who can train? ----
// Trainer eligibility: class-based (veteran/teaching classes) OR very high level (15+) OR has specific mentor feat.
// Returns true if unit can serve as a trainer AT ALL (not skill-specific).
const TRAINER_CLASSES = new Set([
  "Warden", "Templar", "Blackguard", "Sword-Saint",
  "Scholar", "Invoker", "Cleric", "Sentinel",
  "Ronin", "Ranger", // veterans at T2
]);

function canTrain(unit) {
  if (!unit) return false;
  if (unit.lvl >= 15) return true;
  if (TRAINER_CLASSES.has(unit.cls)) return true;
  if ((unit.feats || []).includes("feat_wardens_crown")) return true;
  return false;
}

// Reason string for why they can't train (for UI)
function trainerReason(unit) {
  if (unit.lvl >= 15) return `Veteran (Lv ${unit.lvl})`;
  if (TRAINER_CLASSES.has(unit.cls)) return `${unit.cls} — proven class`;
  if ((unit.feats || []).includes("feat_wardens_crown")) return "Warden's Crown";
  return null;
}

// Find potential mentors across the household for a given skill — eligible trainers who know it.
function findMentors(skill, allUnits, learnerId) {
  return allUnits.filter(u =>
    u.id !== learnerId &&
    (u.skills || []).includes(skill.name) &&
    canTrain(u)
  );
}

// Bond effect derived from mentor's role (via their class in CLASSES)
// Called during battle prep when both mentor and bonded trainee are in the same party.
function bondEffect(mentor) {
  if (!mentor) return null;
  const cls = (window.CLASSES || {})[mentor.cls] || {};
  const role = cls.role || "striker";
  const mods = {
    tank:    { stat:"res", delta:+2, note:"+2 Resolve · cannot be routed on turn 1" },
    striker: { stat:"str", delta:+2, note:"+2 Strength · first strike crits on ≥18" },
    support: { stat:"wrd", delta:+2, note:"+2 Warding · passive HP regen 1/turn" },
    caster:  { stat:"foc", delta:+2, note:"+2 Focus · first spell costs -1" },
  };
  return { role, ...mods[role] };
}

// Promotion readiness check
function checkPromotion(unit, targetClassId) {
  const target = PROMOTION_TREE[targetClassId];
  if (!target) return { ok:false, reasons:["Unknown class."] };
  const reasons = [];
  if (target.gate) {
    if (target.gate.level && unit.lvl < target.gate.level) {
      reasons.push(`Level ${target.gate.level} required (at ${unit.lvl}).`);
    }
    if (target.gate.deed) {
      // Deed tracking is narrative here — we show it as "pending unless deed.done"
      const done = (unit.deedsDone || []).includes(targetClassId);
      if (!done) reasons.push(`Deed: ${target.gate.deed}`);
    }
  }
  if (target.from && !target.from.includes(unit.cls)) {
    reasons.push(`Must be one of: ${target.from.join(", ")}.`);
  }
  return { ok: reasons.length === 0, reasons };
}

// ---- FEATS — capped at 2 per unit, harder to qualify for, larger effects ----
// Feat shape: { id, name, tagline, desc, effect, prereqs:{ level, classes?, sigil?, stat?, needs?, tier? }, cost? }
const FEATS = [
  // Martial — strikers / tanks
  { id:"feat_lance_mastery",  name:"Lance-Mastery",        tagline:"Born to the charge.",
    desc:"Couched strikes deal ×2 on clear ground; +3 to all charge attacks.",
    effect:"charge ×2 · clearland · Couched Lance always-available",
    prereqs:{ level:14, classes:["Knight","Sentinel"], stat:{str:20}, needs:["sk_couched"] } },

  { id:"feat_ironhold",       name:"Ironhold",             tagline:"The line does not fall while I stand.",
    desc:"While at front row, adjacent allies cannot be reduced below 1 HP by a single strike.",
    effect:"aura: ally-damage-floor · front-row only",
    prereqs:{ level:14, classes:["Sentinel","Templar","Squire"], stat:{wrd:20,res:18} } },

  { id:"feat_bloodmane",      name:"Bloodmane",            tagline:"Wounds are fuel.",
    desc:"Below 40% HP, all attacks cannot miss and deal +30% damage.",
    effect:"low-HP accuracy + dmg",
    prereqs:{ level:14, classes:["Reaver","Ronin","Blackguard"], stat:{str:20,vig:18} } },

  { id:"feat_twinned_blades", name:"Twinned Blades",       tagline:"Two blades, one mind.",
    desc:"Off-hand attacks at full rate AND apply all main-hand riders.",
    effect:"off-hand riders propagate",
    prereqs:{ level:14, classes:["Ronin","Reaver","Scout"], needs:["sk_twincuts"], stat:{skl:18,spd:16} } },

  { id:"feat_swordsaint",     name:"Sword-Saint's Stillness", tagline:"The blade has learned silence.",
    desc:"Refuse one turn; next turn, first attack is guaranteed critical and pierces Ward.",
    effect:"charge-up guaranteed crit",
    prereqs:{ level:16, classes:["Ronin"], stat:{skl:22,foc:18}, needs:["sk_sidestep"] } },

  // Ranged / scout
  { id:"feat_thricedrawn",    name:"The Thrice-Drawn Arrow", tagline:"Three for one.",
    desc:"Marked quarry takes three arrows on your next turn, at +1 rate each.",
    effect:"mark-quarry triple-shot",
    prereqs:{ level:14, classes:["Ranger","Scout"], needs:["sk_markquarry"], stat:{skl:22} } },

  { id:"feat_ghostpath",      name:"Ghost-Path",           tagline:"Unseen across the thorns.",
    desc:"+3 Move; cannot be revealed while in cover; adjacent allies gain Stealth when you move.",
    effect:"aura: stealth-while-moving",
    prereqs:{ level:14, classes:["Scout","Ranger"], stat:{spd:22,skl:18} } },

  // Caster / sigil
  { id:"feat_sigilweave",     name:"Sigil-Weave",          tagline:"Two sigils, one syllable.",
    desc:"Cast with primary sigil counts as casting with locket sigil too — stacks vulnerabilities.",
    effect:"dual-sigil cast",
    prereqs:{ level:16, classes:["Invoker","Scholar","Initiate"], stat:{arc:22,foc:20} } },

  { id:"feat_echoing_voice",  name:"Echoing Voice",        tagline:"What is said, is said twice.",
    desc:"Once per battle, repeat any spell cast this battle at no cost.",
    effect:"free-cast repeat",
    prereqs:{ level:14, classes:["Invoker","Scholar"], needs:["sk_echo"], stat:{arc:20} } },

  { id:"feat_name_of_void",   name:"The Name of Void",     tagline:"Speak and the world forgets.",
    desc:"Silenced foes lose one random skill for rest of battle.",
    effect:"silence → skill-strip",
    prereqs:{ level:16, sigil:["Void"], needs:["sk_namevoid"], stat:{arc:22,foc:20} } },

  // Support / support-adjacent
  { id:"feat_lantern_hand",   name:"Lantern-Hand",         tagline:"The light that never tires.",
    desc:"Mend, Ward, and Kindle cost 0 for first three uses each battle.",
    effect:"free-triage",
    prereqs:{ level:14, classes:["Cleric","Templar","Acolyte"], sigil:["Lumen"], needs:["sk_mend"] } },

  { id:"feat_benediction",    name:"Benediction",          tagline:"The choir carries.",
    desc:"End of turn: entire party regens 2 HP if any ally is below 50%.",
    effect:"conditional party regen",
    prereqs:{ level:14, classes:["Cleric","Templar"], needs:["sk_chantrest"], stat:{wrd:20,foc:18} } },

  // Oath-touched / universal
  { id:"feat_oathkeeper",     name:"Oathkeeper",           tagline:"The word binds the world.",
    desc:"While oath intact: +3 to all rolls; on attempted oath-break, refuse and gain Resolve.",
    effect:"oath-lock bonus",
    prereqs:{ level:16, stat:{res:22,wrd:18}, needs:["sk_honorbound"] } },

  { id:"feat_oathbreaker",    name:"Oathbreaker",          tagline:"The pact undone, the door opened.",
    desc:"Break your oath at will; gain +4 to all rolls for 3 rounds, then -2 permanently until mended.",
    effect:"trade oath for burst",
    prereqs:{ level:16, classes:["Blackguard","Reaver","Ronin"], stat:{str:20,res:16} } },

  { id:"feat_retinue",        name:"Bear a Broader Banner", tagline:"More souls ride behind the sigil.",
    desc:"While you lead a party, you may field one additional soul (Command +1, up to 6 total).",
    effect:"+1 Command when leading",
    prereqs:{ level:10, stat:{wrd:14} } },

  { id:"feat_wardens_crown",  name:"Warden's Crown",       tagline:"The burden becomes a banner.",
    desc:"When leading a party: all allies +2 to first turn; you cannot be critically hit on turn 1.",
    effect:"leader aura",
    prereqs:{ level:18, classes:["Warden","Sentinel","Knight"], stat:{res:22,wrd:20} } },

  { id:"feat_unbroken",       name:"Unbroken",             tagline:"Twice, the morning finds me still standing.",
    desc:"Once per campaign: at 0 HP, rise to 1 HP with full Resolve restored.",
    effect:"campaign-revive",
    prereqs:{ level:18, stat:{vig:22,res:22,wrd:18} } },
];

// Check a feat's prereqs for a unit (returns {ok, reasons})
function checkFeat(unit, feat) {
  const reasons = [];
  const p = feat.prereqs || {};
  if (p.level && unit.lvl < p.level) reasons.push(`Level ${p.level} required (at ${unit.lvl}).`);
  if (p.classes && !p.classes.includes(unit.cls)) reasons.push(`Class must be one of: ${p.classes.join(", ")}.`);
  if (p.sigil) {
    const locketSigil = ((window.INVENTORY||{}).locket || []).find(l => l.name === unit.gear.locket)?.sigil;
    const sigils = [unit.sigil, locketSigil].filter(Boolean);
    if (!p.sigil.some(s => sigils.includes(s))) reasons.push(`Sigil ${p.sigil.join(" or ")} required.`);
  }
  if (p.stat) {
    Object.entries(p.stat).forEach(([k, v]) => {
      if ((unit.stats[k] || 0) < v) reasons.push(`${k.toUpperCase()} ${v}+ (at ${unit.stats[k] || 0}).`);
    });
  }
  if (p.needs) {
    p.needs.forEach(sid => {
      const needed = SKILL_LIBRARY.find(s => s.id === sid);
      if (needed && !(unit.skills || []).includes(needed.name)) reasons.push(`Requires skill: ${needed.name}.`);
    });
  }
  return { ok: reasons.length === 0, reasons };
}

// Relevant feats: any that match class or are universal (no class prereq)
function relevantFeats(unit) {
  return FEATS.filter(f => {
    const p = f.prereqs || {};
    if (!p.classes) return true;
    return p.classes.includes(unit.cls);
  });
}

// ---- Auto-tune: pick best mastery, feats, skills, gear for a unit ----
// Heuristic. Returns { cls, mastery, skills, feats, gear } to merge into unit.
function autoTuneUnit(unit, allUnits) {
  // Pick mastery — first in MASTERY_PATHS[cls] if not already chosen
  const masteries = MASTERY_PATHS[unit.cls] || [];
  const pickedMastery = unit.mastery || (masteries[0] && masteries[0].id) || null;

  // Pick skills — all eligible, prioritize class then sigil then universal, cap at 6
  const known = new Set(unit.skills || []);
  const eligible = SKILL_LIBRARY.filter(sk => {
    if (known.has(sk.name)) return false;
    const p = sk.prereqs || {};
    if (p.classes && !p.classes.includes(unit.cls)) return false;
    const chk = checkSkill(unit, sk, allUnits);
    return chk.ok;
  }).sort((a,b) => {
    const rank = (s) => s.source === "class" ? 0 : s.source === "sigil" ? 1 : s.source === "universal" ? 2 : 3;
    return rank(a) - rank(b) || a.tier - b.tier;
  });
  const newSkills = eligible.slice(0, Math.max(0, 6 - known.size)).map(s => s.name);

  // Pick feats — up to 2 eligible, ranked by tier (implicit via level prereq)
  const existingFeats = unit.feats || [];
  const eligibleFeats = FEATS.filter(f => !existingFeats.includes(f.id) && checkFeat(unit, f).ok);
  const newFeats = eligibleFeats.slice(0, Math.max(0, 2 - existingFeats.length)).map(f => f.id);

  // Pick gear — best-fitting per slot from INVENTORY; we defer to the existing autoEquipAll for one unit
  const INV = window.INVENTORY || {};
  const fits = (slot, item) => !item.allows || item.allows.includes("*") || item.allows.includes(unit.cls);
  const pickBest = (slot) => {
    const pool = (INV[slot] || []).filter(i => fits(slot, i));
    if (pool.length === 0) return unit.gear[slot];
    // Rough scoring: damage > def > anything else
    const scored = pool.map(it => {
      let score = 0;
      if (it.dmg) score += parseInt(String(it.dmg).split(/[–-]/)[1] || it.dmg) || 0;
      if (it.def) score += (parseInt(String(it.def).replace("+","")) || 0) * 2;
      // Prefer locket matching sigil
      if (slot === "locket" && it.sigil === unit.sigil) score += 100;
      return { it, score };
    }).sort((a,b) => b.score - a.score);
    return scored[0].it.name;
  };
  const newGear = {
    main:   pickBest("main"),
    off:    pickBest("off"),
    armor:  pickBest("armor"),
    locket: pickBest("locket"),
  };

  return {
    mastery: pickedMastery,
    skills: [...(unit.skills || []), ...newSkills],
    feats: [...existingFeats, ...newFeats],
    gear: newGear,
  };
}

// ---- Command — how many souls a leader can field ----
// Baseline 2 (leader + 2 others = 3 total). +1 from Retinue feat. Hard cap 6 total.
function commandFor(unit) {
  if (!unit) return 0;
  let cmd = 2;
  if ((unit.feats || []).includes("feat_retinue")) cmd += 1;
  if ((unit.feats || []).includes("feat_wardens_crown")) cmd += 1;
  // Warden class intrinsically commands more
  if (unit.cls === "Warden" || unit.cls === "Bulwark-Lord") cmd += 1;
  return cmd;
}
// How many total souls a party can hold (including leader). If no leader, 1 (only leader slot meaningful).
function partyCapacity(party, units) {
  const leader = party.leaderId ? (units || []).find(u => u.id === party.leaderId) : null;
  if (!leader) return 1;
  return Math.min(6, 1 + commandFor(leader));
}

Object.assign(window, {
  PROMOTION_TREE,
  MASTERY_PATHS,
  SKILL_LIBRARY,
  FEATS,
  TRAINER_CLASSES,
  getMastery,
  checkSkill,
  findMentors,
  canTrain,
  trainerReason,
  bondEffect,
  checkPromotion,
  checkFeat,
  relevantFeats,
  autoTuneUnit,
  commandFor,
  partyCapacity,
});
