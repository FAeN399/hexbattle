// SIGILBORNE — data: units, formations, classes, sigils, parties

const CLASSES = {
  Sentinel:   { tier: 2, role: "tank",    base: "Squire",  hint: "Shield-sworn; holds a lane." },
  Knight:     { tier: 2, role: "striker", base: "Squire",  hint: "Mounted blade; charges the flank." },
  Templar:    { tier: 2, role: "support", base: "Squire",  hint: "Steel and prayer; guards the line." },
  Ronin:      { tier: 2, role: "striker", base: "Squire",  hint: "Unsworn blade; faster than fate." },
  Reaver:     { tier: 2, role: "striker", base: "Squire",  hint: "A red edge; no quarter." },
  Ranger:     { tier: 1, role: "striker", base: "Ranger",  hint: "Long reach; reads the trees." },
  Scout:      { tier: 1, role: "support", base: "Scout",   hint: "Sees what others miss." },
  Acolyte:    { tier: 1, role: "support", base: "Acolyte", hint: "Mends wounds, tempers souls." },
  Cleric:     { tier: 2, role: "support", base: "Acolyte", hint: "Blessing-bearer." },
  Scholar:    { tier: 1, role: "caster",  base: "Scholar", hint: "Reads the old syllables." },
  Invoker:    { tier: 2, role: "caster",  base: "Scholar", hint: "Names the elements and they answer." },
  Warden:     { tier: 3, role: "tank",    base: "Squire",  hint: "Oath-bound bulwark." },
  Blackguard: { tier: 2, role: "tank",    base: "Squire",  hint: "Corrupted vow; grim fortitude." },
  Initiate:   { tier: 1, role: "caster",  base: "Initiate",hint: "Mystery-student; glyphs in hand." },
  Squire:     { tier: 1, role: "tank",    base: "Squire",  hint: "Young steel; promise-bearing." },
};

const SIGILS = {
  Bearing:   { color: "#2b3a5a", glyph: "bearing",   line: "The weight I carry." },
  Edge:      { color: "#7a1e1e", glyph: "edge",      line: "The cut I am for." },
  Shield:    { color: "#3e5277", glyph: "shield",    line: "What I stand before." },
  Ember:     { color: "#a3501f", glyph: "ember",     line: "The fire I tend." },
  Verdant:   { color: "#44623a", glyph: "verdant",   line: "Green and remembering." },
  Tide:      { color: "#2d5a66", glyph: "tide",      line: "Coming and going." },
  Stone:     { color: "#6b5a3f", glyph: "stone",     line: "I do not move." },
  Lumen:     { color: "#a8864a", glyph: "lumen",     line: "I carry a light." },
  Void:      { color: "#3a2a4a", glyph: "void",      line: "The place the world forgot." },
  Frost:     { color: "#5c7a8a", glyph: "frost",     line: "Slow, deliberate cold." },
};

const AFFINITIES = ["Stone", "Tide", "Verdant", "Ember", "Lumen", "Void", "Frost"];

// Formations — stat modifiers per slot (row,col indexed). + means boon, − means cost.
// Row 0 = front, Row 2 = back.
// Each formation has TWO kinds of doctrine effect:
//   leaderBonus — applies ONLY to the unit marked as leader (wherever they sit).
//   retinueBonus — applies to EVERYONE EXCEPT the leader.
// Plus per-slot positional modifiers (slots).
const FORMATIONS = {
  "Wedge": {
    desc: "A spearhead. The leader drives the point; the retinue presses the flanks.",
    preview: [[0,1,0],[1,1,1],[0,1,0]],
    leaderBonus:  { atk: +3, tag: "TIP OF THE SPEAR", note: "Leader strikes first and hardest." },
    retinueBonus: { def: +1, spd: +1, tag: "BEHIND THE BANNER", note: "Retinue keeps pace and formation." },
    slots: {
      "0,1": { atk: +1, lbl: "POINT" },
      "1,0": { def: +1, lbl: "GUARD" }, "1,1": { atk: +1, lbl: "CORE" }, "1,2": { def: +1, lbl: "GUARD" },
      "2,1": { mag: +1, lbl: "REAR" },
    },
    bestFront: "striker",
  },
  "Shieldwall": {
    desc: "Iron across the front. The retinue locks shields; the leader rallies from within.",
    preview: [[1,1,1],[0,1,0],[1,0,1]],
    leaderBonus:  { wrd: +2, res: +2, tag: "BANNER HELD HIGH", note: "Leader's presence steadies the line; morale losses halved." },
    retinueBonus: { def: +3, tag: "LOCKED SHIELDS", note: "Retinue takes 3 less from every blow." },
    slots: {
      "0,0": { def: +1, lbl: "WALL" }, "0,1": { def: +1, lbl: "WALL" }, "0,2": { def: +1, lbl: "WALL" },
      "1,1": { lbl: "CORE" },
      "2,0": { mag: +2, lbl: "REAR" }, "2,2": { mag: +2, lbl: "REAR" },
    },
    bestFront: "tank",
  },
  "Crescent": {
    desc: "A curved front; envelops smaller foes. The leader anchors the centre; retinue flows around.",
    preview: [[1,0,1],[0,1,0],[1,1,1]],
    leaderBonus:  { def: +2, atk: +1, tag: "ANCHOR OF THE HORN", note: "Leader cannot be flanked while retinue stands." },
    retinueBonus: { atk: +2, tag: "THE SWEEP", note: "Retinue hits moving targets for +2 ATK." },
    slots: {
      "0,0": { def: +1, lbl: "HORN" }, "0,2": { def: +1, lbl: "HORN" },
      "1,1": { lbl: "CORE" },
      "2,0": { mag: +1, lbl: "REAR" }, "2,1": { mag: +2, lbl: "REAR" }, "2,2": { mag: +1, lbl: "REAR" },
    },
    bestFront: "striker",
  },
  "Aegis": {
    desc: "The sacred order. A ward-and-blade pairing; the leader chants, the retinue strikes.",
    preview: [[0,1,0],[1,0,1],[0,1,0]],
    leaderBonus:  { mag: +4, tag: "THE CHANT", note: "Leader's magic flows unbroken; +4 MAG, cannot be silenced." },
    retinueBonus: { atk: +2, def: +1, tag: "UNDER THE CHANT", note: "Retinue hits with blessed edge while the chant holds." },
    slots: {
      "0,1": { def: +1, lbl: "VOW" },
      "1,0": { atk: +1, lbl: "HAND" }, "1,2": { atk: +1, lbl: "HAND" },
      "2,1": { mag: +2, lbl: "CHOIR" },
    },
    bestFront: "tank",
  },
};

