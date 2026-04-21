// SIGILBORNE — The Warden's Oath — tweaks panel

function OathTweaks({ tweaks, setTweaks, visible }) {
  if (!visible) return null;
  return (
    <div className="tweaks-panel">
      <h4>Tweaks</h4>

      <div className="tweak-row">
        <span className="k">Tone</span>
        <select
          className="select"
          value={tweaks.tone}
          onChange={e => setTweaks({ ...tweaks, tone: e.target.value })}
        >
          <option value="interview">Interview</option>
          <option value="rite">Rite</option>
          <option value="audit">Audit</option>
        </select>
      </div>

      <div className="tweak-row">
        <span className="k">Flow</span>
        <select
          className="select"
          value={tweaks.flow}
          onChange={e => setTweaks({ ...tweaks, flow: e.target.value })}
        >
          <option value="step">One at a time</option>
          <option value="scroll">Single scroll</option>
        </select>
      </div>

      <div className="tweak-row">
        <span className="k">Sigil reveal</span>
        <select
          className="select"
          value={tweaks.sigilReveal}
          onChange={e => setTweaks({ ...tweaks, sigilReveal: e.target.value })}
        >
          <option value="emergent">Emergent (top 3)</option>
          <option value="free">Free pick (all 10)</option>
        </select>
      </div>

      <div style={{fontSize:10.5, fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-fade)", marginTop:8, lineHeight:1.4}}>
        Changes apply live. Answers persist across tweaks.
      </div>
    </div>
  );
}

Object.assign(window, { OathTweaks });
