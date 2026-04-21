// SIGILBORNE — Stores (Equipment + Merchant + Postings drawer)

// ----- Merchant inventory: subset of INVENTORY items with crown prices + stock -----
const MERCHANT_OFFERS = [
  { slot:"main",   itemId:"m_spear",     price: 80,  stock: 3 },
  { slot:"main",   itemId:"m_guisarme",  price: 70,  stock: 2 },
  { slot:"main",   itemId:"m_lance",     price: 120, stock: 2 },
  { slot:"main",   itemId:"m_glance",    price: 220, stock: 1 },
  { slot:"main",   itemId:"m_hewaxe",    price: 95,  stock: 2 },
  { slot:"main",   itemId:"m_longbow",   price: 110, stock: 2 },
  { slot:"main",   itemId:"m_shortbow",  price: 60,  stock: 3 },
  { slot:"main",   itemId:"m_stave",     price: 45,  stock: 3 },
  { slot:"main",   itemId:"m_blackwood", price: 140, stock: 1 },
  { slot:"off",    itemId:"o_kite",      price: 70,  stock: 3 },
  { slot:"off",    itemId:"o_tower",     price: 140, stock: 1 },
  { slot:"off",    itemId:"o_heater",    price: 55,  stock: 3 },
  { slot:"off",    itemId:"o_buckler",   price: 35,  stock: 4 },
  { slot:"armor",  itemId:"a_plate",     price: 260, stock: 1 },
  { slot:"armor",  itemId:"a_mail",      price: 160, stock: 2 },
  { slot:"armor",  itemId:"a_scale",     price: 110, stock: 2 },
  { slot:"armor",  itemId:"a_studded",   price: 70,  stock: 3 },
  { slot:"armor",  itemId:"a_leather",   price: 50,  stock: 3 },
  { slot:"armor",  itemId:"a_robes",     price: 40,  stock: 3 },
  { slot:"locket", itemId:"l_bearing",   price: 180, stock: 1 },
  { slot:"locket", itemId:"l_shield",    price: 180, stock: 1 },
  { slot:"locket", itemId:"l_edge",      price: 180, stock: 1 },
  { slot:"locket", itemId:"l_lumen",     price: 200, stock: 1 },
  { slot:"locket", itemId:"l_stone",     price: 160, stock: 2 },
];

function lookupItem(slot, itemId) {
  const pool = (window.INVENTORY || {})[slot] || [];
  return pool.find(i => i.id === itemId) || null;
}

// Who wields this item currently?
function equippedBy(units, slot, itemName) {
  return units.filter(u => u.gear && u.gear[slot] === itemName);
}

// Items available in the Warden's stores (by slot) — flat list of {item, count, equippedBy[]}
function buildStoresInventory(units, stock) {
  const result = { main:[], off:[], armor:[], locket:[] };
  Object.keys(result).forEach(slot => {
    const pool = (window.INVENTORY || {})[slot] || [];
    pool.forEach(item => {
      const owned = (stock[slot] && stock[slot][item.id]) || 0;
      const wielders = equippedBy(units, slot, item.name);
      // Show item if owned OR at least one unit has it equipped (household-issue)
      if (owned === 0 && wielders.length === 0) return;
      result[slot].push({ item, owned, wielders });
    });
  });
  return result;
}

// Default starting household stock — what you already own
function defaultStock() {
  return {
    main:   { m_spear: 1, m_shortbow: 1, m_stave: 1 },
    off:    { o_heater: 1, o_buckler: 1 },
    armor:  { a_mail: 1, a_leather: 1 },
    locket: { l_bearing: 1 },
  };
}

const SLOT_LABELS = { main: "Main-hand", off: "Off-hand", armor: "Armor", locket: "Locket" };
const SLOT_GLYPHS = { main: "⚔", off: "◈", armor: "▥", locket: "◉" };

