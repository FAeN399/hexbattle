// SIGILBORNE — The Warden's Oath — scroll (right page) & wax seal

const { useMemo: useMemoScroll } = React;

function OldWardenPortrait() {
  // a stylised profile — not a photo, not a cartoon. Ink sketch on a warm ground.
  return (
    <svg viewBox="0 0 64 78" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="warden-bg" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#4a3d27"/>
          <stop offset="70%" stopColor="#1a1511"/>
          <stop offset="100%" stopColor="#0a0805"/>
        </radialGradient>
      </defs>
      <rect width="64" height="78" fill="url(#warden-bg)"/>
      {/* profile — facing left, bearded, weary */}
      <g stroke="#e9dfc6" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.92">
        {/* skull / back of head */}
        <path d="M46 16 C 52 18 54 26 52 34 C 51 40 49 45 47 50"/>
        {/* forehead + brow */}
        <path d="M46 16 C 40 15 34 18 30 24 C 28 28 28 32 30 36"/>
        {/* nose */}
        <path d="M30 32 C 26 33 23 36 24 40 C 25 42 28 42 30 41"/>
        {/* lip + beard line */}
        <path d="M30 41 C 29 44 31 46 33 47 C 32 50 30 54 31 58 C 33 64 38 66 43 65 C 47 64 50 62 52 58"/>
        {/* beard texture */}
        <path d="M31 50 C 33 52 35 54 36 57" opacity="0.6"/>
        <path d="M33 48 C 36 50 39 52 40 56" opacity="0.5"/>
        <path d="M36 47 C 39 49 42 51 44 55" opacity="0.4"/>
        {/* neck + collar */}
        <path d="M43 65 L 42 72 M52 58 L 54 72"/>
        <path d="M40 72 L 56 72 L 58 78" opacity="0.7"/>
        {/* eye — a single mark, tired */}
        <path d="M36 30 L 39 30" strokeWidth="0.9"/>
        <path d="M36 32 C 37 33 38 33 39 32" opacity="0.5"/>
        {/* temple scar */}
        <path d="M42 22 L 46 24" strokeWidth="0.5" opacity="0.7"/>
        {/* hair/crown wisps */}
        <path d="M48 14 C 50 12 53 13 54 16"/>
        <path d="M44 14 C 45 12 47 12 48 14"/>
      </g>
      {/* faint candlelight on nose & cheekbone */}
      <path d="M28 36 C 29 36 30 37 29 38 Z" fill="#e9dfc6" opacity="0.2"/>
    </svg>
  );
}

function WaxSeal({ sigil, size=64 }) {
  const color = (window.SIGILS[sigil] && window.SIGILS[sigil].color) || "#7a1e1e";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="seal-svg" aria-hidden="true">
      <defs>
        <radialGradient id="wax-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#c63b3b"/>
          <stop offset="55%" stopColor="#8a1e1e"/>
          <stop offset="100%" stopColor="#4a0a0a"/>
        </radialGradient>
      </defs>
      {/* drips */}
      <path d="M14 58 C 10 66 12 74 18 78 C 22 76 22 70 20 64 Z" fill="#7a1e1e" opacity="0.6"/>
      <path d="M84 56 C 90 64 88 72 82 76 C 78 74 78 68 80 62 Z" fill="#7a1e1e" opacity="0.6"/>
      <path d="M30 84 C 28 88 32 92 36 90 C 36 86 34 84 30 84 Z" fill="#7a1e1e" opacity="0.5"/>
      {/* main disc */}
      <circle cx="50" cy="48" r="34" fill="url(#wax-grad)" stroke="#3a0808" strokeWidth="1.2"/>
      {/* ring of text-dots */}
      <g fill="#4a0a0a" opacity="0.7">
        {[...Array(24)].map((_, i) => {
          const a = (i * Math.PI * 2) / 24;
          const x = 50 + Math.cos(a) * 28;
          const y = 48 + Math.sin(a) * 28;
          return <circle key={i} cx={x} cy={y} r="0.9"/>;
        })}
      </g>
      {/* inner ring */}
      <circle cx="50" cy="48" r="22" fill="none" stroke="#4a0a0a" strokeWidth="0.8" opacity="0.6"/>
      {/* sigil imprint — reuse Charge component in a tinted way */}
      <g transform="translate(0, -4)" opacity="0.85">
        <Charge type={(window.SIGILS[sigil] && window.SIGILS[sigil].glyph) || "bearing"} fill="#2a0606"/>
      </g>
      {/* highlight */}
      <ellipse cx="38" cy="34" rx="8" ry="4" fill="#e89090" opacity="0.35"/>
    </svg>
  );
}