// Roster — 16 units with Sigilborne attributes
const ROSTER = [
  { id:"u01", name:"Aelric Vance",       cls:"Sentinel",  lvl:18, hp:54, hpmax:60, sigil:"Shield",  affinity:"Stone",   origin:"Borderlands",  calling:"Squire",   nature:"Steadfast", oath:"Will not strike the unarmed", wound:"A brother lost at Caer Voth", align:"Lawful",   stats:{vig:22,foc:15,str:20,arc:8, skl:14,spd:11,wrd:18,res:19,frt:12}, move:4, skills:["Hold the Line","Bulwark","Cover"], attacks:[{name:"Iron Spear", type:"melee", rng:"adj", dmg:"14–17", rate:1}, {name:"Shield Bash", type:"melee", rng:"adj", dmg:"8–10", rate:1, rider:"Stagger"}], gear:{main:"Warden's Spear", off:"Kite Shield", armor:"Mail Hauberk", locket:"Ember of Shield"}, portrait:"heraldry" },
  { id:"u02", name:"Maera of Thrush",    cls:"Ranger",    lvl:16, hp:42, hpmax:46, sigil:"Verdant", affinity:"Verdant", origin:"Wildwood",     calling:"Ranger",   nature:"Cunning",   oath:"Will not slay beasts in their dens", wound:"Arrow-shy in storm", align:"Neutral", stats:{vig:15,foc:18,str:13,arc:7, skl:22,spd:20,wrd:10,res:14,frt:17}, move:5, skills:["Thrice-Drawn","Leaf-Step","Mark Quarry"], attacks:[{name:"Yew Longbow", type:"ranged", rng:"2–4", dmg:"11–14", rate:2}, {name:"Quick Knife", type:"melee", rng:"adj", dmg:"6–8", rate:1}], gear:{main:"Yew Longbow", off:"Woodsman's Knife", armor:"Leather Jerkin", locket:"Ember of Verdant"}, portrait:"heraldry" },
  { id:"u03", name:"Cyren the Hollow",   cls:"Invoker",   lvl:17, hp:31, hpmax:34, sigil:"Void",    affinity:"Void",    origin:"The Inner Wastes", calling:"Scholar", nature:"Haunted", oath:"None", wound:"A name no longer remembered", align:"Chaos",   stats:{vig:10,foc:23,str:8, arc:24,skl:12,spd:13,wrd:15,res:11,frt:9},  move:3, skills:["Name the Void","Silent Syllable","Echo"], attacks:[{name:"Voidspeak", type:"spell", rng:"1–3", dmg:"13–18", rate:1, rider:"Silence"}, {name:"Whispered Bolt", type:"spell", rng:"1–4", dmg:"9–12", rate:1}], gear:{main:"Blackwood Staff", off:"Inkhorn", armor:"Scholar's Robes", locket:"Sigil of Void"}, portrait:"photo:/(placeholder)/cyren.jpg" },
  { id:"u04", name:"Brannoc Reave",      cls:"Reaver",    lvl:17, hp:48, hpmax:52, sigil:"Edge",    affinity:"Ember",   origin:"Coastbreak",   calling:"Squire",   nature:"Volatile",  oath:"Will not retreat first", wound:"Fever-dreams after the Red Road", align:"Chaos", stats:{vig:19,foc:12,str:22,arc:7, skl:17,spd:18,wrd:9, res:11,frt:14}, move:4, skills:["Red Edge","Berserk Step","No Quarter"], attacks:[{name:"Hewing Axe", type:"melee", rng:"adj", dmg:"15–19", rate:1, rider:"Crit x2"}, {name:"Kick", type:"melee", rng:"adj", dmg:"3–5", rate:1}], gear:{main:"Hewing Axe", off:"—", armor:"Studded Leather", locket:"Ember of Edge"}, portrait:"photo:/(placeholder)/brannoc.jpg" },
  { id:"u05", name:"Sister Nell",        cls:"Cleric",    lvl:15, hp:34, hpmax:38, sigil:"Lumen",   affinity:"Lumen",   origin:"Lanternfall",  calling:"Acolyte",  nature:"Devout",    oath:"Will not accept payment for mending", wound:"Nightly headaches after prayer", align:"Lawful", stats:{vig:13,foc:20,str:9, arc:19,skl:14,spd:12,wrd:21,res:18,frt:15}, move:3, skills:["Mend","Lumen Ward","Chant of Rest"], attacks:[{name:"Prayer-Stave", type:"melee", rng:"adj", dmg:"5–7", rate:1}, {name:"Holy Kindle", type:"spell", rng:"1–2", dmg:"8–11", rate:1}], gear:{main:"Prayer-Stave", off:"Holy Symbol", armor:"Cotton Vestments", locket:"Ember of Lumen"}, portrait:"photo:/(placeholder)/nell.jpg" },
  { id:"u06", name:"Iskel Morrow",       cls:"Knight",    lvl:17, hp:50, hpmax:54, sigil:"Bearing", affinity:"Stone",   origin:"Highmarch",    calling:"Squire",   nature:"Luminous",  oath:"Will not break faith with sworn word", wound:"Gait favors left leg", align:"Lawful", stats:{vig:20,foc:14,str:21,arc:8, skl:16,spd:17,wrd:14,res:17,frt:13}, move:5, skills:["Couched Lance","Honorbound","Ride-By"], attacks:[{name:"Lance", type:"melee", rng:"adj", dmg:"14–18", rate:1, rider:"Charge +3"}, {name:"Arming Sword", type:"melee", rng:"adj", dmg:"9–12", rate:1}], gear:{main:"Knightly Lance", off:"Heater Shield", armor:"Plate Harness", locket:"Ember of Bearing"}, portrait:"heraldry" },
  { id:"u07", name:"Halric Fenn",        cls:"Scout",     lvl:14, hp:36, hpmax:40, sigil:"Tide",    affinity:"Tide",    origin:"Coastal",      calling:"Scout",    nature:"Cunning",   oath:"None", wound:"Lost a finger, keeps the ring", align:"Neutral", stats:{vig:14,foc:16,str:12,arc:9, skl:19,spd:22,wrd:11,res:12,frt:16}, move:6, skills:["Feint","Low Tide","Read the Reeds"], attacks:[{name:"Paired Daggers", type:"melee", rng:"adj", dmg:"9–12", rate:2}, {name:"Sling", type:"ranged", rng:"1–3", dmg:"5–7", rate:1}], gear:{main:"Paired Daggers", off:"Sling", armor:"Padded Jacket", locket:"—"}, portrait:"heraldry" },
  { id:"u08", name:"Yrsa Dawnborn",      cls:"Templar",   lvl:16, hp:46, hpmax:50, sigil:"Lumen",   affinity:"Lumen",   origin:"Highmarch",    calling:"Squire",   nature:"Devout",    oath:"Will not harm the touched-by-void", wound:"Vision blurs at dusk", align:"Lawful", stats:{vig:18,foc:17,str:17,arc:15,skl:15,spd:12,wrd:19,res:18,frt:14}, move:4, skills:["Ward of Dawn","Blessed Blade","Vigil"], attacks:[{name:"Warhammer", type:"melee", rng:"adj", dmg:"12–15", rate:1, rider:"vs Void x1.5"}, {name:"Smite", type:"spell", rng:"adj", dmg:"7–10", rate:1}], gear:{main:"Blessed Hammer", off:"Heater Shield", armor:"Scale Coat", locket:"Ember of Lumen"}, portrait:"heraldry" },
  { id:"u09", name:"Ondrick Vale",       cls:"Scholar",   lvl:14, hp:28, hpmax:32, sigil:"Stone",   affinity:"Stone",   origin:"Inner Wastes", calling:"Scholar",  nature:"Volatile",  oath:"Will not lie in written word", wound:"Fevers when he reads too long", align:"Neutral", stats:{vig:9, foc:22,str:7, arc:23,skl:13,spd:11,wrd:14,res:10,frt:8},  move:3, skills:["Glyph: Stone","Read Weather","Inkmark"], attacks:[{name:"Stone Mote", type:"spell", rng:"1–3", dmg:"10–13", rate:1}, {name:"Quarterstaff", type:"melee", rng:"adj", dmg:"4–6", rate:1}], gear:{main:"Quarterstaff", off:"Grimoire", armor:"Robes", locket:"Ember of Stone"}, portrait:"heraldry" },
  { id:"u10", name:"Mariel of the Locks", cls:"Ronin",    lvl:16, hp:44, hpmax:48, sigil:"Edge",    affinity:"Ember",   origin:"Coastbreak",   calling:"Squire",   nature:"Cunning",   oath:"Will not kneel", wound:"Exiled from a house that no longer stands", align:"Chaos", stats:{vig:17,foc:15,str:19,arc:9, skl:21,spd:20,wrd:10,res:13,frt:13}, move:5, skills:["Twin Cuts","Sidestep","Rallying Cry"], attacks:[{name:"Long & Short", type:"melee", rng:"adj", dmg:"11–14", rate:2}, {name:"Throwing Blades", type:"ranged", rng:"1–2", dmg:"6–8", rate:1}], gear:{main:"Daishō", off:"Tantō", armor:"Silk Armor", locket:"Ember of Edge"}, portrait:"heraldry" },
  { id:"u11", name:"Brother Kell",       cls:"Acolyte",   lvl:12, hp:30, hpmax:34, sigil:"Bearing", affinity:"Lumen",   origin:"Lanternfall",  calling:"Acolyte",  nature:"Steadfast", oath:"Will not speak ill of the dead", wound:"Cannot form bond with Cyren", align:"Lawful", stats:{vig:12,foc:18,str:10,arc:16,skl:12,spd:10,wrd:19,res:16,frt:14}, move:3, skills:["Mend","Soothing Hand"], attacks:[{name:"Walking Staff", type:"melee", rng:"adj", dmg:"4–6", rate:1}, {name:"Prayer", type:"spell", rng:"1–2", dmg:"6–9", rate:1}], gear:{main:"Walking Staff", off:"Censer", armor:"Cotton Robes", locket:"—"}, portrait:"heraldry" },
  { id:"u12", name:"Tovar Kesh",         cls:"Initiate",  lvl:13, hp:30, hpmax:32, sigil:"Frost",   affinity:"Frost",   origin:"Highmarch",    calling:"Initiate", nature:"Haunted",   oath:"Will not cast fire", wound:"Hears ice under his feet", align:"Neutral", stats:{vig:10,foc:21,str:8, arc:22,skl:13,spd:12,wrd:15,res:12,frt:10}, move:3, skills:["Hoarfrost","Still the Air"], attacks:[{name:"Frost Lance", type:"spell", rng:"1–3", dmg:"11–14", rate:1, rider:"Slow"}, {name:"Walking Staff", type:"melee", rng:"adj", dmg:"4–5", rate:1}], gear:{main:"Frostwood Staff", off:"—", armor:"Fur-lined Robes", locket:"Ember of Frost"}, portrait:"heraldry" },
  { id:"u13", name:"Sigrid Harrow",      cls:"Sentinel",  lvl:15, hp:50, hpmax:54, sigil:"Shield",  affinity:"Stone",   origin:"Borderlands",  calling:"Squire",   nature:"Steadfast", oath:"Will not retreat while an ally stands", wound:"Scar across the chin", align:"Lawful", stats:{vig:21,foc:13,str:18,arc:6, skl:13,spd:10,wrd:17,res:19,frt:11}, move:4, skills:["Hold the Line","Shield Slam"], attacks:[{name:"Guisarme", type:"melee", rng:"1–2", dmg:"12–15", rate:1}, {name:"Shield Slam", type:"melee", rng:"adj", dmg:"6–8", rate:1, rider:"Stun"}], gear:{main:"Guisarme", off:"Tower Shield", armor:"Plate Harness", locket:"Ember of Shield"}, portrait:"heraldry" },
  { id:"u14", name:"Perrin Oak",         cls:"Ranger",    lvl:13, hp:36, hpmax:40, sigil:"Verdant", affinity:"Verdant", origin:"Wildwood",     calling:"Ranger",   nature:"Luminous",  oath:"Will not cut a standing tree", wound:"A hawk that will not return", align:"Neutral", stats:{vig:14,foc:16,str:12,arc:7, skl:20,spd:19,wrd:10,res:13,frt:16}, move:5, skills:["Mark Quarry","Bramble"], attacks:[{name:"Shortbow", type:"ranged", rng:"1–3", dmg:"8–11", rate:2}, {name:"Handaxe", type:"melee", rng:"adj", dmg:"6–9", rate:1}], gear:{main:"Shortbow", off:"Handaxe", armor:"Forester's Coat", locket:"—"}, portrait:"heraldry" },
  { id:"u15", name:"Ilya Branch",        cls:"Scout",     lvl:12, hp:32, hpmax:36, sigil:"Tide",    affinity:"Tide",    origin:"Coastal",      calling:"Scout",    nature:"Cunning",   oath:"None", wound:"Speaks rarely", align:"Neutral", stats:{vig:12,foc:14,str:11,arc:8, skl:18,spd:21,wrd:10,res:11,frt:15}, move:6, skills:["Low Tide","Quickstep"], attacks:[{name:"Shortsword", type:"melee", rng:"adj", dmg:"7–10", rate:1}, {name:"Sling", type:"ranged", rng:"1–3", dmg:"4–6", rate:1}], gear:{main:"Shortsword", off:"Sling", armor:"Padded Jacket", locket:"—"}, portrait:"heraldry" },
  { id:"u16", name:"Dama Verenn",        cls:"Invoker",   lvl:15, hp:30, hpmax:34, sigil:"Ember",   affinity:"Ember",   origin:"Inner Wastes", calling:"Scholar",  nature:"Volatile",  oath:"Will not douse a living flame", wound:"Burn-scars on both hands", align:"Chaos", stats:{vig:10,foc:22,str:7, arc:23,skl:12,spd:14,wrd:13,res:10,frt:11}, move:3, skills:["Ember-Call","Kindle","Ashen Bargain"], attacks:[{name:"Ember-Call", type:"spell", rng:"1–3", dmg:"12–16", rate:1, rider:"Burn"}, {name:"Walking Staff", type:"melee", rng:"adj", dmg:"3–5", rate:1}], gear:{main:"Ashwood Staff", off:"Ember Locket", armor:"Robes", locket:"Ember of Ember"}, portrait:"heraldry" },
];

