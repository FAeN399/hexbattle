// SIGILBORNE — Oath to Unit transform
// Converts the Warden's Oath answers into a Party Command roster unit.

const RECRUITS_KEY = "sigilborne.oath-recruits.v1";

const SIGIL_TO_CLASS = {
  Shield:  "Squire",
  Edge:    "Squire",
  Bearing: "Squire",
  Stone:   "Squire",
  Verdant: "Ranger",
  Tide:    "Scout",
  Lumen:   "Acolyte",
  Ember:   "Scholar",
  Void:    "Scholar",
  Frost:   "Initiate",
};

const ORIGIN_TO_AFFINITY = {
  highmarch:   { label: "Highmarch",        affinity: "Stone"   },
  coastbreak:  { label: "Coastbreak",       affinity: "Tide"    },
  wildwood:    { label: "The Wildwood",     affinity: "Verdant" },
  lanternfall: { label: "Lanternfall",      affinity: "Lumen"   },
  innerwastes: { label: "The Inner Wastes", affinity: "Void"    },
  borderlands: { label: "The Borderlands",  affinity: "Stone"   },
};

const SIGIL_ALIGN = {
  Shield: "Lawful",  Bearing: "Lawful",  Lumen: "Lawful",
  Verdant: "Neutral", Tide: "Neutral",    Stone: "Neutral",
  Edge: "Chaos",     Ember: "Chaos",     Void: "Chaos",   Frost: "Chaos",
};

const CLASS_TEMPLATES = {
  Squire: {
    hp: 22, hpmax: 24, move: 4,
    stats: { vig:12, foc:9,  str:11, arc:6,  skl:10, spd:9,  wrd:10, res:10, frt:9  },
    skills: ["Brace"],
    attacks: [{ name:"Spear",      type:"melee", rng:"1–2", dmg:"7–9", rate:1 }],
    gear: { main:"Spear",          off:"Wooden Shield", armor:"Gambeson",            locket:"—" },
  },
  Ranger: {
    hp: 20, hpmax: 22, move: 5,
    stats: { vig:10, foc:12, str:9,  arc:6,  skl:14, spd:13, wrd:8,  res:9,  frt:12 },
    skills: ["Mark Quarry"],
    attacks: [{ name:"Shortbow",   type:"ranged", rng:"1–3", dmg:"8–10", rate:2 }],
    gear: { main:"Shortbow",       off:"Woodsman's Knife", armor:"Leather Jerkin",   locket:"—" },
  },
  Scout: {
    hp: 18, hpmax: 20, move: 6,
    stats: { vig:10, foc:10, str:9,  arc:6,  skl:13, spd:14, wrd:8,  res:9,  frt:12 },
    skills: ["Feint"],
    attacks: [{ name:"Shortsword", type:"melee", rng:"adj", dmg:"7–9", rate:1 }],
    gear: { main:"Shortsword",     off:"Sling",             armor:"Padded Jacket",    locket:"—" },
  },
  Acolyte: {
    hp: 18, hpmax: 20, move: 3,
    stats: { vig:9,  foc:13, str:8,  arc:12, skl:9,  spd:9,  wrd:14, res:12, frt:10 },
    skills: ["Mend"],
    attacks: [{ name:"Walking Staff", type:"melee", rng:"adj", dmg:"4–6", rate:1 }],
    gear: { main:"Walking Staff",  off:"Holy Symbol",       armor:"Cotton Vestments", locket:"—" },
  },
  Scholar: {
    hp: 16, hpmax: 18, move: 3,
    stats: { vig:8,  foc:14, str:7,  arc:15, skl:10, spd:9,  wrd:10, res:9,  frt:8  },
    skills: ["Glyph: Stone"],
    attacks: [{ name:"Stone Mote",    type:"spell", rng:"1–3", dmg:"8–11", rate:1 }],
    gear: { main:"Quarterstaff",   off:"Inkhorn",            armor:"Scholar's Robes",  locket:"—" },
  },
  Initiate: {
    hp: 16, hpmax: 18, move: 3,
    stats: { vig:8,  foc:14, str:7,  arc:14, skl:10, spd:9,  wrd:11, res:9,  frt:8  },
    skills: ["Hoarfrost"],
    attacks: [{ name:"Frost Lance",   type:"spell", rng:"1–3", dmg:"9–12", rate:1, rider:"Slow" }],
    gear: { main:"Frostwood Staff",off:"—",                  armor:"Fur-lined Robes",  locket:"—" },
  },
};

function headlineForAnswer(questionId, optionId) {
  const q = (window.OATH_QUESTIONS || []).find(x => x.id === questionId);
  if (!q || !q.options) return optionId || "";
  const opt = q.options.find(o => o.id === optionId);
  return opt ? opt.headline : (optionId || "");
}

function oathToUnit(oathState) {
  const { name, answers = {}, chosenSigil } = oathState || {};
  const sigil = chosenSigil || "Bearing";
  const cls = SIGIL_TO_CLASS[sigil] || "Squire";
  const tpl = CLASS_TEMPLATES[cls] || CLASS_TEMPLATES.Squire;
  const originRec = ORIGIN_TO_AFFINITY[answers.origin] || { label: "—", affinity: "Stone" };
  const nature = (typeof window.inferredNature === "function")
    ? (window.inferredNature(answers) || "—")
    : "—";

  return {
    id: "w_" + Date.now().toString(36),
    name: (name || "Warden").trim(),
    cls,
    calling: cls,
    lvl: 1,
    hp: tpl.hp,
    hpmax: tpl.hpmax,
    sigil,
    affinity: originRec.affinity,
    origin: originRec.label,
    nature,
    oath: headlineForAnswer("oath", answers.oath) || "None",
    wound: headlineForAnswer("wound", answers.wound) || "—",
    align: SIGIL_ALIGN[sigil] || "Neutral",
    stats: { ...tpl.stats },
    move: tpl.move,
    skills: [...tpl.skills],
    attacks: JSON.parse(JSON.stringify(tpl.attacks)),
    gear: { ...tpl.gear },
    portrait: "heraldry",
    mastery: null,
  };
}

function saveOathRecruit(unit) {
  try {
    const raw = localStorage.getItem(RECRUITS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(unit);
    localStorage.setItem(RECRUITS_KEY, JSON.stringify(arr));
  } catch {}
}

function loadOathRecruits() {
  try {
    const raw = localStorage.getItem(RECRUITS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

Object.assign(window, {
  RECRUITS_KEY,
  SIGIL_TO_CLASS,
  oathToUnit,
  saveOathRecruit,
  loadOathRecruits,
});