function SigilWeightMeter({ ranking, show }) {
  if (!show) return null;
  const max = Math.max(1, ...ranking.map(r => r.weight));
  const rows = ranking.filter(r => r.weight > 0);
  if (rows.length === 0) {
    return (
      <div className="sigil-meter">
        <div className="sigil-meter-title">Sigil Chorus · not yet sung</div>
        <div className="italic-note" style={{fontSize:11.5, paddingLeft:2}}>
          The scroll waits. Answer, and the weights will gather.
        </div>
      </div>
    );
  }
  return (
    <div className="sigil-meter">
      <div className="sigil-meter-title">Sigil Chorus · as heard so far</div>
      {rows.slice(0, 6).map((r, i) => (
        <div key={r.sigil} className={`sigil-weight-row ${i===0 ? "leader" : ""}`}>
          <SigilGlyph sigil={r.sigil} size={14} />
          <span className="name">{r.sigil}</span>
          <span className="bar"><span style={{width: `${(r.weight/max)*100}%`}}/></span>
          <span className="val">{r.weight}</span>
        </div>
      ))}
    </div>
  );
}

function ScrollField({ k, v, emptyText, animate }) {
  const empty = !v;
  return (
    <div className="scroll-field">
      <div className="k">{k}</div>
      <div className={`v ${empty ? "empty" : ""} ${animate && !empty ? "inked" : ""}`} key={v || "empty"}>
        {empty ? (emptyText || "— unwritten —") : v}
      </div>
    </div>
  );
}

function OathScroll({ answers, name, ranking, chosenSigil, sealed }) {
  // map answers to the scroll's prose form
  const answerText = (qid) => {
    const q = OATH_QUESTIONS.find(x => x.id === qid);
    if (!q || !answers[qid]) return null;
    const opt = q.options.find(o => o.id === answers[qid]);
    return opt ? opt.headline : null;
  };

  const originText = () => {
    const q = OATH_QUESTIONS.find(x => x.id === "origin");
    if (!q || !answers.origin) return null;
    const opt = q.options.find(o => o.id === answers.origin);
    return opt ? opt.headline : null;
  };

  const nature = inferredNature(answers);

  return (
    <div className="oath-scroll">
      <div className="scroll-title">The Writ of Bearing</div>
      <div className="scroll-sub">Inscribed at the Warden's seat · year of the current reckoning</div>

      <div className="scroll-ornament"><span className="diamond"/></div>

      {/* Name — centered, big */}
      <div className={`scroll-name ${name ? "" : "empty"}`} key={name || "none"}>
        {name || "— name to be inscribed —"}
      </div>

      {/* Particulars */}
      <ScrollField k="Origin"       v={originText()}      animate />
      <ScrollField k="Nature"       v={nature}            animate />
      <ScrollField k="Bearing"      v={answerText("first_hurt")}        animate />
      <ScrollField k="At Crossroads" v={answerText("at_the_crossroads")} animate />
      <ScrollField k="Token Borne" v={answerText("what_you_carry")}    animate />
      <ScrollField k="Oath"         v={answerText("oath")}              animate />
      <ScrollField k="Wound"        v={answerText("wound")}             animate />

      {/* Sigil panel */}
      <div className={`sigil-panel ${chosenSigil ? "" : "emergent"}`}>
        <div className="sigil-shield">
          {chosenSigil ? (
            <Heraldry seed={(name || "warden") + chosenSigil} sigil={chosenSigil} size={62} />
          ) : (
            <svg viewBox="0 0 100 104" width={62} height={65} aria-hidden="true">
              <path d="M5 5 L95 5 L95 50 C95 78 78 94 50 99 C22 94 5 78 5 50 Z"
                fill="rgba(168,134,74,0.08)" stroke="rgba(26,24,20,0.6)" strokeWidth="2.2" strokeDasharray="4 3"/>
              <text x="50" y="58" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="12" fill="#7a6c54">?</text>
            </svg>
          )}
        </div>
        <div className="sigil-info">
          <div className="sk">Sigil</div>
          <div className="sn">
            {chosenSigil || "still emerging"}
          </div>
          <div className="sline">
            {chosenSigil
              ? (window.SIGILS[chosenSigil] && window.SIGILS[chosenSigil].line)
              : "The chorus has not yet agreed."}
          </div>
        </div>
      </div>

      <SigilWeightMeter ranking={ranking} show={!chosenSigil} />

      {/* Seal area */}
      <div className="scroll-seal-area">
        <div className={`wax-seal-slot ${sealed ? "sealed" : ""}`}>
          {sealed && chosenSigil ? <WaxSeal sigil={chosenSigil} size={70}/> : <span>awaiting<br/>seal</span>}
        </div>
        <div className="witness-lines">
          <div className="witness-line">
            <span style={{minWidth:62}}>Sworn:</span>
            <span className="wline">{name || ""}</span>
          </div>
          <div className="witness-line">
            <span style={{minWidth:62}}>Witnessed:</span>
            <span className="wline">{sealed ? "Osmund Varr, Warden the Elder" : ""}</span>
          </div>
          <div className="witness-line">
            <span style={{minWidth:62}}>Date:</span>
            <span className="wline" style={{textAlign:"left", fontFamily:"var(--mono)", fontSize:11}}>
              {sealed ? "12th of Harrowmonth, Year 347 of the Long Reckoning" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OathScroll, WaxSeal, OldWardenPortrait });