// Parties — initial deployment (3x3 grid positions; empty = null)
// row,col where row 0 = front, 2 = back; col 0 = left, 2 = right
const INITIAL_PARTIES = [
  {
    id: "p1",
    name: "First Hand of Aelric",
    motto: "Stand and be counted.",
    formation: "Shieldwall",
    leaderId: "u01",
    deployed: false,
    grid: {
      "0,0": "u13", "0,1": "u01", "0,2": "u08",
      "1,1": "u05",
      "2,0": "u03", "2,2": null,
    },
  },
  {
    id: "p2",
    name: "Lance of Morrow",
    motto: "Swift and sworn.",
    formation: "Wedge",
    leaderId: "u06",
    deployed: false,
    grid: {
      "0,1": "u06",
      "1,0": "u10", "1,1": null, "1,2": "u04",
      "2,1": "u12",
    },
  },
  {
    id: "p3",
    name: "Green Spear",
    motto: "Given the wood; given the arrow.",
    formation: "Crescent",
    leaderId: "u02",
    deployed: false,
    grid: {
      "0,0": "u02", "0,2": "u14",
      "1,1": "u07",
      "2,0": null, "2,1": "u09", "2,2": null,
    },
  },
  {
    id: "p4",
    name: "Lantern Choir",
    motto: "A light against the hollow.",
    formation: "Aegis",
    leaderId: null,
    deployed: false,
    grid: {
      "0,1": null,
      "1,0": null, "1,2": "u11",
      "2,1": "u16",
    },
  },
];

