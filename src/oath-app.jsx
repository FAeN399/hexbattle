// SIGILBORNE — The Warden's Oath — app shell

const { useState: useOathState, useEffect: useOathEffect } = React;

const STORAGE_KEY = "sigilborne.wardens-oath.v1";

function loadSaved() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;
    return JSON.parse(s);
  } catch { return null; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function OathApp() {
  const saved = loadSaved() || {};

  const [tweaks, setTweaks] = useOathState(saved.tweaks || window.TWEAK_DEFAULTS);
  const [name, setName] = useOathState(saved.name || "");
  const [answers, setAnswers] = useOathState(saved.answers || {});
  const [step, setStep] = useOathState(typeof saved.step === "number" ? saved.step : 0);
  const [tweaksVisible, setTweaksVisible] = useOathState(false);
  const [showReveal, setShowReveal] = useOathState(!!saved.showReveal);
  const [chosenSigil, setChosenSigil] = useOathState(saved.chosenSigil || null);
  const [sealed, setSealed] = useOathState(!!saved.sealed);

  // Persist
  useOathEffect(() => {
    saveState({ tweaks, name, answers, step, showReveal, chosenSigil, sealed });
  }, [tweaks, name, answers, step, showReveal, chosenSigil, sealed]);

  // Edit mode listener
  useOathEffect(() => {
    const h = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksVisible(true);
      else if (e.data.type === "__deactivate_edit_mode") setTweaksVisible(false);
    };
    window.addEventListener("message", h);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", h);
  }, []);

  // Apply tone class to body
  useOathEffect(() => {
    document.body.classList.remove("tone-interview", "tone-rite", "tone-audit");
    document.body.classList.add(`tone-${tweaks.tone}`);
    document.body.classList.toggle("flow-scroll", tweaks.flow === "scroll");
  }, [tweaks.tone, tweaks.flow]);

  // Persist tweaks to editmode
  useOathEffect(() => {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: tweaks }, "*");
  }, [tweaks]);

  const { sorted: ranking } = useMemoScroll(() => computeSigilRanking(answers), [answers]);

  // Pre-select emergent top when reveal opens
  useOathEffect(() => {
    if (showReveal && !chosenSigil && ranking.length > 0 && ranking[0].weight > 0) {
      setChosenSigil(ranking[0].sigil);
    }
  }, [showReveal]);

  const allAnswered = name.trim().length >= 2 &&
    OATH_QUESTIONS.every(q => q.kind === "name" || answers[q.id]);

  const handleReset = () => {
    if (confirm("Tear up the scroll and begin again?")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };

  const handleFinalize = () => setShowReveal(true);
  const handleSeal = () => {
    setSealed(true);
    setShowReveal(false);
  };

  const totalStage = (
    <div className="oath-stage">
      <div className="oath-chapter">
        <div className="kicker">Character Creation · Sigilborne</div>
        <div className="title">The Warden's Oath</div>
        <div className="subtitle">An interview, an oath, and a sigil to carry.</div>
      </div>

      <div className="ledger parchment">
        {sealed ? (
          <AfterwardPage name={name} chosenSigil={chosenSigil} tone={tweaks.tone}/>
        ) : (
          <InterviewPage
            step={step}
            setStep={setStep}
            answers={answers}
            name={name}
            onNameChange={setName}
            onAnswer={(qid, v) => setAnswers({ ...answers, [qid]: v })}
            tone={tweaks.tone}
            flow={tweaks.flow}
            canFinalize={allAnswered}
            onFinalize={handleFinalize}
          />
        )}
        <div className="ledger-page right">
          <div className="page-head">
            <div className="label">Folio II · The Scroll</div>
            <div className="foliox">
              {sealed ? "SEALED" : "draft"}
            </div>
          </div>
          <OathScroll
            answers={answers}
            name={name}
            ranking={ranking}
            chosenSigil={sealed ? chosenSigil : null}
            sealed={sealed}
          />
        </div>
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, gap:12, color:"var(--vellum-edge)"}}>
        <div style={{fontFamily:"var(--serif)", fontStyle:"italic", fontSize:12}}>
          {sealed
            ? `The hall receives you, ${name || "Warden"}. Sigil of ${chosenSigil}, sworn and sealed.`
            : "Answers save as you go. You may tear up the scroll at any time."}
        </div>
        <div style={{display:"flex", gap:8}}>
          {sealed && (
            <a
              className="btn ghost sm"
              href="Party Command.html"
              style={{textDecoration:"none"}}
            >
              ▸ Enter the Hall
            </a>
          )}
          <button className="btn ghost sm" onClick={handleReset}>
            Tear Up the Scroll
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {totalStage}
      {showReveal && (
        <RevealOverlay
          ranking={ranking}
          chosenSigil={chosenSigil}
          setChosenSigil={setChosenSigil}
          sigilReveal={tweaks.sigilReveal}
          onSeal={handleSeal}
          name={name}
          sealed={sealed}
        />
      )}
      <OathTweaks tweaks={tweaks} setTweaks={setTweaks} visible={tweaksVisible}/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<OathApp/>);
