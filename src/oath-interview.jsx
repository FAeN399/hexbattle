// SIGILBORNE — The Warden's Oath — interview (left page)

function NameStep({ name, onChange, tone }) {
  return (
    <div>
      <input
        className="name-input"
        placeholder={tone === "audit" ? "ENTER SURNAME, GIVEN" : "Iskel Vance …"}
        value={name}
        onChange={e => onChange(e.target.value)}
        maxLength={40}
        autoFocus
      />
    </div>
  );
}

function ChoiceStep({ question, value, onChange, tone }) {
  return (
    <div className="answer-list">
      {question.options.map((opt, i) => {
        const marker = String.fromCharCode(65 + i); // A, B, C...
        const selected = value === opt.id;
        const costs = [];
        if (opt.gift) costs.push(<span key="g" className="gift">◆ {opt.gift}</span>);
        if (opt.cost) costs.push(<span key="c" className="cost">▲ {opt.cost}</span>);
        return (
          <div
            key={opt.id}
            className={`answer-option ${selected ? "selected" : ""}`}
            data-marker={selected ? "" : marker + "."}
            onClick={() => onChange(opt.id)}
            role="button"
            tabIndex={0}
          >
            <div className="answer-headline">{opt.headline}</div>
            {opt.gloss && <div className="answer-gloss">{opt.gloss}</div>}
            {costs.length > 0 && <div className="answer-cost">{costs}</div>}
          </div>
        );
      })}
    </div>
  );
}

function InterviewStep({ question, answers, name, onNameChange, onAnswer, tone }) {
  const prompt = question.prompt[tone] || question.prompt.interview;
  const flavor = question.flavor[tone] || question.flavor.interview;

  return (
    <div className="interview-step">
      <div className="dialog-prompt">{prompt}</div>
      <div className="dialog-flavor">— Osmund Varr, Warden the Elder</div>
      {question.kind === "name" ? (
        <NameStep name={name} onChange={onNameChange} tone={tone} />
      ) : (
        <ChoiceStep
          question={question}
          value={answers[question.id]}
          onChange={(v) => onAnswer(question.id, v)}
          tone={tone}
        />
      )}
      {flavor && tone === "audit" && (
        <div className="dialog-flavor" style={{marginTop:10, marginBottom:0}}>{flavor}</div>
      )}
    </div>
  );
}

function InterviewPage({ step, setStep, answers, name, onNameChange, onAnswer, tone, flow, canFinalize, onFinalize }) {
  const q = OATH_QUESTIONS[step];
  const total = OATH_QUESTIONS.length;
  const canAdvance = q.kind === "name" ? (name && name.trim().length >= 2) : !!answers[q.id];
  const isLast = step === total - 1;

  if (flow === "scroll") {
    // All questions visible, one after another, dim upcoming until prior answered
    let firstUnansweredIdx = OATH_QUESTIONS.findIndex((qx, i) => {
      if (qx.kind === "name") return !name || name.trim().length < 2;
      return !answers[qx.id];
    });
    if (firstUnansweredIdx < 0) firstUnansweredIdx = OATH_QUESTIONS.length;

    return (
      <div className="ledger-page left">
        <div className="page-head">
          <div className="label">Folio I · The Interview</div>
          <div className="foliox">{firstUnansweredIdx}/{total} answered</div>
        </div>

        <div className="warden-frame">
          <div className="warden-portrait"><OldWardenPortrait/></div>
          <div className="warden-id">
            <div className="name">Osmund Varr</div>
            <div className="title-line">Warden the Elder · of the hall that will soon be yours</div>
            <div className="tenure">Serving · 41 years · 7 campaigns · 1 withdrawal</div>
          </div>
        </div>

        {OATH_QUESTIONS.map((qx, i) => {
          const dim = i > firstUnansweredIdx;
          return (
            <div key={qx.id} className={`interview-step ${dim ? "upcoming" : ""}`}>
              <InterviewStep
                question={qx}
                answers={answers}
                name={name}
                onNameChange={onNameChange}
                onAnswer={onAnswer}
                tone={tone}
              />
            </div>
          );
        })}

        {canFinalize && (
          <div style={{marginTop:18, textAlign:"center"}}>
            <button className="btn" onClick={onFinalize}>▸ Read the Chorus</button>
          </div>
        )}
      </div>
    );
  }

  // step mode
  return (
    <div className="ledger-page left">
      <div className="page-head">
        <div className="label">Folio I · The Interview</div>
        <div className="foliox">Question {step+1} / {total}</div>
      </div>

      <div className="warden-frame">
        <div className="warden-portrait"><OldWardenPortrait/></div>
        <div className="warden-id">
          <div className="name">Osmund Varr</div>
          <div className="title-line">Warden the Elder · of the hall that will soon be yours</div>
          <div className="tenure">Serving · 41 years · 7 campaigns · 1 withdrawal</div>
        </div>
      </div>

      <InterviewStep
        question={q}
        answers={answers}
        name={name}
        onNameChange={onNameChange}
        onAnswer={onAnswer}
        tone={tone}
      />

      <div className="interview-nav">
        <button
          className="btn ghost sm"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{opacity: step === 0 ? 0.3 : 1}}
        >
          ◂ Back
        </button>

        <div className="step-dots" role="tablist">
          {OATH_QUESTIONS.map((_, i) => {
            const done = i < step || (i === step && canAdvance);
            const answered = (i === 0 && name && name.trim().length >= 2) ||
                             (i > 0 && answers[OATH_QUESTIONS[i].id]);
            return (
              <div
                key={i}
                className={`step-dot ${answered ? "done" : ""} ${i === step ? "current" : ""}`}
                onClick={() => setStep(i)}
                title={OATH_QUESTIONS[i].scrollKey}
              />
            );
          })}
        </div>

        {isLast ? (
          <button
            className="btn"
            onClick={onFinalize}
            disabled={!canFinalize}
            style={{opacity: canFinalize ? 1 : 0.35}}
          >
            Read the Chorus ▸
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance}
            style={{opacity: canAdvance ? 1 : 0.35}}
          >
            Next ▸
          </button>
        )}
      </div>
    </div>
  );
}