Object.assign(window, { CLASSES, SIGILS, AFFINITIES, FORMATIONS, ROSTER, INITIAL_PARTIES });

// ---- Mustering Grounds — recruitable souls waiting at the roadhouse ----
// Each has a price in crowns. Recruiting adds them to the household roster.
const MUSTERING_POOL = [
  { id:"r01", name:"Ashe Bellomar",     cls:"Ronin",    lvl:14, hp:40, hpmax:44, sigil:"Edge",   affinity:"Ember",  origin:"Coastbreak",   calling:"Squire",   nature:"Volatile",  oath:"Will not swear a second oath", wound:"A ring he does not wear", align:"Chaos", price:240,
    line:"Left a house that no longer burns. Sells a good sword for coin and quiet.",
    stats:{vig:16,foc:14,str:19,arc:8, skl:20,spd:19,wrd:11,res:12,frt:13}, move:5,
    skills:["Twin Cuts","Sidestep"], attacks:[{name:"Paired Blades", type:"melee", rng:"adj", dmg:"10–13", rate:2}], gear:{main:"Paired Blades", off:"—", armor:"Silk Gambeson", locket:"—"}, portrait:"heraldry" },

  { id:"r02", name:"Teth of the Hollow", cls:"Initiate", lvl:11, hp:26, hpmax:30, sigil:"Void",   affinity:"Void",   origin:"Inner Wastes", calling:"Initiate", nature:"Haunted",   oath:"None", wound:"Eyes do not close in full", align:"Chaos", price:180,
    line:"Orphan of a place that is no longer on maps. Cheap; strange.",
    stats:{vig:9, foc:20,str:7, arc:21,skl:12,spd:12,wrd:13,res:10,frt:9},  move:3,
    skills:["Name the Void"], attacks:[{name:"Hollow Bolt", type:"spell", rng:"1–3", dmg:"9–12", rate:1, rider:"Silence"}], gear:{main:"Ashwood Staff", off:"—", armor:"Pilgrim Robes", locket:"—"}, portrait:"heraldry" },

  { id:"r03", name:"Odrey Pallman",      cls:"Squire",   lvl:6,  hp:24, hpmax:26, sigil:"Bearing",affinity:"Stone",  origin:"Highmarch",    calling:"Squire",   nature:"Luminous",  oath:"Will not strike the unarmed", wound:"None declared", align:"Lawful", price:90,
    line:"A farmer's son. Sixteen winters. Keeps his grandfather's helm.",
    stats:{vig:14,foc:10,str:13,arc:6, skl:11,spd:10,wrd:11,res:12,frt:10}, move:4,
    skills:["Brace"], attacks:[{name:"Spear", type:"melee", rng:"1–2", dmg:"7–9", rate:1}], gear:{main:"Spear", off:"Wooden Shield", armor:"Gambeson", locket:"—"}, portrait:"heraldry" },

  { id:"r04", name:"Sir Dalven Aech",    cls:"Knight",   lvl:20, hp:58, hpmax:62, sigil:"Bearing",affinity:"Stone",  origin:"Highmarch",    calling:"Squire",   nature:"Steadfast", oath:"Will not break faith with sworn word", wound:"A wife he outlived", align:"Lawful", price:520,
    line:"Twenty years in steel. Asks a fair wage and a good stable.",
    stats:{vig:22,foc:15,str:23,arc:9, skl:18,spd:17,wrd:16,res:19,frt:14}, move:5,
    skills:["Couched Lance","Honorbound","Ride-By","Banner-Cry"], attacks:[{name:"Great Lance", type:"melee", rng:"adj", dmg:"16–20", rate:1, rider:"Charge +4"}], gear:{main:"Great Lance", off:"Heater Shield", armor:"Full Harness", locket:"Lesser Sigil of Bearing"}, portrait:"heraldry" },

  { id:"r05", name:"Moira Tenn",         cls:"Acolyte",  lvl:9,  hp:26, hpmax:30, sigil:"Lumen",  affinity:"Lumen",   origin:"Lanternfall",  calling:"Acolyte",  nature:"Devout",    oath:"Will not accept payment for mending", wound:"Night-terrors", align:"Lawful", price:140,
    line:"Novice of the Lantern. Will mend for bread and shelter.",
    stats:{vig:11,foc:17,str:9, arc:16,skl:12,spd:11,wrd:18,res:15,frt:13}, move:3,
    skills:["Mend"], attacks:[{name:"Kindle", type:"spell", rng:"1–2", dmg:"6–8", rate:1}], gear:{main:"Prayer-Stave", off:"Holy Symbol", armor:"Vestments", locket:"—"}, portrait:"heraldry" },

  { id:"r06", name:"Harn the Quiet",     cls:"Scout",    lvl:13, hp:34, hpmax:38, sigil:"Tide",   affinity:"Tide",    origin:"Coastal",      calling:"Scout",    nature:"Cunning",   oath:"Will not speak his true name", wound:"A stammer that vanishes in battle", align:"Neutral", price:210,
    line:"Smuggler turned outrider. Knows every goat-track north of Thornmere.",
    stats:{vig:13,foc:15,str:12,arc:8, skl:19,spd:22,wrd:11,res:11,frt:16}, move:6,
    skills:["Feint","Read the Reeds"], attacks:[{name:"Paired Knives", type:"melee", rng:"adj", dmg:"8–11", rate:2}], gear:{main:"Paired Knives", off:"Sling", armor:"Oilskin", locket:"—"}, portrait:"heraldry" },

  { id:"r07", name:"Brenna Vorn",        cls:"Reaver",   lvl:17, hp:48, hpmax:52, sigil:"Edge",   affinity:"Ember",   origin:"Coastbreak",   calling:"Squire",   nature:"Volatile",  oath:"Will not retreat first", wound:"Missing the little finger of her off-hand", align:"Chaos", price:380,
    line:"Free-company captain, between contracts. Drinks her own wages.",
    stats:{vig:19,foc:12,str:22,arc:7, skl:18,spd:18,wrd:9, res:12,frt:14}, move:4,
    skills:["Red Edge","No Quarter"], attacks:[{name:"Hewing Axe", type:"melee", rng:"adj", dmg:"14–18", rate:1}], gear:{main:"Hewing Axe", off:"Buckler", armor:"Studded Leather", locket:"—"}, portrait:"heraldry" },

  { id:"r08", name:"Old Emrie",          cls:"Scholar",  lvl:16, hp:28, hpmax:32, sigil:"Stone",  affinity:"Stone",   origin:"Inner Wastes", calling:"Scholar",  nature:"Steadfast", oath:"Will not lie in written word", wound:"Goes blind in bright sun", align:"Neutral", price:300,
    line:"Retired from the Archive. Will ride if the question is interesting.",
    stats:{vig:9, foc:23,str:7, arc:22,skl:14,spd:10,wrd:15,res:12,frt:9},  move:3,
    skills:["Glyph: Stone","Read Weather","Inkmark"], attacks:[{name:"Stone Mote", type:"spell", rng:"1–3", dmg:"11–14", rate:1}], gear:{main:"Oak Staff", off:"Grimoire", armor:"Travel Robes", locket:"Ember of Stone"}, portrait:"heraldry" },
];

