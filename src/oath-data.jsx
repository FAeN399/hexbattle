// SIGILBORNE — The Warden's Oath — question data

// Sigils are weighted by answers. Each answer carries sigilWeights: {Sigil: n}
// where n is added to that sigil's running total.

const OATH_QUESTIONS = [
  // ------------------------------ NAME ---------------------------------
  {
    id: "name",
    kind: "name",
    scrollKey: "Name",
    prompt: {
      interview: "Tell me your name. The scroll wants it first — and so do I.",
      rite:      "Speak your name, that it may be written.",
      audit:     "REGISTRATION. Name to be entered on the Warden's roll.",
    },
    flavor: {
      interview: "The clerk will grouse if I leave it blank. Say it plain.",
      rite:      "The hall receives you.",
      audit:     "Given and surname. No honorifics at this time.",
    },
  },

  // ------------------------------ ORIGIN -------------------------------
  {
    id: "origin",
    kind: "choice",
    scrollKey: "Origin",
    prompt: {
      interview: "Before the hall claimed you — where was home?",
      rite:      "From what country came you to this threshold?",
      audit:     "PLACE OF ORIGIN. Select one.",
    },
    flavor: {
      interview: "It tells me what the wind sounds like, to you.",
      rite:      "Earth shapes the stride.",
      audit:     "This figure determines regional retainer eligibility.",
    },
    options: [
      { id:"highmarch",   headline:"Highmarch",        gloss:"Stone halls, hard winters, a grandfather's helm.", sigilWeights:{Bearing:3,Stone:2,Shield:1}, gift:"+1 Resolve" },
      { id:"coastbreak",  headline:"Coastbreak",       gloss:"Salt, tar, ships that leave and do not all return.", sigilWeights:{Edge:2,Tide:3,Ember:1}, gift:"+1 Speed" },
      { id:"wildwood",    headline:"The Wildwood",     gloss:"Green dark. Things older than treaty.", sigilWeights:{Verdant:3,Stone:1,Void:1}, gift:"+1 Skill" },
      { id:"lanternfall", headline:"Lanternfall",      gloss:"A town that burns candles against the dusk.", sigilWeights:{Lumen:3,Shield:1,Bearing:1}, gift:"+1 Wyrd" },
      { id:"innerwastes", headline:"The Inner Wastes", gloss:"Dry country, strange sky. A name you don't say aloud.", sigilWeights:{Void:3,Ember:1,Frost:1}, gift:"+1 Arcana" },
      { id:"borderlands", headline:"The Borderlands",  gloss:"Watchfires, no neighbours, daughters buried young.", sigilWeights:{Shield:3,Bearing:2,Edge:1}, gift:"+1 Vigor" },
    ],
  },

  // ---------------------------- CALIBRATION 1 --------------------------
  {
    id: "first_hurt",
    kind: "choice",
    scrollKey: "First Hurt",
    prompt: {
      interview: "When the world first hurt you — what did you do the morning after?",
      rite:      "The first wound is remembered. How did you rise from it?",
      audit:     "TRAUMA RESPONSE PATTERN. Select the nearest fit.",
    },
    flavor: {
      interview: "Don't tell me what happened. Tell me what happened next.",
      rite:      "Character is the shape left behind.",
      audit:     "For purposes of unit assignment only.",
    },
    options: [
      { id:"held",   headline:"I held my ground and learned the weight of it.",       sigilWeights:{Bearing:3,Stone:2,Shield:1} },
      { id:"edge",   headline:"I sharpened something and swore it would not happen twice.", sigilWeights:{Edge:3,Ember:2} },
      { id:"quiet",  headline:"I went quiet, and learned to listen.",                 sigilWeights:{Tide:2,Void:2,Frost:2} },
      { id:"light",  headline:"I lit a candle for the ones who could not.",           sigilWeights:{Lumen:3,Shield:1,Verdant:1} },
      { id:"forgot", headline:"I forgot on purpose. It mostly worked.",               sigilWeights:{Void:3,Frost:2} },
      { id:"grew",   headline:"I put my hands in the dirt and grew something.",       sigilWeights:{Verdant:3,Stone:1} },
    ],
  },

  // ---------------------------- CALIBRATION 2 --------------------------
  {
    id: "at_the_crossroads",
    kind: "choice",
    scrollKey: "At the Crossroads",
    prompt: {
      interview: "A stranger at a crossroads asks you for passage through your land. Armed. Quiet. Not announcing their business.",
      rite:      "At the crossroads: a stranger, armed and silent. What do you do?",
      audit:     "SCENARIO 14-B. Unannounced armed traveller on marked land. Preferred response:",
    },
    flavor: {
      interview: "No right answer. I just want to know which kind of wrong you prefer.",
      rite:      "The road teaches.",
      audit:     "Standardised response evaluation.",
    },
    options: [
      { id:"bar",      headline:"Bar the way. They can announce themselves or ride around.",     sigilWeights:{Shield:3,Bearing:2} },
      { id:"challenge",headline:"Step into the road and ask them plain.",                         sigilWeights:{Bearing:2,Edge:1,Lumen:1} },
      { id:"follow",   headline:"Let them pass. Follow at distance.",                             sigilWeights:{Tide:2,Verdant:2,Void:1} },
      { id:"offer",    headline:"Offer bread and directions. See what they do with it.",          sigilWeights:{Lumen:3,Verdant:1} },
      { id:"strike",   headline:"Put them down before they put me down.",                         sigilWeights:{Edge:3,Ember:1} },
      { id:"vanish",   headline:"Be somewhere else by the time they look up.",                    sigilWeights:{Void:2,Frost:2,Tide:1} },
    ],
  },

  // ---------------------------- CALIBRATION 3 --------------------------
  {
    id: "what_you_carry",
    kind: "choice",
    scrollKey: "What You Carry",
    prompt: {
      interview: "What's the one thing you never leave without? Not the sword. The other thing.",
      rite:      "Name the token you bear against the dark.",
      audit:     "PERSONAL EFFECT — declared. This item is exempt from seizure.",
    },
    flavor: {
      interview: "Everyone has one. Don't lie.",
      rite:      "The hand carries what the soul cannot put down.",
      audit:     "For inventory and quartermaster records.",
    },
    options: [
      { id:"coin",  headline:"A coin from a debt never paid.",       sigilWeights:{Bearing:3,Stone:1} },
      { id:"ring",  headline:"A ring from someone who did not come back.", sigilWeights:{Void:2,Lumen:1,Bearing:1} },
      { id:"seed",  headline:"A seed in a waxed cloth. I mean to plant it.", sigilWeights:{Verdant:3,Lumen:1} },
      { id:"flint", headline:"A flint and striker. You never know.",  sigilWeights:{Ember:3,Frost:1} },
      { id:"stone", headline:"A stone from the first place I dug a grave.", sigilWeights:{Stone:3,Bearing:1} },
      { id:"shell", headline:"A shell — one of a pair. My sister has the other.", sigilWeights:{Tide:3,Verdant:1} },
      { id:"blade", headline:"A knife small enough to hide. Big enough to matter.", sigilWeights:{Edge:3,Tide:1} },
    ],
  },

  // ---------------------------- CALIBRATION 4 --------------------------
  {
    id: "bearing",
    kind: "choice",
    scrollKey: "Bearing",
    prompt: {
      interview: "When a room is afraid and looking at you — what do they see?",
      rite:      "Name the face you show the frightened.",
      audit:     "COMMAND PRESENCE SELF-ASSESSMENT. Choose one.",
    },
    flavor: {
      interview: "Be honest. I've seen myself in glass; it isn't always what I hoped.",
      rite:      "The first gift of a Warden is a still face.",
      audit:     "Subordinate morale factor, bracket B.",
    },
    options: [
      { id:"steadfast",headline:"Steadfast — a wall that doesn't argue with weather.",  sigilWeights:{Shield:2,Bearing:2,Stone:2}, nature:"Steadfast" },
      { id:"luminous", headline:"Luminous — someone who still believes we get to choose.", sigilWeights:{Lumen:3,Bearing:1,Verdant:1}, nature:"Luminous" },
      { id:"volatile", headline:"Volatile — a match they hope I strike at the right time.", sigilWeights:{Ember:3,Edge:1}, nature:"Volatile" },
      { id:"cunning",  headline:"Cunning — someone already three moves ahead.",             sigilWeights:{Tide:2,Edge:1,Void:1}, nature:"Cunning" },
      { id:"devout",   headline:"Devout — not me, exactly. Something larger, behind me.",   sigilWeights:{Lumen:2,Shield:2,Bearing:1}, nature:"Devout" },
      { id:"haunted",  headline:"Haunted — they see what's following me, and it helps.",     sigilWeights:{Void:3,Frost:1}, nature:"Haunted" },
    ],
  },

  // ------------------------------ OATH ---------------------------------
  {
    id: "oath",
    kind: "choice",
    scrollKey: "Oath",
    prompt: {
      interview: "Now the heavy one. What will you not do? Pick it carefully — the hall will hold you to it.",
      rite:      "Declare your proscription. By this line the Warden is known.",
      audit:     "OATH OF ABSTENTION. Binding. May be amended only by formal ceremony.",
    },
    flavor: {
      interview: "A Warden's oath is a thing you refuse. Every refusal is a door you close for good.",
      rite:      "That which you will not do, you will be remembered for.",
      audit:     "Violations subject to rank reduction or excommunication.",
    },
    options: [
      { id:"unarmed",   headline:"I will not strike the unarmed.",              gloss:"The knife at your back will be a dull one — but the hall will sleep better.", sigilWeights:{Shield:3,Lumen:1}, cost:"−1 vs civilian", gift:"+Honor" },
      { id:"retreat",   headline:"I will not retreat while an ally stands.",    gloss:"They will die beside you, or not at all.",                                     sigilWeights:{Bearing:3,Shield:1}, cost:"cannot flee", gift:"+Resolve aura" },
      { id:"kneel",     headline:"I will not kneel.",                           gloss:"Not to crown, not to consistory, not to the long dark.",                       sigilWeights:{Edge:2,Ember:1,Void:1}, cost:"−Crown rep", gift:"+free company rep" },
      { id:"sworn",     headline:"I will not break faith with sworn word.",     gloss:"Even the small ones. Even when they stop making sense.",                       sigilWeights:{Bearing:2,Lumen:1,Shield:1}, cost:"cannot lie in writ", gift:"+diplomacy" },
      { id:"fire",      headline:"I will not douse a living flame.",            gloss:"An odd one, this. The hall accepts odd.",                                      sigilWeights:{Ember:3,Verdant:1}, cost:"−vs fire", gift:"+Ember skills" },
      { id:"voidtouched",headline:"I will not harm the void-touched.",          gloss:"They did not choose it. Someone must remember that.",                          sigilWeights:{Lumen:2,Void:2,Verdant:1}, cost:"−vs Void enemies", gift:"+Void diplomacy" },
      { id:"second",    headline:"I will not swear a second oath.",             gloss:"This is the only line. That is the point.",                                    sigilWeights:{Void:2,Edge:1,Frost:1}, cost:"cannot take new oaths", gift:"+Bearing" },
    ],
  },

  // ------------------------------ WOUND --------------------------------
  {
    id: "wound",
    kind: "choice",
    scrollKey: "Wound",
    prompt: {
      interview: "And what marked you? I'm not asking what happened. I'm asking what's left.",
      rite:      "Bear witness to the wound you carry.",
      audit:     "MEDICAL / PSYCHOLOGICAL NOTE. For the surgeon's record only.",
    },
    flavor: {
      interview: "Don't dress it up. I've seen all the kinds.",
      rite:      "The wound is also the door.",
      audit:     "May affect combat effectiveness in named conditions.",
    },
    options: [
      { id:"brother",  headline:"A brother lost at Caer Voth.",            gloss:"I still set a second plate sometimes.",                sigilWeights:{Bearing:2,Shield:1,Void:1}, cost:"-1 vs Void", gift:"+vigor in Borderlands" },
      { id:"gait",     headline:"My gait favors the left leg.",            gloss:"An old horse, a bad road.",                            sigilWeights:{Stone:2,Bearing:1}, cost:"−1 Speed", gift:"+1 Resolve" },
      { id:"dusk",     headline:"My vision blurs at dusk.",                gloss:"The hour I am likeliest to be tested.",                sigilWeights:{Lumen:3,Frost:1}, cost:"−Skill at night", gift:"+Skill at dawn" },
      { id:"stammer",  headline:"A stammer that vanishes in battle.",      gloss:"Which tells you what I am, really.",                   sigilWeights:{Tide:2,Edge:1}, cost:"−Diplomacy", gift:"+combat Wyrd" },
      { id:"name",     headline:"A name I no longer remember.",            gloss:"Mine, I think. I'm not sure anymore.",                 sigilWeights:{Void:3,Frost:1}, cost:"−social rep", gift:"+Void resistance" },
      { id:"fever",    headline:"Fevers when I read too long.",            gloss:"The letters go sideways and I see things in the margin.", sigilWeights:{Void:2,Ember:1}, cost:"−Arcana recovery", gift:"+Arcana cap" },
      { id:"nightmare",headline:"Dreams I do not share.",                  gloss:"The kind you recognise in someone else's eyes.",       sigilWeights:{Void:2,Tide:1,Frost:1}, cost:"−morale aura", gift:"+insight" },
    ],
  },
];

// runs the weights and returns sorted [{sigil, weight}] desc
function computeSigilRanking(answers) {
  const totals = {};
  Object.keys(SIGILS).forEach(k => totals[k] = 0);
  OATH_QUESTIONS.forEach(q => {
    if (q.kind !== "choice") return;
    const picked = answers[q.id];
    if (!picked) return;
    const opt = q.options.find(o => o.id === picked);
    if (!opt || !opt.sigilWeights) return;
    Object.entries(opt.sigilWeights).forEach(([s, w]) => {
      totals[s] = (totals[s] || 0) + w;
    });
  });
  const sorted = Object.entries(totals)
    .map(([sigil, weight]) => ({ sigil, weight }))
    .sort((a,b) => b.weight - a.weight);
  return { sorted, totals };
}

function inferredNature(answers) {
  const picked = answers.bearing;
  if (!picked) return null;
  const q = OATH_QUESTIONS.find(x => x.id === "bearing");
  const opt = q.options.find(o => o.id === picked);
  return opt ? opt.nature : null;
}

Object.assign(window, { OATH_QUESTIONS, computeSigilRanking, inferredNature });
