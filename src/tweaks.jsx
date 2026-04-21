// SIGILBORNE — Tweaks panel

const { useEffect: useTweakEffect, useState: useTweakState } = React;

function Tweaks({ tweaks, setTweaks, visible, onClose }) {
  if (!visible) return null;
  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
    } catch (e) {}
  };

  return (
    <div className="tweaks-panel" role="dialog" aria-label="Tweaks">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <h4>Tweaks</h4>
        <button className="btn ghost sm" onClick={onClose}>close</button>
      </div>
      <hr className="hrule"/>

      <div className="tweak-row">
        <span className="k">Palette</span>
        <select className="select" value={tweaks.paletteMode} onChange={(e)=>update({paletteMode: e.target.value})}>
          <option value="parchment">Parchment</option>
          <option value="dark">Iron & Candle</option>
        </select>
      </div>

      <div className="tweak-row">
        <span className="k">Density</span>
        <select className="select" value={tweaks.density} onChange={(e)=>update({density: e.target.value})}>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </div>

      <div className="tweak-row">
        <span className="k">Grid Lines</span>
        <button className="btn ghost sm" onClick={()=>update({showGridLines: !tweaks.showGridLines})}>
          {tweaks.showGridLines ? "Visible" : "Hidden"}
        </button>
      </div>

      <div className="tweak-row">
        <span className="k">Readouts</span>
        <button className="btn ghost sm" onClick={()=>update({showReadouts: !tweaks.showReadouts})}>
          {tweaks.showReadouts ? "Shown" : "Hidden"}
        </button>
      </div>

      <div className="tweak-row">
        <span className="k">Army Preset</span>
        <select className="select" value={tweaks.armyPreset} onChange={(e)=>update({armyPreset: e.target.value})}>
          <option value="warden">Warden's Household</option>
          <option value="spread">Even Spread</option>
          <option value="chorus">Chorus Test (Lumen)</option>
        </select>
      </div>

      <hr className="hrule"/>
      <div className="label" style={{fontSize:9.5, letterSpacing:"0.22em", color:"var(--ink-fade)", margin:"2px 0 4px"}}>Stores</div>

      <div className="tweak-row">
        <span className="k">Rack Layout</span>
        <select className="select" value={tweaks.equipmentLayout || "columns"} onChange={(e)=>update({equipmentLayout: e.target.value})}>
          <option value="columns">Four columns (by slot)</option>
          <option value="grid">Mixed grid</option>
        </select>
      </div>

      <div className="tweak-row">
        <span className="k">Traders' Stall</span>
        <button className="btn ghost sm" onClick={()=>update({merchantVisible: !(tweaks.merchantVisible !== false)})}>
          {tweaks.merchantVisible !== false ? "Visible" : "Hidden"}
        </button>
      </div>

      <div className="italic-note" style={{fontSize:11, marginTop:6}}>
        Changes persist between refreshes.
      </div>
    </div>
  );
}

Object.assign(window, { Tweaks });
