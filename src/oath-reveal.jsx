// SIGILBORNE — The Warden's Oath — reveal overlay

function RevealOverlay({ ranking, chosenSigil, setChosenSigil, sigilReveal, onSeal, name, sealed }) {
  const [showAll, setShowAll] = React.useState(sigilReveal === "free");
  const top = ranking.slice(0, 3);
  const primary = top[0] ? top[0].sigil : null;

  if (sealed) return null;

  return (
    <div className="reveal-overlay">
      <div className="reveal-card">
        <div className="reveal-kicker">The Chorus has Spoken</div>
        <div className="reveal-title">
          {primary ? `${primary} sings loudest.` : "No voice yet sounds clearly."}
        </div>
        <div style={{fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-soft)", fontSize:13.5, lineHeight:1.5, maxWidth:480, margin:"0 auto 4px"}}>
          {sigilReveal === "free"
            ? "You are free to choose any of the ten. The chorus suggests, but the Warden decides."
            : "Three voices rose from the interview. Confirm the first, or pick its second — the chorus will follow."}
        </div>

        <div className="reveal-grid">
          {top.map((r, i) => (
            <div
              key={r.sigil}
              className={`reveal-sigil-pick ${i===0 ? "primary" : ""} ${chosenSigil === r.sigil ? "selected" : ""}`}
              onClick={() => setChosenSigil(r.sigil)}
            >
              <div className="shield-wrap">
                <Heraldry seed={(name || "warden") + r.sigil} sigil={r.sigil} size={52}/>
              </div>
              <div className="sn">{r.sigil}</div>
              <div className="sline">{window.SIGILS[r.sigil].line}</div>
              <div className="sweight">weight {r.weight}</div>
            </div>
          ))}
        </div>

        {!showAll && sigilReveal !== "free" && (
          <div className="reveal-expand" onClick={() => setShowAll(true)}>
            — or pick freely from all ten sigils —
          </div>
        )}

        {showAll && (
          <>
            <div style={{fontFamily:"var(--serif)", fontSize:10.5, letterSpacing:"0.26em", textTransform:"uppercase", color:"var(--ink-soft)", marginTop:14, marginBottom:4}}>
              The Full Chorus
            </div>
            <div className="reveal-all-grid">
              {Object.keys(window.SIGILS).map(s => (
                <div
                  key={s}
                  className={`reveal-sigil-pick ${chosenSigil === s ? "selected" : ""}`}
                  onClick={() => setChosenSigil(s)}
                >
                  <div className="shield-wrap">
                    <Heraldry seed={(name || "warden") + s} sigil={s} size={36}/>
                  </div>
                  <div className="sn">{s}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="reveal-cta">
          <button
            className="btn"
            onClick={onSeal}
            disabled={!chosenSigil}
            style={{opacity: chosenSigil ? 1 : 0.35, padding:"8px 24px", fontSize:12.5}}
          >
            ✦ Set the Seal
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RevealOverlay });