// ---- Postings — campaign-scale jobs pinned to the board ----
// Each specifies how many banners the job demands (min / max) and a reward in crowns.
const POSTINGS = [
  { id:"j01", title:"Break the Siege at Thornmere",
    petitioner:"Reeve Halvic of Thornmere",
    region:"Borderlands · Thornmere",
    risk:"Grim",
    minParties:2, maxParties:3,
    reward:640, reputation:"+Crown, +Borderlands",
    timeLimit:"Before the third moon",
    stakes:"The town has held for eleven days. The walls will not hold a twelfth. Bring banners enough to lift the line and break the besieger's camp.",
    tags:["siege","field-battle","Stone"],
    affinityBias:"Stone / Bearing" },

  { id:"j02", title:"Escort the Heir across the Inner Wastes",
    petitioner:"Hand of the Crown",
    region:"Inner Wastes · Via the Hollow Mile",
    risk:"Perilous",
    minParties:1, maxParties:2,
    reward:480, reputation:"+Crown",
    timeLimit:"Depart by the new moon",
    stakes:"A child of no known name is to be moved three hundred leagues through void-touched country. Speed and quiet matter more than strength. Send your swiftest.",
    tags:["escort","stealth-favored","Void-ward"],
    affinityBias:"Lumen / Void-resist" },

  { id:"j03", title:"Burn the Void-Cairn at Ashmere",
    petitioner:"The Lanternfall Consistory",
    region:"Lanternfall · Ashmere Fen",
    risk:"Grave",
    minParties:1, maxParties:1,
    reward:320, reputation:"+Lantern",
    timeLimit:"Any moon",
    stakes:"A cairn built wrong, built hollow. Something waits under it. One party, quick; more bodies draw more attention than they bring. Bring fire. Bring prayer.",
    tags:["solo-party","ritual","Void"],
    affinityBias:"Lumen" },

  { id:"j04", title:"Retake the Whitefoss Road",
    petitioner:"The Reeve of Highmarch",
    region:"Highmarch · Whitefoss Pass",
    risk:"Hard",
    minParties:2, maxParties:4,
    reward:880, reputation:"+Highmarch",
    timeLimit:"Before the thaw",
    stakes:"Bandits — no, a standing company now — have closed the pass. Four banners can clear it in a week; two will take the season and bleed for it. Your call.",
    tags:["campaign","pitched-battle"],
    affinityBias:"any" },

  { id:"j05", title:"The Hollow Heir — Investigate",
    petitioner:"Anonymous. Paid in advance.",
    region:"Wildwood · The Thrush Roads",
    risk:"Unknown",
    minParties:1, maxParties:2,
    reward:260, reputation:"???",
    timeLimit:"—",
    stakes:"A letter sealed in black wax. Coordinates, a name, and the instruction: \"Find what walks there. Do not speak to it.\" No further terms. The purse is heavy.",
    tags:["mystery","low-intel"],
    affinityBias:"Void-aware" },

  { id:"j06", title:"Relieve the Lantern at Caer Voth",
    petitioner:"Prior Halse of the Lantern",
    region:"Borderlands · Caer Voth",
    risk:"Bitter",
    minParties:1, maxParties:2,
    reward:420, reputation:"+Lantern, +Crown",
    timeLimit:"Before Lantern's Eve",
    stakes:"The keep has burned before. It will burn again if the garrison is not relieved and reinforced. Hold it. Bring a Cleric who can sleep with one eye open.",
    tags:["garrison","hold-the-line"],
    affinityBias:"Lumen / Shield" },

  { id:"j07", title:"The Coastbreak Contract",
    petitioner:"The Salt League (merchant syndicate)",
    region:"Coastbreak · Harbour district",
    risk:"Moderate",
    minParties:1, maxParties:3,
    reward:560, reputation:"+Salt League (coin, not honour)",
    timeLimit:"By the Lammas markets",
    stakes:"Protect three caravans moving salt and grain north. The League will pay well and ask no questions about the means.",
    tags:["escort-multi","political"],
    affinityBias:"any" },

  { id:"j08", title:"Tend the Wound at Oakenshiver",
    petitioner:"The Circle of the Green Hand",
    region:"Wildwood · Oakenshiver Grove",
    risk:"Low",
    minParties:1, maxParties:1,
    reward:160, reputation:"+Wildwood",
    timeLimit:"—",
    stakes:"A grove is sickening. The Circle asks a small party — respectful, quiet — to sit with it, learn what ails it, and bring word. Not a battle. A vigil.",
    tags:["investigation","ritual","no-combat-expected"],
    affinityBias:"Verdant" },
];

