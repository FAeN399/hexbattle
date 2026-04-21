// SIGILBORNE — Heraldry: deterministic shield SVGs + sigil glyphs

const { useMemo } = React;

// simple seeded hash
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const FIELD_COLORS = [
  "#2b3a5a", // iron-blue
  "#7a1e1e", // blood
  "#44623a", // verdant
  "#2d5a66", // tide
  "#6b5a3f", // stone
  "#a3501f", // ember
  "#3a2a4a", // void
  "#5c7a8a", // frost
  "#1a1814", // ink black
];
const CHARGE_COLORS = ["#e9dfc6", "#c9a25d", "#a8864a", "#d6c79f"];

// Heraldic field patterns (per-seed): plain, chevron, bend, pale, cross, saltire, chief, quartered
const FIELDS = ["plain","chevron","bend","pale","cross","saltire","chief","quartered","fess","lozengy"];

function Charge({ type, fill }) {
  // small glyph (viewBox 100x100-ish) centered on shield
  const f = fill;
  switch (type) {
    case "bearing":
      return <path fill={f} d="M50 18 L58 40 L82 42 L64 58 L70 82 L50 68 L30 82 L36 58 L18 42 L42 40 Z" />;
    case "edge":
      return <g fill={f}><path d="M50 12 L54 62 L50 72 L46 62 Z"/><rect x="36" y="60" width="28" height="4"/><rect x="48" y="62" width="4" height="22"/></g>;
    case "shield":
      return <path fill={f} d="M50 18 C30 18 26 22 26 22 L28 52 C28 68 42 78 50 82 C58 78 72 68 72 52 L74 22 C74 22 70 18 50 18 Z" />;
    case "ember":
      return <path fill={f} d="M50 18 C40 34 34 40 34 54 A16 16 0 0 0 66 54 C66 44 60 40 56 32 C54 42 50 44 48 40 C46 36 48 28 50 18 Z"/>;
    case "verdant":
      return <g fill={f}>
        <path d="M50 22 C30 30 28 58 38 78 C48 70 54 50 50 22 Z"/>
        <path d="M50 22 C70 30 72 58 62 78 C52 70 46 50 50 22 Z"/>
      </g>;
    case "tide":
      return <g fill="none" stroke={f} strokeWidth="6" strokeLinecap="round">
        <path d="M22 44 Q34 34 46 44 T70 44 T82 44"/>
        <path d="M22 60 Q34 50 46 60 T70 60 T82 60"/>
        <path d="M22 76 Q34 66 46 76 T70 76 T82 76"/>
      </g>;
    case "stone":
      return <g fill={f}><polygon points="50,22 74,40 66,74 34,74 26,40"/></g>;
    case "lumen":
      return <g fill={f}>
        <circle cx="50" cy="52" r="14"/>
        {[...Array(8)].map((_,i)=>{
          const a=(i*Math.PI*2)/8;
          const x1=50+Math.cos(a)*20, y1=52+Math.sin(a)*20;
          const x2=50+Math.cos(a)*30, y2=52+Math.sin(a)*30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={f} strokeWidth="3" strokeLinecap="round"/>;
        })}
      </g>;
    case "void":
      return <g><circle cx="50" cy="52" r="22" fill={f}/><circle cx="50" cy="52" r="10" fill="#1a1814"/></g>;
    case "frost":
      return <g stroke={f} strokeWidth="4" strokeLinecap="round" fill="none">
        <line x1="50" y1="24" x2="50" y2="80"/>
        <line x1="26" y1="52" x2="74" y2="52"/>
        <line x1="32" y1="34" x2="68" y2="70"/>
        <line x1="68" y1="34" x2="32" y2="70"/>
      </g>;
    default:
      return <circle cx="50" cy="52" r="14" fill={f}/>;
  }
}

function ShieldPath({ id }) {
  // classic heater shield outline
  return (
    <clipPath id={id}>
      <path d="M5 5 L95 5 L95 50 C95 78 78 94 50 99 C22 94 5 78 5 50 Z" />
    </clipPath>
  );
}