// After sealing — the left page becomes Osmund's closing benediction.
// No editing, no back button. The rite is finished.
function AfterwardPage({ name, chosenSigil, tone }) {
  const sigilLine = (window.SIGILS[chosenSigil] && window.SIGILS[chosenSigil].line) || "";
  const benediction = {
    interview: `It is done, ${name || "Warden"}. The hall's seal is on you now, and you on it. Go walk the cloister once before supper — that is the custom. I'll have the clerks enter you on the roll.`,
    rite:      `Thus is sworn. Thus is witnessed. Thus is sealed. Let the chorus of ${chosenSigil || "Bearing"} carry you where judgement must stand.`,
    audit:     `REGISTRATION COMPLETE. Roll amended. Seal affixed. Warden-of-record: ${name || "—"}. Sigil-of-record: ${chosenSigil || "—"}. This record is final and not subject to amendment by informal request.`,
  };

  return (
    <div className="ledger-page left afterward">
      <div className="page-head">
        <div className="label">Folio I · The Interview · Closed</div>
        <div className="foliox" style={{color:"var(--blood)"}}>RITE CONCLUDED</div>
      </div>

      <div className="warden-frame">
        <div className="warden-portrait"><OldWardenPortrait/></div>
        <div className="warden-id">
          <div className="name">Osmund Varr</div>
          <div className="title-line">Warden the Elder · now Warden no longer</div>
          <div className="tenure" style={{color:"var(--blood)"}}>Concluded · 41 years · seat vacated this day</div>
        </div>
      </div>

      <div className="dialog-prompt">{benediction[tone] || benediction.interview}</div>
      <div className="dialog-flavor">— Osmund Varr, the last thing he says before leaving the room</div>

      <div style={{marginTop:28, padding:"18px 0 0", borderTop:"1px solid var(--rule)", textAlign:"center"}}>
        <div className="label" style={{marginBottom:10, color:"var(--ink-soft)"}}>The Scroll is Sworn</div>
        <div style={{fontFamily:"var(--serif)", fontStyle:"italic", fontSize:13, color:"var(--ink-soft)", lineHeight:1.55, maxWidth:380, margin:"0 auto"}}>
          {sigilLine && <>&ldquo;{sigilLine}&rdquo;<br/></>}
          <span style={{color:"var(--ink-fade)", fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", fontStyle:"normal"}}>
            Sigil of {chosenSigil}
          </span>
        </div>
      </div>

      <div style={{marginTop:32, padding:"14px 0 0", borderTop:"1px dotted var(--rule-faint)"}}>
        <div style={{fontFamily:"var(--serif)", fontSize:11, fontStyle:"italic", color:"var(--ink-fade)", lineHeight:1.5, textAlign:"center"}}>
          An oath once sealed cannot be unspoken.<br/>
          The only return is to tear up the scroll and begin again — a new life, a new name.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InterviewPage, AfterwardPage });