// -------- Item card (rack) --------
function ItemCard({ entry, slot, units, onOpenEquip, isSelected, onSelect }) {
  const { item, owned, wielders } = entry;
  const free = Math.max(0, owned - wielders.length);
  const totalAvailable = owned + wielders.length; // household-issue shown alongside stock
  return (
    <div
      className={`stores-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(item.id)}
    >
      <div className="stores-item-head">
        <div style={{minWidth:0, flex:1}}>
          <div className="stores-item-name">{item.name}</div>
          <div className="stores-item-kind">
            {item.kind ? `${item.kind}` : ""}
            {item.weight ? ` · ${item.weight}` : ""}
          </div>
        </div>
        <div className="stores-item-count" title={`${owned} in stores · ${wielders.length} in hand`}>
          <span className="count-own">{owned}</span>
          <span className="count-slash">/</span>
          <span className="count-wield">{wielders.length}</span>
        </div>
      </div>
      <div className="stores-item-stats">
        {item.dmg && <span className="mtag">dmg {item.dmg}</span>}
        {item.def && <span className="mtag">{item.def}</span>}
        {item.sigil && item.sigil !== "—" && <span className="mtag sigil">◇ {item.sigil}</span>}
      </div>
      {item.note && <div className="stores-item-note">{item.note}</div>}
      <div className="stores-item-foot">
        <div className="stores-item-wielders">
          {wielders.length > 0 ? (
            <>
              <span className="label" style={{fontSize:8.5}}>In hand</span>
              <span style={{fontStyle:"italic", color:"var(--ink-soft)"}}>
                {wielders.slice(0,2).map(u => u.name.split(" ")[0]).join(", ")}
                {wielders.length > 2 && ` +${wielders.length - 2}`}
              </span>
            </>
          ) : (
            <span className="italic-note" style={{fontSize:10.5}}>unassigned</span>
          )}
        </div>
        <button
          className="btn ghost sm"
          onClick={(e) => { e.stopPropagation(); onOpenEquip(slot, item); }}
          title="Assign to a soul"
        >
          Equip →
        </button>
      </div>
    </div>
  );
}

// -------- Merchant stall card (buyable) --------
function MerchantCard({ offer, canAfford, onBuy, bulkQty, setBulkQty, isSelected, onSelect }) {
  const item = lookupItem(offer.slot, offer.itemId);
  if (!item) return null;
  const totalCost = offer.price * bulkQty;
  const canBuy = canAfford && bulkQty <= offer.stock && bulkQty > 0;
  return (
    <div
      className={`merchant-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(offer.itemId + ":" + offer.slot)}
    >
      <div className="merchant-item-head">
        <div style={{minWidth:0, flex:1}}>
          <div className="stores-item-name">{item.name}</div>
          <div className="stores-item-kind">
            {SLOT_GLYPHS[offer.slot]} {SLOT_LABELS[offer.slot]}
            {item.kind ? ` · ${item.kind}` : ""}
          </div>
        </div>
        <div className="merchant-price" title={`${offer.price} crowns`}>
          <Crown size={11}/> <span>{offer.price}</span>
        </div>
      </div>
      <div className="stores-item-stats">
        {item.dmg && <span className="mtag">dmg {item.dmg}</span>}
        {item.def && <span className="mtag">{item.def}</span>}
        {item.sigil && item.sigil !== "—" && <span className="mtag sigil">◇ {item.sigil}</span>}
      </div>
      {item.note && <div className="stores-item-note">{item.note}</div>}
      <div className="merchant-foot" onClick={(e) => e.stopPropagation()}>
        <div className="stock-readout">
          <span className="label" style={{fontSize:9}}>Stock</span>
          <span style={{fontFamily:"var(--mono)"}}>{offer.stock}</span>
        </div>
        <div className="bulk-stepper">
          <button
            className="btn ghost sm"
            onClick={() => setBulkQty(Math.max(1, bulkQty - 1))}
            disabled={bulkQty <= 1}
          >−</button>
          <span className="bulk-qty">{bulkQty}</span>
          <button
            className="btn ghost sm"
            onClick={() => setBulkQty(Math.min(offer.stock, bulkQty + 1))}
            disabled={bulkQty >= offer.stock}
          >+</button>
        </div>
        <button
          className="btn sm"
          onClick={() => onBuy(offer, bulkQty)}
          disabled={!canBuy}
          title={canAfford ? "Buy" : "Not enough crowns"}
        >
          Buy · <Crown size={10}/> {totalCost}
        </button>
      </div>
    </div>
  );
}