function Heraldry({ seed, sigil, size = 40, className = "" }) {
  const { field, c1, c2, ch } = useMemo(() => {
    const h = hash(seed || "x");
    const field = FIELDS[h % FIELDS.length];
    const c1 = FIELD_COLORS[(h >> 3) % FIELD_COLORS.length];
    let c2 = FIELD_COLORS[(h >> 7) % FIELD_COLORS.length];
    if (c2 === c1) c2 = FIELD_COLORS[((h >> 9)+2) % FIELD_COLORS.length];
    const ch = CHARGE_COLORS[(h >> 11) % CHARGE_COLORS.length];
    return { field, c1, c2, ch };
  }, [seed]);

  const clipId = `sh-${seed}`;
  const chargeType = (SIGILS[sigil] && SIGILS[sigil].glyph) || "bearing";
  const w = size;
  const h = Math.round(size * 104 / 100);

  // Field pattern
  let bg = null;
  switch (field) {
    case "plain":
      bg = <rect x="0" y="0" width="100" height="104" fill={c1}/>;
      break;
    case "chevron":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <polygon points="0,104 50,50 100,104 80,104 50,74 20,104" fill={c2}/>
      </g>;
      break;
    case "bend":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <polygon points="0,20 80,100 100,100 100,80 20,0 0,0" fill={c2}/>
      </g>;
      break;
    case "pale":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <rect x="36" y="0" width="28" height="104" fill={c2}/>
      </g>;
      break;
    case "cross":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <rect x="40" y="0" width="20" height="104" fill={c2}/>
        <rect x="0" y="42" width="100" height="20" fill={c2}/>
      </g>;
      break;
    case "saltire":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <polygon points="0,0 20,0 100,84 100,104 80,104 0,20" fill={c2}/>
        <polygon points="80,0 100,0 100,20 20,104 0,104 0,84" fill={c2}/>
      </g>;
      break;
    case "chief":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <rect x="0" y="0" width="100" height="28" fill={c2}/>
      </g>;
      break;
    case "quartered":
      bg = <g>
        <rect x="0" y="0" width="50" height="52" fill={c1}/>
        <rect x="50" y="0" width="50" height="52" fill={c2}/>
        <rect x="0" y="52" width="50" height="52" fill={c2}/>
        <rect x="50" y="52" width="50" height="52" fill={c1}/>
      </g>;
      break;
    case "fess":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        <rect x="0" y="40" width="100" height="24" fill={c2}/>
      </g>;
      break;
    case "lozengy":
      bg = <g>
        <rect x="0" y="0" width="100" height="104" fill={c1}/>
        {[...Array(6)].map((_,i)=>
          [...Array(4)].map((__,j)=>(
            ((i+j)%2===0) ? <polygon key={`${i}-${j}`} points={`${j*25+12.5-12},${i*18-9} ${j*25+12.5},${i*18-9+9} ${j*25+12.5-12},${i*18-9+18} ${j*25+12.5-24},${i*18-9+9}`} fill={c2}/> : null
          ))
        )}
      </g>;
      break;
  }

  return (
    <svg viewBox="0 0 100 104" width={w} height={h} className={`unit-shield ${className}`} aria-hidden="true">
      <defs>
        <ShieldPath id={clipId}/>
        <linearGradient id={`sheen-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)"/>
          <stop offset="60%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {bg}
        <Charge type={chargeType} fill={ch}/>
        <rect x="0" y="0" width="100" height="104" fill={`url(#sheen-${seed})`}/>
      </g>
      <path d="M5 5 L95 5 L95 50 C95 78 78 94 50 99 C22 94 5 78 5 50 Z"
        fill="none" stroke="rgba(26,24,20,0.8)" strokeWidth="2.5"/>
      <path d="M5 5 L95 5" stroke="rgba(26,24,20,0.9)" strokeWidth="2"/>
    </svg>
  );
}

// Small glyph (standalone — used for sigil chorus indicator)
function SigilGlyph({ sigil, size=18, color }) {
  const c = color || (SIGILS[sigil] && SIGILS[sigil].color) || "#1a1814";
  const type = (SIGILS[sigil] && SIGILS[sigil].glyph) || "bearing";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <Charge type={type} fill={c}/>
    </svg>
  );
}

Object.assign(window, { Heraldry, SigilGlyph });
