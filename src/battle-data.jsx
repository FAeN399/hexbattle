// SIGILBORNE — Battle data: foe catalog + resolution engine

// ============================================================================
// FOE CATALOG — pre-built enemy parties with 3×3 formations
// ============================================================================

const FOE_PARTIES = [
  {
    id: "bandit_pack",
    name: "Bandit Pack",
    motto: "A purse, a pot, a throat.",
    kind: "skirmish",
    tier: 1,
    banner: "rust",
    formation: "Crescent",
    leaderId: "f01",
    grid: {
      "0,1": "f01",
      "2,0": "f02", "2,2": "f03",
    },
    units: [
      { id: "f01", name: "Bren Hakk",      cls: "Cutter",   sigil: "Blade",  lvl: 3, hp: 26, hpmax: 26, atk: 9,  def: 5, mag: 0 },
      { id: "f02", name: "Roofjack",       cls: "Slinger",  sigil: "Flight", lvl: 2, hp: 20, hpmax: 20, atk: 7,  def: 3, mag: 0 },
      { id: "f03", name: "Mar Two-Fingers",cls: "Slinger",  sigil: "Flight", lvl: 2, hp: 20, hpmax: 20, atk: 7,  def: 3, mag: 0 },
    ],
    rumor: "Road-folk, cruel and clever. They will fold at the first heavy blow — or vanish.",
  },
  {
    id: "dire_wolves",
    name: "Dire Pack of the Hollow",
    motto: "—",
    kind: "beasts",
    tier: 2,
    banner: "bone",
    formation: "Wedge",
    leaderId: "w01",
    grid: {
      "0,1": "w01",
      "1,0": "w02", "1,2": "w03",
    },
    units: [
      { id: "w01", name: "Gaunt-Jaw",   cls: "Alpha",  sigil: "Bearing", lvl: 4, hp: 38, hpmax: 38, atk: 12, def: 6, mag: 0 },
      { id: "w02", name: "Grey Flank",  cls: "Wolf",   sigil: "Bearing", lvl: 3, hp: 28, hpmax: 28, atk: 10, def: 5, mag: 0 },
      { id: "w03", name: "Torn Ear",    cls: "Wolf",   sigil: "Bearing", lvl: 3, hp: 28, hpmax: 28, atk: 10, def: 5, mag: 0 },
    ],
    rumor: "Long in the tooth, longer in the memory. The alpha will not break.",
  },
  {
    id: "ruined_revenants",
    name: "The Ruined Chorus",
    motto: "Still we sing.",
    kind: "undead",
    tier: 3,
    banner: "ash",
    formation: "Shieldwall",
    leaderId: "r03",
    grid: {
      "0,0": "r01", "0,2": "r02",
      "2,1": "r03",
    },
    units: [
      { id: "r01", name: "Knight-Husk",    cls: "Revenant",  sigil: "Bearing", lvl: 5, hp: 42, hpmax: 42, atk: 11, def: 9, mag: 1 },
      { id: "r02", name: "Bone-Marshal",   cls: "Revenant",  sigil: "Bearing", lvl: 5, hp: 44, hpmax: 44, atk: 12, def: 10,mag: 1 },
      { id: "r03", name: "The Choirmaster",cls: "Wailer",    sigil: "Hollow",  lvl: 6, hp: 34, hpmax: 34, atk: 8,  def: 5, mag: 10 },
    ],
    rumor: "They remember what they were. That is the wound.",
  },
  {
    id: "border_patrol",
    name: "Marchwarden Patrol",
    motto: "The kingdom's coin, the kingdom's hand.",
    kind: "military",
    tier: 2,
    banner: "azure",
    formation: "Aegis",
    leaderId: "m01",
    grid: {
      "0,1": "m01",
      "1,0": "m02", "1,2": "m03",
      "2,1": "m04",
    },
    units: [
      { id: "m01", name: "Ser Halric",      cls: "Knight",  sigil: "Bearing", lvl: 5, hp: 40, hpmax: 40, atk: 11, def: 10, mag: 0 },
      { id: "m02", name: "Jael Morrow",     cls: "Footman", sigil: "Edge",    lvl: 3, hp: 28, hpmax: 28, atk: 8,  def: 7,  mag: 0 },
      { id: "m03", name: "Krell the Iron",  cls: "Footman", sigil: "Bearing", lvl: 3, hp: 30, hpmax: 30, atk: 9,  def: 8,  mag: 0 },
      { id: "m04", name: "Longshot Pern",   cls: "Archer",  sigil: "Flight",  lvl: 4, hp: 22, hpmax: 22, atk: 11, def: 4,  mag: 0 },
    ],
    rumor: "Drilled, paid, unhurried. They will punish mistakes, not improvise them.",
  },
  {
    id: "wyld_coven",
    name: "Coven of the Wyld Stone",
    motto: "The root remembers.",
    kind: "magical",
    tier: 4,
    banner: "verdigris",
    formation: "Crescent",
    leaderId: "c01",
    grid: {
      "0,0": "c02", "0,2": "c03",
      "1,1": "c01",
      "2,1": "c04",
    },
    units: [
      { id: "c01", name: "The Greenmother", cls: "Witch",    sigil: "Verdant", lvl: 6, hp: 32, hpmax: 32, atk: 5,  def: 4,  mag: 14 },
      { id: "c02", name: "Thorn-Walker",    cls: "Druid",    sigil: "Verdant", lvl: 5, hp: 36, hpmax: 36, atk: 9,  def: 7,  mag: 8 },
      { id: "c03", name: "Briar-Walker",    cls: "Druid",    sigil: "Verdant", lvl: 5, hp: 36, hpmax: 36, atk: 9,  def: 7,  mag: 8 },
      { id: "c04", name: "Moss-Kin Oll",    cls: "Warden",   sigil: "Bearing", lvl: 4, hp: 34, hpmax: 34, atk: 10, def: 8,  mag: 2 },
    ],
    rumor: "A dire test. Few walk out, and those that do bring seeds home in their hair.",
  },
];