// -------- Equip popover --------
function EquipPopover({ slot, item, units, onEquip, onClose }) {
  if (!item) return null;
  // Units this item is allowed to wield
  const eligible = units.filter(u => {
    if (!item.allows) return true;
    if (item.allows.includes("*")) return true;
    return item.allows.includes(u.cls);
  });
  return (
    <div className="equip-overlay" onClick={onClose}>
      <div className="equip-popover" onClick={(e) => e.stopPropagation()}>
        <div className="equip-head">
          <div>
            <div className="label" style={{fontSize:9.5}}>Equip to {SLOT_LABELS[slot]}</div>
            <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:16}}>{item.name}</div>
            <div className="italic-note" style={{fontSize:11}}>
              {item.allows && !item.allows.includes("*")
                ? `Fits: ${item.allows.join(", ")}`
                : "Fits all hands"}
            </div>
          </div>
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>
        <div className="equip-body">
          {eligible.length === 0 && (
            <div className="italic-note" style={{padding:"10px 0", fontSize:12}}>
              No soul in the household can wield this.
            </div>
          )}
          {eligible.map(u => {
            const current = u.gear[slot];
            const already = current === item.name;
            return (
              <button
                key={u.id}
                className={`equip-row ${already ? "already" : ""}`}
                disabled={already}
                onClick={() => { onEquip(u.id, slot, item.name); onClose(); }}
              >
                <Heraldry seed={u.id} sigil={u.sigil} size={24}/>
                <div style={{flex:1, minWidth:0, textAlign:"left"}}>
                  <div style={{fontFamily:"var(--serif)", fontWeight:600, fontSize:13}}>{u.name}</div>
                  <div className="italic-note" style={{fontSize:10.5}}>
                    {u.cls} · lvl {u.lvl} · now wielding: <em>{current || "—"}</em>
                  </div>
                </div>
                {already
                  ? <span className="mtag sigil">equipped</span>
                  : <span style={{fontSize:11, color:"var(--gold-deep)"}}>equip →</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------- Postings Drawer (full-height rail on right side of main) --------
function PostingsDrawer({ open, onToggle, postings, assignments, sealed, onOpenFull }) {
  const pendingCount = postings.filter(p => !sealed.has(p.id)).length;
  const sealedCount = sealed.size;
  return (
    <div className={`postings-drawer ${open ? "open" : ""}`}>
      <button className="drawer-tab" onClick={onToggle} title="Postings">
        <span style={{fontSize:14, fontWeight:700, letterSpacing:"0.18em"}}>§</span>
        <span className="drawer-tab-label">POSTINGS</span>
        <span className="drawer-tab-count">{pendingCount}</span>
      </button>
      {open && (
        <div className="drawer-panel">
          <div className="drawer-head">
            <div>
              <div style={{fontFamily:"var(--serif)", fontStyle:"italic", fontSize:13, color:"var(--ink-soft)"}}>At the gate.</div>
              <div className="display" style={{fontSize:18, color:"var(--ink)"}}>The Board</div>
            </div>
            <button className="btn ghost sm" onClick={onToggle}>✕</button>
          </div>
          <div className="drawer-stats">
            <span><strong>{pendingCount}</strong> pending</span>
            <span>·</span>
            <span><strong>{sealedCount}</strong> sealed</span>
          </div>
          <div className="drawer-list">
            {postings.map(p => {
              const committed = (assignments[p.id] || []).length;
              const isSealed = sealed.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`drawer-posting ${isSealed ? "sealed" : ""}`}
                  onClick={() => onOpenFull(p.id)}
                >
                  <div className="drawer-posting-wax">◉</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="drawer-posting-title">{p.title}</div>
                    <div className="drawer-posting-sub">
                      {p.region} · <span style={{color:"var(--ink)"}}>{p.risk}</span>
                    </div>
                    <div className="drawer-posting-foot">
                      <span style={{fontFamily:"var(--mono)", fontSize:10.5}}>
                        {committed}/{p.maxParties} banners
                      </span>
                      <span style={{fontFamily:"var(--mono)", fontSize:10.5, color:"var(--gold-deep)"}}>
                        <Crown size={10}/> {p.reward}
                      </span>
                    </div>
                  </div>
                  {isSealed && <div className="drawer-sealed-stamp">SEALED</div>}
                </div>
              );
            })}
          </div>
          <div style={{padding:"8px 10px", borderTop:"1px dotted var(--rule)"}}>
            <button className="btn ghost sm" style={{width:"100%"}} onClick={() => onOpenFull(null)}>
              Open full Board →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Auto-Equip algorithm --------
function autoEquipAll(units) {
  const INV = window.INVENTORY || {};
  const out = {};
  units.forEach(u => {
    const newGear = { ...u.gear };
    ["main","off","armor","locket"].forEach(slot => {
      const pool = (INV[slot] || []).filter(i =>
        i.allows && (i.allows.includes("*") || i.allows.includes(u.cls))
      );
      if (pool.length === 0) return;
      // Score: prefer highest dmg / def / sigil-match
      const score = (it) => {
        let s = 0;
        if (it.dmg) s += parseInt((it.dmg+"").split(/[–-]/)[1] || it.dmg) || 0;
        if (it.def) s += (parseInt(it.def) || 0) * 3;
        if (it.sigil && it.sigil === u.sigil) s += 10;
        return s;
      };
      const best = pool.slice().sort((a,b) => score(b) - score(a))[0];
      if (best) newGear[slot] = best.name;
    });
    out[u.id] = newGear;
  });
  return out;
}

// -------- Main Stores view --------
function StoresView({
  units, parties, treasury, storesStock, onEquipUnit, onBuy, onAutoEquip,
  postings, postingAssignments, sealedPostings,
  onOpenPostingDetail, equipmentLayout, merchantVisible,
}) {
  const [selectedItemId, setSelectedItemId] = React.useState(null);
  const [equipTarget, setEquipTarget] = React.useState(null); // { slot, item }
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [bulkQtys, setBulkQtys] = React.useState({}); // keyed by "itemId:slot"
  const [slotFilter, setSlotFilter] = React.useState("all"); // "all" | "main" | "off" | ...

  const inv = React.useMemo(() => buildStoresInventory(units, storesStock), [units, storesStock]);

  const slotsToShow = slotFilter === "all" ? ["main","off","armor","locket"] : [slotFilter];

  const merchantOffers = React.useMemo(() => {
    return MERCHANT_OFFERS.filter(o => slotFilter === "all" || o.slot === slotFilter);
  }, [slotFilter]);

  const setBulkQty = (key, q) => setBulkQtys(prev => ({ ...prev, [key]: q }));

  return (
    <main className="main stores-main">
      {/* Header */}
      <div className="stores-head">
        <div style={{minWidth:0, flex:1}}>
          <div className="display" style={{fontSize:28, color:"var(--ink)"}}>The Warden's Stores</div>
          <div className="italic-note" style={{fontSize:13}}>
            A long room off the gatehouse. Weapons on the rack. Armor on stands. Traders come and go at the side door. A board by the lintel keeps the postings honest.
          </div>
        </div>
        <div className="stores-head-actions">
          <div style={{display:"flex", flexDirection:"column", gap:6, alignItems:"stretch"}}>
            <div className="stores-treasury">
              <span className="label" style={{fontSize:9}}>Treasury</span>
              <span style={{fontFamily:"var(--mono)", fontSize:17, color:"var(--ink)", display:"inline-flex", alignItems:"center", gap:4}}>
                <Crown size={13}/> {treasury}
              </span>
            </div>
            <button className="btn ghost sm" onClick={onAutoEquip} title="Issue each soul the best fitting kit on hand" style={{width:"100%"}}>
              ⚒ Outfit the Household
            </button>
          </div>
          <button className="btn" onClick={() => setDrawerOpen(o => !o)} title="View postings">
            § Postings
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="stores-filter-bar">
        <span className="label" style={{fontSize:9.5, marginRight:4}}>Show</span>
        {[
          ["all", "All"],
          ["main", "Main-hand"],
          ["off", "Off-hand"],
          ["armor", "Armor"],
          ["locket", "Lockets"],
        ].map(([key, lbl]) => (
          <button
            key={key}
            className={`filter-chip ${slotFilter === key ? "active" : ""}`}
            onClick={() => setSlotFilter(key)}
          >{lbl}</button>
        ))}
      </div>

      {/* Body: Inventory (left/main) + Merchant (right, narrower) */}
      <div className={`stores-body ${merchantVisible ? "" : "no-merchant"} layout-${equipmentLayout}`}>

        {/* INVENTORY RACK */}
        <section className="stores-inventory">
          <div className="banner-rule"><span className="title">Household Rack</span><span className="count-pill">{Object.values(inv).reduce((a, arr) => a + arr.length, 0)} items on hand</span></div>

          {equipmentLayout === "columns" ? (
            <div className="stores-columns">
              {slotsToShow.map(slot => (
                <div key={slot} className="stores-column">
                  <div className="column-head">
                    <span style={{fontSize:14}}>{SLOT_GLYPHS[slot]}</span>
                    <span style={{fontFamily:"var(--serif)", fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", fontSize:10.5}}>
                      {SLOT_LABELS[slot]}
                    </span>
                    <span style={{marginLeft:"auto", fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-fade)"}}>
                      {inv[slot].length}
                    </span>
                  </div>
                  <div className="column-items">
                    {inv[slot].length === 0 && (
                      <div className="italic-note" style={{fontSize:11, padding:"6px 4px"}}>— rack is bare —</div>
                    )}
                    {inv[slot].map(entry => (
                      <ItemCard
                        key={entry.item.id}
                        entry={entry}
                        slot={slot}
                        units={units}
                        isSelected={selectedItemId === entry.item.id}
                        onSelect={setSelectedItemId}
                        onOpenEquip={(s, it) => setEquipTarget({ slot: s, item: it })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stores-grid">
              {slotsToShow.flatMap(slot =>
                inv[slot].map(entry => (
                  <ItemCard
                    key={slot + "_" + entry.item.id}
                    entry={entry}
                    slot={slot}
                    units={units}
                    isSelected={selectedItemId === entry.item.id}
                    onSelect={setSelectedItemId}
                    onOpenEquip={(s, it) => setEquipTarget({ slot: s, item: it })}
                  />
                ))
              )}
            </div>
          )}
        </section>

        {/* MERCHANT STALL */}
        {merchantVisible && (
          <aside className="stores-merchant">
            <div className="banner-rule">
              <span className="title">Traders' Stall</span>
              <span className="count-pill">{merchantOffers.length}</span>
            </div>
            <div className="merchant-flavor">
              "Steel and leather, crowns and salt. What'll it be, Warden?"
              <div style={{marginTop:4, fontSize:10.5, color:"var(--ink-fade)", fontStyle:"normal"}}>
                — Hale Drommer, road-trader · visits thrice a moon.
              </div>
            </div>
            <div className="merchant-list">
              {merchantOffers.map(offer => {
                const key = offer.itemId + ":" + offer.slot;
                const qty = bulkQtys[key] || 1;
                return (
                  <MerchantCard
                    key={key}
                    offer={offer}
                    canAfford={treasury >= offer.price * qty}
                    bulkQty={qty}
                    setBulkQty={(q) => setBulkQty(key, q)}
                    isSelected={selectedItemId === key}
                    onSelect={setSelectedItemId}
                    onBuy={(o, q) => { onBuy(o, q); setBulkQty(key, 1); }}
                  />
                );
              })}
              {merchantOffers.length === 0 && (
                <div className="italic-note" style={{fontSize:11.5, padding:10}}>
                  No stock of this kind in the stall.
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Flavor footer */}
      <div style={{marginTop:14, padding:"8px 12px", border:"1px dashed var(--rule)", borderRadius:2, fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-fade)", fontSize:12}}>
        "A sword is a tool. A tool in the wrong hand is a prayer for trouble. Outfit them deliberately."
      </div>

      {/* Equip popover */}
      {equipTarget && (
        <EquipPopover
          slot={equipTarget.slot}
          item={equipTarget.item}
          units={units}
          onEquip={onEquipUnit}
          onClose={() => setEquipTarget(null)}
        />
      )}

      {/* Postings drawer */}
      <PostingsDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen(o => !o)}
        postings={postings}
        assignments={postingAssignments}
        sealed={sealedPostings}
        onOpenFull={onOpenPostingDetail}
      />
    </main>
  );
}

Object.assign(window, { StoresView, MERCHANT_OFFERS, defaultStock, autoEquipAll });