const STARTING_TREASURY = 720; // crowns
const WARDEN_RANK_CAP = 4;     // max banners at rank III

// ---- Travel days by risk — how long a banner is afield after being sealed ----
const TRAVEL_DAYS_BY_RISK = {
  "Low":       3,
  "Moderate":  4,
  "Hard":      5,
  "Bitter":    5,
  "Unknown":   6,
  "Grim":      6,
  "Perilous":  7,
  "Grave":     8,
};
function travelDaysFor(posting) {
  return TRAVEL_DAYS_BY_RISK[posting.risk] || 5;
}

Object.assign(window, { MUSTERING_POOL, POSTINGS, STARTING_TREASURY, WARDEN_RANK_CAP, TRAVEL_DAYS_BY_RISK, travelDaysFor });

// ---- Inventory — alternate gear available from the Warden's stores ----
// Each unit can swap into any item whose "allows" class-family matches. Simple.
const INVENTORY = {
  main: [
    { id:"m_spear",     name:"Warden's Spear",    kind:"polearm", dmg:"14–17", allows:["Sentinel","Knight","Squire"], note:"+2 vs cavalry" },
    { id:"m_guisarme",  name:"Guisarme",          kind:"polearm", dmg:"12–15", allows:["Sentinel","Knight","Squire"], note:"reach 1–2" },
    { id:"m_lance",     name:"Knightly Lance",    kind:"polearm", dmg:"14–18", allows:["Knight","Sentinel"], note:"Charge +3" },
    { id:"m_glance",    name:"Great Lance",       kind:"polearm", dmg:"16–20", allows:["Knight"], note:"Charge +4 · two-hand" },
    { id:"m_hewaxe",    name:"Hewing Axe",        kind:"axe",     dmg:"15–19", allows:["Reaver","Blackguard","Squire"], note:"Crit ×2" },
    { id:"m_longbow",   name:"Yew Longbow",       kind:"bow",     dmg:"11–14", allows:["Ranger","Scout"], note:"rate ×2" },
    { id:"m_shortbow",  name:"Shortbow",          kind:"bow",     dmg:"8–11",  allows:["Ranger","Scout"], note:"rate ×2" },
    { id:"m_daisho",    name:"Daishō",            kind:"paired",  dmg:"11–14", allows:["Ronin","Reaver"], note:"rate ×2" },
    { id:"m_daggers",   name:"Paired Daggers",    kind:"paired",  dmg:"9–12",  allows:["Scout","Ronin"], note:"rate ×2" },
    { id:"m_stave",     name:"Prayer-Stave",      kind:"stave",   dmg:"5–7",   allows:["Cleric","Acolyte","Templar"], note:"blesses" },
    { id:"m_blackwood", name:"Blackwood Staff",   kind:"stave",   dmg:"6–8",   allows:["Invoker","Scholar","Initiate"], note:"+1 spell dmg" },
    { id:"m_ashwood",   name:"Ashwood Staff",     kind:"stave",   dmg:"5–7",   allows:["Invoker","Scholar","Initiate"], note:"+2 Ember" },
    { id:"m_frostwood", name:"Frostwood Staff",   kind:"stave",   dmg:"5–7",   allows:["Invoker","Scholar","Initiate"], note:"+2 Frost" },
    { id:"m_warhmr",    name:"Blessed Hammer",    kind:"mace",    dmg:"12–15", allows:["Templar","Cleric"], note:"×1.5 vs Void" },
    { id:"m_shortswd",  name:"Shortsword",        kind:"sword",   dmg:"7–10",  allows:["Scout","Squire","Ranger"], note:"—" },
  ],
  off: [
    { id:"o_kite",   name:"Kite Shield",    kind:"shield", def:"+3", allows:["Sentinel","Templar","Squire"], note:"front guard" },
    { id:"o_tower",  name:"Tower Shield",   kind:"shield", def:"+5", allows:["Sentinel","Templar"], note:"-1 Spd" },
    { id:"o_heater", name:"Heater Shield",  kind:"shield", def:"+2", allows:["Knight","Sentinel","Templar"], note:"—" },
    { id:"o_buckler",name:"Buckler",        kind:"shield", def:"+1", allows:["Reaver","Ronin","Scout","Squire"], note:"+1 Parry" },
    { id:"o_knife", name:"Woodsman's Knife",kind:"blade",  def:"+0", allows:["Ranger","Scout","Ronin"], note:"skin & strip" },
    { id:"o_tanto", name:"Tantō",           kind:"blade",  def:"+0", allows:["Ronin"], note:"off-hand rate" },
    { id:"o_sling", name:"Sling",           kind:"ranged", def:"+0", allows:["Scout","Ranger"], note:"rng 1–3" },
    { id:"o_symbol",name:"Holy Symbol",     kind:"icon",   def:"+0", allows:["Cleric","Templar","Acolyte"], note:"+1 Heal" },
    { id:"o_inkhorn",name:"Inkhorn",        kind:"focus",  def:"+0", allows:["Scholar","Invoker","Initiate"], note:"+1 spell focus" },
    { id:"o_grimoire",name:"Grimoire",      kind:"focus",  def:"+0", allows:["Scholar","Invoker","Initiate"], note:"+1 skill cap" },
    { id:"o_none",  name:"—",               kind:"—",      def:"+0", allows:["*"], note:"" },
  ],
  armor: [
    { id:"a_plate",   name:"Plate Harness",   weight:"heavy",  def:"+5", allows:["Sentinel","Knight","Templar"], note:"-1 Spd" },
    { id:"a_mail",    name:"Mail Hauberk",    weight:"heavy",  def:"+4", allows:["Sentinel","Knight","Templar","Squire"], note:"—" },
    { id:"a_scale",   name:"Scale Coat",      weight:"medium", def:"+3", allows:["Templar","Knight","Reaver","Squire"], note:"—" },
    { id:"a_studded", name:"Studded Leather", weight:"medium", def:"+2", allows:["Reaver","Ronin","Ranger","Scout"], note:"—" },
    { id:"a_leather", name:"Leather Jerkin",  weight:"light",  def:"+2", allows:["Ranger","Scout","Ronin"], note:"+1 Spd" },
    { id:"a_padded",  name:"Padded Jacket",   weight:"light",  def:"+1", allows:["Scout","Ranger","Squire"], note:"+1 Spd" },
    { id:"a_silk",    name:"Silk Armor",      weight:"light",  def:"+2", allows:["Ronin","Reaver"], note:"+1 Parry" },
    { id:"a_robes",   name:"Scholar's Robes", weight:"cloth",  def:"+0", allows:["Scholar","Invoker","Initiate"], note:"+2 Arc" },
    { id:"a_vest",    name:"Cotton Vestments",weight:"cloth",  def:"+0", allows:["Cleric","Acolyte"], note:"+1 Wrd" },
    { id:"a_fur",     name:"Fur-lined Robes", weight:"cloth",  def:"+1", allows:["Initiate","Scholar","Invoker"], note:"+2 Frost res" },
  ],
  locket: [
    { id:"l_none",    name:"—",                   sigil:"—",       note:"no locket" },
    { id:"l_bearing", name:"Ember of Bearing",    sigil:"Bearing", note:"+1 Res, opens Bearing skills" },
    { id:"l_edge",    name:"Ember of Edge",       sigil:"Edge",    note:"+1 Str, opens Edge skills" },
    { id:"l_shield",  name:"Ember of Shield",     sigil:"Shield",  note:"+1 Wrd, opens Shield skills" },
    { id:"l_ember",   name:"Ember of Ember",      sigil:"Ember",   note:"+2 Fire, opens Ember skills" },
    { id:"l_verdant", name:"Ember of Verdant",    sigil:"Verdant", note:"+1 Skl, opens Verdant skills" },
    { id:"l_tide",    name:"Ember of Tide",       sigil:"Tide",    note:"+1 Spd, opens Tide skills" },
    { id:"l_stone",   name:"Ember of Stone",      sigil:"Stone",   note:"+1 Vig, opens Stone skills" },
    { id:"l_lumen",   name:"Ember of Lumen",      sigil:"Lumen",   note:"+1 Wrd vs Void" },
    { id:"l_void",    name:"Sigil of Void",       sigil:"Void",    note:"opens Void skills; drains Lumen" },
    { id:"l_frost",   name:"Ember of Frost",      sigil:"Frost",   note:"+2 Cold" },
    { id:"l_lesser_bearing", name:"Lesser Sigil of Bearing", sigil:"Bearing", note:"as Ember, but stronger" },
  ],
};