// ============================================================================
// BATTLE RESOLVER — turn-based, per-soul
// ============================================================================

// Seedable pseudo-RNG (mulberry32)
function makeRng(seed) {
  let t = (seed >>> 0) || 1;
  return function() {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function rowOfCoord(coord) { return parseInt(coord.split(",")[0], 10); }
function colOfCoord(coord) { return parseInt(coord.split(",")[1], 10); }

// Build the combatant list for one side.
// side: "ally" | "foe"
// party: party object with grid + formation
// unitsIndex: { id -> unit }
function buildCombatants(side, party, unitsIndex) {
  const formation = window.FORMATIONS && window.FORMATIONS[party.formation];
  const combatants = [];
  Object.entries(party.grid).forEach(([coord, uid]) => {
    if (!uid) return;
    const u = unitsIndex[uid];
    if (!u) return;
    const slotMod = (formation && formation.slots && formation.slots[coord]) || {};
    const isLeader = party.leaderId === u.id;
    const doctrineMod = formation ? (isLeader ? (formation.leaderBonus || {}) : (formation.retinueBonus || {})) : {};
    const modAtk = (slotMod.atk || 0) + (doctrineMod.atk || 0);
    const modDef = (slotMod.def || 0) + (doctrineMod.def || 0);
    const modMag = (slotMod.mag || 0) + (doctrineMod.mag || 0);
    const modSpd = (slotMod.spd || 0) + (doctrineMod.spd || 0);
    combatants.push({
      id: u.id,
      side,
      name: u.name,
      cls: u.cls,
      sigil: u.sigil,
      lvl: u.lvl || 1,
      coord,
      row: rowOfCoord(coord),
      col: colOfCoord(coord),
      hp: u.hp || u.hpmax || 20,
      hpmax: u.hpmax || u.hp || 20,
      atk: (u.atk || 6) + modAtk,
      def: (u.def || 4) + modDef,
      mag: (u.mag || 0) + modMag,
      spd: (u.spd || u.stats?.spd || 10) + modSpd,
      baseAtk: u.atk || 6,
      baseDef: u.def || 4,
      baseMag: u.mag || 0,
      bonus: { atk: modAtk, def: modDef, mag: modMag, spd: modSpd, doctrine: doctrineMod.tag || null, slot: slotMod.lbl || null },
      isLeader,
      initiative: 0,
      alive: true,
    });
  });
  return combatants;
}

// Pick the highest-priority living target in the opposing side.
// Priority: front row > mid > back. Within a row, leader first, then lowest HP.
function pickTarget(attacker, combatants) {
  const foes = combatants.filter(c => c.alive && c.side !== attacker.side);
  if (!foes.length) return null;
  // If attacker is back-row or uses mag/ranged, skip the row preference — they can reach through.
  const ranged = attacker.mag > attacker.atk || attacker.row === 2 || attacker.cls === "Archer" || attacker.cls === "Slinger" || attacker.cls === "Mage";
  if (!ranged) {
    // Only attack front row if any front-row foe alive
    const byRow = [0,1,2];
    for (const r of byRow) {
      const pool = foes.filter(f => f.row === r);
      if (pool.length) return sortTargets(pool)[0];
    }
  }
  return sortTargets(foes)[0];
}

function sortTargets(pool) {
  return [...pool].sort((a, b) => {
    // Leader first
    if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
    // Then lowest HP (closest to death)
    return a.hp - b.hp;
  });
}

// Simulate a full battle. Returns { events: [...], winner, rounds, seed }.
// allyPartyOrList: a single party object OR an array of up to 3 party objects.
// foePartyOrList: a single foe party object OR an array of up to 3 foe party objects.
// Multi-party: all combatants fight on their side; each retains its partyId
// and its own formation bonuses. Row precedence for targeting uses each combatant's
// own row within its home party.
function simulateBattle(allyPartyOrList, foePartyOrList, unitsIndex, opts) {
  const seed = (opts && opts.seed) || Math.floor(Math.random() * 1e9);
  const rng = makeRng(seed);

  const allyParties = Array.isArray(allyPartyOrList) ? allyPartyOrList : [allyPartyOrList];
  const foeParties  = Array.isArray(foePartyOrList)  ? foePartyOrList  : [foePartyOrList];
  const ally = [];
  allyParties.forEach(ap => {
    const partyAlly = buildCombatants("ally", ap, unitsIndex);
    partyAlly.forEach(c => { c.partyId = ap.id; });
    ally.push(...partyAlly);
  });
  const foe = [];
  foeParties.forEach(fp => {
    const foeUnitsIndex = fp.units.reduce((m, u) => { m[u.id] = u; return m; }, {});
    const partyFoe = buildCombatants("foe", fp, foeUnitsIndex);
    partyFoe.forEach(c => { c.partyId = fp.id; });
    foe.push(...partyFoe);
  });
  const combatants = [...ally, ...foe];

  const events = [];
  const push = (e) => events.push(e);

  const allyBannerNames = allyParties.map(ap => ap.name).join(" & ");
  const foeBannerNames  = foeParties.map(fp => fp.name).join(" & ");
  const primaryAlly = allyParties[0];
  const primaryFoe  = foeParties[0];
  push({ kind: "open",
    ally: {
      name: allyBannerNames,
      motto: primaryAlly.motto,
      formation: allyParties.map(ap => ap.formation).join(" + "),
      size: ally.length,
      parties: allyParties.map(ap => ({ id: ap.id, name: ap.name, motto: ap.motto, formation: ap.formation })),
    },
    foe:  {
      name: foeBannerNames,
      motto: primaryFoe.motto,
      formation: foeParties.map(fp => fp.formation).join(" + "),
      size: foe.length,
      parties: foeParties.map(fp => ({ id: fp.id, name: fp.name, motto: fp.motto, formation: fp.formation })),
    },
    seed,
  });

  let round = 0;
  const MAX_ROUNDS = 12;
  while (round < MAX_ROUNDS) {
    round++;
    const allyAlive = combatants.filter(c => c.alive && c.side === "ally").length;
    const foeAlive  = combatants.filter(c => c.alive && c.side === "foe").length;
    if (!allyAlive || !foeAlive) break;

    push({ kind: "round", n: round });

    // Roll initiative: base = lvl + (front+2, mid+1, back+0) + atk/3
    combatants.forEach(c => {
      if (!c.alive) return;
      const rowBonus = c.row === 0 ? 2 : c.row === 1 ? 1 : 0;
      c.initiative = c.lvl + rowBonus + Math.floor(c.atk / 3) + Math.floor(rng() * 4);
    });
    const turnOrder = [...combatants]
      .filter(c => c.alive)
      .sort((a, b) => b.initiative - a.initiative);

    for (const attacker of turnOrder) {
      if (!attacker.alive) continue;
      const target = pickTarget(attacker, combatants);
      if (!target) break;

      // Determine attack type — physical or magical based on which is higher.
      const usesMag = attacker.mag > attacker.atk && attacker.mag >= 5;
      const offense = usesMag ? attacker.mag : attacker.atk;
      // Defense: physical uses def, magical ignores half of def
      const defense = usesMag ? Math.floor(target.def / 2) : target.def;

      // Base damage: offense - defense, +/- 0..3 random, floor 1
      const rawRoll = Math.floor(rng() * 5); // 0..4
      const damage = Math.max(1, offense - defense + rawRoll - 1);

      // Critical: 15% chance for +50% damage
      const crit = rng() < 0.15;
      const finalDmg = crit ? Math.floor(damage * 1.5) : damage;

      // Chance to miss if target def >= offense + 4: 20%
      const hardToHit = target.def >= offense + 4 && rng() < 0.35;

      if (hardToHit) {
        push({
          kind: "miss",
          attackerId: attacker.id, attackerName: attacker.name, attackerSide: attacker.side,
          targetId: target.id, targetName: target.name, targetSide: target.side,
          usesMag,
        });
        continue;
      }

      target.hp = Math.max(0, target.hp - finalDmg);
      const killed = target.hp === 0;
      if (killed) target.alive = false;

      push({
        kind: "hit",
        attackerId: attacker.id, attackerName: attacker.name, attackerSide: attacker.side, attackerCls: attacker.cls,
        targetId: target.id, targetName: target.name, targetSide: target.side, targetCls: target.cls,
        damage: finalDmg,
        crit,
        usesMag,
        killed,
        targetHp: target.hp, targetHpMax: target.hpmax,
      });

      if (killed) {
        push({
          kind: "fall",
          unitId: target.id, unitName: target.name, side: target.side,
        });
      }

      // Early exit if side wiped
      const aAlive = combatants.filter(c => c.alive && c.side === "ally").length;
      const fAlive = combatants.filter(c => c.alive && c.side === "foe").length;
      if (!aAlive || !fAlive) break;
    }
  }

  const allyAliveFinal = combatants.filter(c => c.alive && c.side === "ally").length;
  const foeAliveFinal  = combatants.filter(c => c.alive && c.side === "foe").length;
  const winner = allyAliveFinal === 0 && foeAliveFinal === 0 ? "draw"
               : foeAliveFinal === 0 ? "ally"
               : allyAliveFinal === 0 ? "foe"
               : allyAliveFinal > foeAliveFinal ? "ally" : "foe";

  push({
    kind: "end",
    winner,
    rounds: round,
    allyAlive: allyAliveFinal,
    foeAlive: foeAliveFinal,
    allySurvivors: combatants.filter(c => c.alive && c.side === "ally").map(c => ({ id: c.id, name: c.name, hp: c.hp, hpmax: c.hpmax })),
    foeSurvivors:  combatants.filter(c => c.alive && c.side === "foe").map(c => ({ id: c.id, name: c.name, hp: c.hp, hpmax: c.hpmax })),
    allyFallen: combatants.filter(c => !c.alive && c.side === "ally").map(c => ({ id: c.id, name: c.name })),
    foeFallen:  combatants.filter(c => !c.alive && c.side === "foe").map(c => ({ id: c.id, name: c.name })),
  });

  // Final state snapshot — for grid rendering
  const finalState = combatants.reduce((m, c) => {
    m[c.id] = { hp: c.hp, hpmax: c.hpmax, alive: c.alive };
    return m;
  }, {});

  return { events, winner, rounds: round, seed, finalState };
}

Object.assign(window, { FOE_PARTIES, simulateBattle, makeRng, buildCombatants });