// ---- Battle doctrine library — picks for the ordered action slots ----
// Each entry is something a unit can be set to do in its action slots.
// Available ones are filtered by class/skills/gear.
const BATTLE_ACTIONS = [
  // Basic attacks (always available — pulls from unit's attacks[])
  { id:"atk:main",     name:"Strike (main-hand)",      kind:"basic",   trigger:"any foe in range",     cost:"—",         tags:["melee/ranged"],  always:true },
  { id:"atk:off",      name:"Strike (off-hand)",       kind:"basic",   trigger:"any foe in range",     cost:"—",         tags:["off-hand"],      always:true },
  { id:"def:guard",    name:"Guard",                   kind:"basic",   trigger:"no better action",     cost:"—",         tags:["def"],           always:true },
  { id:"def:hold",     name:"Hold the Line",           kind:"basic",   trigger:"flanking ally present",cost:"—",         tags:["def","aura"],    always:true },
  // Skill actions (available if unit has the skill)
  { id:"sk:bulwark",   name:"Bulwark",                 kind:"skill",   trigger:"HP < 60%",             cost:"1 Resolve", tags:["def"],   requires:["Bulwark"] },
  { id:"sk:cover",     name:"Cover",                   kind:"skill",   trigger:"ally adjacent hit",    cost:"—",         tags:["reaction"], requires:["Cover"] },
  { id:"sk:holdline",  name:"Hold the Line",           kind:"skill",   trigger:"front row",            cost:"—",         tags:["aura"],  requires:["Hold the Line"] },
  { id:"sk:couched",   name:"Couched Lance",           kind:"skill",   trigger:"on charge",            cost:"—",         tags:["striker"], requires:["Couched Lance"] },
  { id:"sk:rideby",    name:"Ride-By",                 kind:"skill",   trigger:"moved ≥3 this turn",   cost:"—",         tags:["striker"], requires:["Ride-By"] },
  { id:"sk:thrice",    name:"Thrice-Drawn",            kind:"skill",   trigger:"marked quarry",        cost:"1 Focus",   tags:["ranged"],  requires:["Thrice-Drawn"] },
  { id:"sk:mark",      name:"Mark Quarry",             kind:"skill",   trigger:"start of turn",        cost:"—",         tags:["setup"],   requires:["Mark Quarry"] },
  { id:"sk:leaf",      name:"Leaf-Step",               kind:"skill",   trigger:"woodland tile",        cost:"—",         tags:["move"],    requires:["Leaf-Step"] },
  { id:"sk:twincuts",  name:"Twin Cuts",               kind:"skill",   trigger:"paired weapons",       cost:"—",         tags:["melee"],   requires:["Twin Cuts"] },
  { id:"sk:sidestep",  name:"Sidestep",                kind:"skill",   trigger:"enemy in front",       cost:"—",         tags:["defensive"], requires:["Sidestep"] },
  { id:"sk:rededge",   name:"Red Edge",                kind:"skill",   trigger:"HP < 40%",             cost:"—",         tags:["berserk"], requires:["Red Edge"] },
  { id:"sk:noquarter", name:"No Quarter",              kind:"skill",   trigger:"killed foe this turn", cost:"—",         tags:["follow-up"], requires:["No Quarter"] },
  { id:"sk:mend",      name:"Mend",                    kind:"skill",   trigger:"ally HP < 70%",        cost:"1 Focus",   tags:["heal"],    requires:["Mend"] },
  { id:"sk:lumen",     name:"Lumen Ward",              kind:"skill",   trigger:"void enemy present",   cost:"1 Arcana",  tags:["ward"],    requires:["Lumen Ward"] },
  { id:"sk:chant",     name:"Chant of Rest",           kind:"skill",   trigger:"end of turn",          cost:"—",         tags:["regen"],   requires:["Chant of Rest"] },
  { id:"sk:name",      name:"Name the Void",           kind:"skill",   trigger:"silenced enemy",       cost:"2 Arcana",  tags:["caster"],  requires:["Name the Void"] },
  { id:"sk:silent",    name:"Silent Syllable",         kind:"skill",   trigger:"on spell cast",        cost:"1 Arcana",  tags:["ward"],    requires:["Silent Syllable"] },
  { id:"sk:echo",      name:"Echo",                    kind:"skill",   trigger:"spell cast last turn", cost:"—",         tags:["caster"],  requires:["Echo"] },
  { id:"sk:feint",     name:"Feint",                   kind:"skill",   trigger:"before first attack",  cost:"—",         tags:["trick"],   requires:["Feint"] },
  { id:"sk:lowtide",   name:"Low Tide",                kind:"skill",   trigger:"adjacent to water",    cost:"—",         tags:["move"],    requires:["Low Tide"] },
  { id:"sk:glyph_stone",name:"Glyph: Stone",           kind:"skill",   trigger:"start of turn",        cost:"1 Arcana",  tags:["glyph"],   requires:["Glyph: Stone"] },
  { id:"sk:hoarfrost", name:"Hoarfrost",               kind:"skill",   trigger:"any foe in range",     cost:"1 Arcana",  tags:["caster","slow"], requires:["Hoarfrost"] },
  { id:"sk:ember",     name:"Ember-Call",              kind:"skill",   trigger:"any foe in range",     cost:"1 Arcana",  tags:["caster","burn"], requires:["Ember-Call"] },
  { id:"sk:honorbound",name:"Honorbound",              kind:"skill",   trigger:"oath intact",          cost:"—",         tags:["passive"], requires:["Honorbound"] },
  { id:"sk:bannercry", name:"Banner-Cry",              kind:"skill",   trigger:"first turn",           cost:"—",         tags:["aura"],    requires:["Banner-Cry"] },
  { id:"sk:wardofdawn",name:"Ward of Dawn",            kind:"skill",   trigger:"dawn · start of turn", cost:"—",         tags:["aura"],    requires:["Ward of Dawn"] },
  { id:"sk:blessed",   name:"Blessed Blade",           kind:"skill",   trigger:"on strike",            cost:"—",         tags:["rider"],   requires:["Blessed Blade"] },
  { id:"sk:vigil",     name:"Vigil",                   kind:"skill",   trigger:"end of turn",          cost:"—",         tags:["regen"],   requires:["Vigil"] },
  { id:"sk:shieldslam",name:"Shield Slam",             kind:"skill",   trigger:"adjacent foe",         cost:"—",         tags:["stun"],    requires:["Shield Slam"] },
  { id:"sk:brace",     name:"Brace",                   kind:"skill",   trigger:"targeted by charge",   cost:"—",         tags:["def"],     requires:["Brace"] },
];

// ---- Default 4-slot battle doctrine per class (used when unit hasn't been tuned) ----
function defaultDoctrine(unit) {
  const has = (skill) => (unit.skills || []).includes(skill);
  // Priority: unit-specific skills → generic attacks/guard
  const out = ["atk:main", "atk:off", "def:guard", "def:guard"];
  const picks = [];
  (unit.skills || []).forEach(s => {
    const a = BATTLE_ACTIONS.find(x => x.requires && x.requires.includes(s));
    if (a) picks.push(a.id);
  });
  // Put attack first, then 2 skills if available, then hold
  const res = ["atk:main"];
  if (picks[0]) res.push(picks[0]);
  if (picks[1]) res.push(picks[1]); else res.push("atk:off");
  res.push("def:guard");
  return res.slice(0,4);
}

Object.assign(window, { INVENTORY, BATTLE_ACTIONS, defaultDoctrine });
