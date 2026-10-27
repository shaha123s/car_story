// مشاهد قصة السيارة الصغيرة بالـSVG (بدون صور خارجية) — كل مشهد يتغيّر حسب اختيار الطفل
// لوحة المشهد ١٠٠٠×٧٣٤، والسيارة تُرسم من الأمام (مثل الغلاف) وبلونها المختار.
import { COLORS } from './story'

const W = 1000
const H = 734
const T = '#2b2f3a'

/* ---------------- وجه الطفل (صورته أو وجه افتراضي) ---------------- */
function DefaultFace({ girl, sleep }) {
  return (
    <g>
      <ellipse cx="-98" cy="14" rx="14" ry="20" fill="#eebb92" />
      <ellipse cx="98" cy="14" rx="14" ry="20" fill="#eebb92" />
      <circle r="100" fill="#f8d2ae" />
      <path d="M-102 -8 Q-108 -104 0 -106 Q108 -104 102 -8 Q84 -66 0 -62 Q-84 -66 -102 -8Z" fill="#5a3420" />
      <circle cx="-62" cy="-62" r="22" fill="#5a3420" />
      <circle cx="-20" cy="-82" r="24" fill="#5a3420" />
      <circle cx="30" cy="-84" r="24" fill="#5a3420" />
      <circle cx="70" cy="-60" r="22" fill="#5a3420" />
      {girl && (
        <g>
          <path d="M-70 -92 L-118 -118 L-112 -70Z" fill="#ff6fa5" />
          <path d="M-70 -92 L-30 -122 L-24 -78Z" fill="#ff6fa5" />
          <circle cx="-70" cy="-92" r="14" fill="#ff3d86" />
        </g>
      )}
      <ellipse cx="-54" cy="44" rx="17" ry="11" fill="#ff9aa8" opacity=".6" />
      <ellipse cx="54" cy="44" rx="17" ry="11" fill="#ff9aa8" opacity=".6" />
      {sleep ? (
        <g fill="none" stroke="#2a1a14" strokeWidth="7" strokeLinecap="round">
          <path d="M-52 10 Q-34 24 -16 10" />
          <path d="M16 10 Q34 24 52 10" />
        </g>
      ) : (
        <g fill="#2a1a14">
          <circle cx="-34" cy="10" r="11" />
          <circle cx="34" cy="10" r="11" />
          <circle cx="-30" cy="5" r="3.6" fill="#fff" />
          <circle cx="38" cy="5" r="3.6" fill="#fff" />
        </g>
      )}
      <path d="M-26 46 Q0 72 26 46" fill="none" stroke="#a8431f" strokeWidth="7" strokeLinecap="round" />
    </g>
  )
}

export function Kid({ cx, cy, r, photo, girl, uid, sleep = false }) {
  const s = r / 100
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {photo ? (
        <>
          <clipPath id={`kc-${uid}`}>
            <circle r="100" />
          </clipPath>
          <circle r="104" fill="#fff" />
          <image href={photo} x="-100" y="-100" width="200" height="200" preserveAspectRatio="xMidYMid slice" clipPath={`url(#kc-${uid})`} />
        </>
      ) : (
        <DefaultFace girl={girl} sleep={sleep} />
      )}
    </g>
  )
}

/* ---------------- السيارة (واجهة أمامية، مكشوفة السقف والطفل فيها) ---------------- */
// الإحداثيات المحلية: العرض ±٢٣٠، الأرض y=0، وأعلى رأس الطفل عند y≈-٣٦٠
export function Car({ main, dark, mood = 'happy', kid = true, photo, girl, uid = 'c', x = 500, y = 640, s = 1, rot = 0, cls = '', arm = true }) {
  const sad = mood === 'sad'
  const sleep = mood === 'sleep'
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="0" cy="8" rx="255" ry="22" fill="#000" opacity=".2" />
      <g className={`car-bob ${cls}`}>
        {/* عجلات */}
        <ellipse cx="-208" cy="-48" rx="34" ry="52" fill={T} />
        <ellipse cx="208" cy="-48" rx="34" ry="52" fill={T} />
        <ellipse cx="-208" cy="-48" rx="14" ry="26" fill="#c9cdd8" />
        <ellipse cx="208" cy="-48" rx="14" ry="26" fill="#c9cdd8" />
        {/* الطفل */}
        {kid && (
          <g>
            <path d="M-62 -168 Q-64 -262 0 -266 Q64 -262 62 -168Z" fill="#e5484d" />
            <path d="M-8 -266 L-8 -170 M8 -266 L8 -170" stroke="#fff" strokeWidth="9" opacity=".9" />
            {arm && (
              <g className="wave">
                <path d="M52 -236 Q96 -262 118 -318" fill="none" stroke="#e5484d" strokeWidth="26" strokeLinecap="round" />
                <circle cx="120" cy="-326" r="17" fill="#f8d2ae" />
              </g>
            )}
            <Kid cx={0} cy={-300} r={62} photo={photo} girl={girl} uid={uid} sleep={sleep} />
          </g>
        )}
        {/* الهيكل */}
        <path d="M-232 -72 Q-244 -152 -190 -176 L-150 -182 L150 -182 L190 -176 Q244 -152 232 -72 Q226 -24 172 -22 L-172 -22 Q-226 -24 -232 -72Z" fill={main} />
        <path d="M-196 -150 Q-120 -186 0 -184 Q120 -186 196 -150 Q120 -172 0 -170 Q-120 -172 -196 -150Z" fill="#fff" opacity=".25" />
        <rect x="-176" y="-42" width="352" height="20" rx="10" fill={dark} />
        <rect x="-20" y="-182" width="40" height="86" fill="#fff" opacity=".95" />
        <ellipse cx="0" cy="-98" rx="22" ry="11" fill="#f5c24a" />
        <ellipse cx="-176" cy="-128" rx="22" ry="18" fill="#fff3a8" stroke={dark} strokeWidth="4" />
        <ellipse cx="176" cy="-128" rx="22" ry="18" fill="#fff3a8" stroke={dark} strokeWidth="4" />
        {/* زجاج أمامي صغير */}
        <path d="M-136 -178 L-112 -226 L112 -226 L136 -178Z" fill="#cfe9ff" opacity=".78" stroke={dark} strokeWidth="5" strokeLinejoin="round" />
        <path d="M-96 -214 L-76 -214 L-96 -184Z" fill="#fff" opacity=".6" />
        {/* العيون */}
        {sleep ? (
          <g fill="none" stroke="#1c2a5a" strokeWidth="9" strokeLinecap="round">
            <path d="M-124 -118 Q-88 -92 -52 -118" />
            <path d="M52 -118 Q88 -92 124 -118" />
          </g>
        ) : (
          <g>
            <ellipse cx="-86" cy="-120" rx="42" ry="44" fill="#fff" stroke="#e8edf5" strokeWidth="3" />
            <ellipse cx="86" cy="-120" rx="42" ry="44" fill="#fff" stroke="#e8edf5" strokeWidth="3" />
            <g className="eyes">
              <circle cx="-86" cy={sad ? -108 : -116} r="23" fill="#1d3f86" />
              <circle cx="86" cy={sad ? -108 : -116} r="23" fill="#1d3f86" />
              <circle cx="-86" cy={sad ? -108 : -116} r="12" fill="#0b1a40" />
              <circle cx="86" cy={sad ? -108 : -116} r="12" fill="#0b1a40" />
              <circle cx="-95" cy={sad ? -118 : -126} r="7" fill="#fff" />
              <circle cx="77" cy={sad ? -118 : -126} r="7" fill="#fff" />
            </g>
            {sad && (
              <g stroke={dark} strokeWidth="9" strokeLinecap="round">
                <path d="M-128 -160 L-52 -146" />
                <path d="M128 -160 L52 -146" />
              </g>
            )}
          </g>
        )}
        {sad && <path className="tear" d="M-112 -84 Q-120 -66 -112 -60 Q-104 -66 -112 -84Z" fill="#6cc4ff" />}
        {/* الفم */}
        {sad ? (
          <path d="M-46 -48 Q0 -86 46 -48" fill="none" stroke="#7a1022" strokeWidth="10" strokeLinecap="round" />
        ) : (
          <g>
            <clipPath id={`mc-${uid}`}>
              <path d="M-60 -74 Q0 -16 60 -74Z" />
            </clipPath>
            <path d="M-60 -74 Q0 -16 60 -74Z" fill="#7a1022" />
            <g clipPath={`url(#mc-${uid})`}>
              <rect x="-62" y="-76" width="124" height="14" fill="#fff" />
              <ellipse cx="0" cy="-34" rx="26" ry="14" fill="#ff7a8a" />
            </g>
          </g>
        )}
        <ellipse cx="-150" cy="-66" rx="22" ry="12" fill="#ff8a9a" opacity=".45" />
        <ellipse cx="150" cy="-66" rx="22" ry="12" fill="#ff8a9a" opacity=".45" />
      </g>
    </g>
  )
}

// سيارة صغيرة للبطاقات والشهادة (بلا طفل)
export function MiniCar({ main, dark }) {
  return (
    <svg viewBox="-245 -238 490 250" className="mini-car" aria-hidden="true">
      <Car main={main} dark={dark} mood="happy" kid={false} x={0} y={0} s={1} uid={`mc${main.slice(1)}`} />
    </svg>
  )
}

/* ---------------- السماء والخلفيات ---------------- */
function Sky({ id, tone = 'day' }) {
  const top = tone === 'night' ? '#0d1740' : tone === 'dusk' ? '#ff9a6b' : '#3f9cf2'
  const bot = tone === 'night' ? '#2b3a86' : tone === 'dusk' ? '#ffd9a8' : '#cfeaff'
  return (
    <>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect className="sky" width={W} height={H} fill={`url(#sky-${id})`} />
    </>
  )
}

function Sun({ x = 850, y = 110, r = 52 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="spin-slow">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M-9 -70 L0 -100 L9 -70Z" fill="#ffd23c" transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={r + 6} fill="#ffe58a" opacity=".45" />
      <circle r={r} fill="#ffd93d" />
      <circle cx="-17" cy="-6" r="6" fill="#7a4a12" />
      <circle cx="17" cy="-6" r="6" fill="#7a4a12" />
      <path d="M-18 14 Q0 30 18 14" fill="none" stroke="#7a4a12" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="-30" cy="12" rx="9" ry="6" fill="#ff9d6b" opacity=".6" />
      <ellipse cx="30" cy="12" rx="9" ry="6" fill="#ff9d6b" opacity=".6" />
    </g>
  )
}

function Cloud({ x, y, s = 1, d = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={`cloud d${d}`}>
        <ellipse cx="0" cy="0" rx="70" ry="30" fill="#fff" />
        <ellipse cx="-40" cy="-4" rx="40" ry="26" fill="#fff" />
        <ellipse cx="34" cy="-14" rx="44" ry="30" fill="#fff" />
      </g>
    </g>
  )
}

function Hills({ far = '#9ad973', near = '#6cc55a', y = 430 }) {
  return (
    <>
      <path d={`M0 ${y} Q150 ${y - 90} 320 ${y - 20} Q520 ${y - 110} 700 ${y - 10} Q860 ${y - 70} 1000 ${y - 20} L1000 ${H} L0 ${H}Z`} fill={far} />
      <path d={`M0 ${y + 30} Q220 ${y - 40} 430 ${y + 20} Q650 ${y - 30} 1000 ${y + 30} L1000 ${H} L0 ${H}Z`} fill={near} />
    </>
  )
}

function Road({ moving = true }) {
  return (
    <g>
      <path d="M455 438 L545 438 L1010 734 L-10 734Z" fill="#6c7385" />
      <path d="M455 438 L463 438 L40 734 L-10 734Z" fill="#fff" opacity=".7" />
      <path d="M545 438 L537 438 L960 734 L1010 734Z" fill="#fff" opacity=".7" />
      <path className={moving ? 'road-dash' : ''} d="M500 438 L500 734" stroke="#fff" strokeWidth="14" strokeDasharray="34 30" fill="none" />
    </g>
  )
}

function Tree({ x, y, s = 1, c = '#3fae4e' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y="-10" width="18" height="60" rx="6" fill="#8a5a2b" />
      <circle cx="0" cy="-40" r="46" fill={c} />
      <circle cx="-34" cy="-14" r="32" fill={c} />
      <circle cx="34" cy="-14" r="32" fill={c} />
      <circle cx="-14" cy="-52" r="12" fill="#fff" opacity=".18" />
    </g>
  )
}

function Flower({ x, y, c = '#ff6fa5' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 L0 30" stroke="#3a9a3a" strokeWidth="4" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="0" cy="-10" r="7" fill={c} transform={`rotate(${a})`} />
      ))}
      <circle r="6" fill="#ffd93d" />
    </g>
  )
}

function Bird({ x, y, d = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="bird" style={{ animationDelay: `${d}s` }}>
        <path d="M-20 0 Q-10 -14 0 0 Q10 -14 20 0" fill="none" stroke="#2b3a67" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  )
}

function House({ x, y, s = 1, glow = false, door = true }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-150" y="-170" width="300" height="170" rx="10" fill="#fff3d6" />
      <path d="M-182 -160 L0 -290 L182 -160Z" fill="#d9503f" />
      <path d="M-182 -160 L0 -290 L182 -160" fill="none" stroke="#a83428" strokeWidth="6" strokeLinejoin="round" />
      <rect x="100" y="-290" width="26" height="70" fill="#a83428" />
      <rect x="-110" y="-124" width="64" height="64" rx="8" fill={glow ? '#ffe38a' : '#9fd2ff'} stroke="#8a5a2b" strokeWidth="6" />
      <rect x="46" y="-124" width="64" height="64" rx="8" fill={glow ? '#ffe38a' : '#9fd2ff'} stroke="#8a5a2b" strokeWidth="6" />
      {door && (
        <g>
          <rect x="-36" y="-118" width="72" height="118" rx="10" fill="#8a5a2b" />
          <circle cx="20" cy="-58" r="6" fill="#ffd93d" />
        </g>
      )}
    </g>
  )
}

function Heart({ x, y, d = 0, s = 1 }) {
  return (
    <text className="floatup" x={x} y={y} fontSize={44 * s} textAnchor="middle" style={{ animationDelay: `${d}s` }}>
      ❤️
    </text>
  )
}

/* ---------------- حيوانات ---------------- */
function Cat({ x, y, s = 1, act }) {
  const sleep = act === 'sleep'
  const meow = act === 'meow'
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="90" ry="14" fill="#000" opacity=".18" />
      <g className={act === 'walk' ? 'cat-walk' : meow ? 'hop' : sleep ? 'breathe' : 'bob'}>
        <path className="wag" d="M60 -20 Q130 -30 120 -100 Q118 -130 96 -128" fill="none" stroke="#f3a23c" strokeWidth="22" strokeLinecap="round" />
        <ellipse cx="0" cy="-50" rx="70" ry="56" fill="#f3a23c" />
        <ellipse cx="0" cy="-36" rx="38" ry="38" fill="#ffe3b3" />
        <ellipse cx="-34" cy="-4" rx="24" ry="14" fill="#f3a23c" />
        <ellipse cx="34" cy="-4" rx="24" ry="14" fill="#f3a23c" />
        <path d="M-58 -140 L-46 -190 L-14 -150Z" fill="#f3a23c" />
        <path d="M58 -140 L46 -190 L14 -150Z" fill="#f3a23c" />
        <path d="M-50 -150 L-44 -176 L-28 -154Z" fill="#ff9aa8" />
        <path d="M50 -150 L44 -176 L28 -154Z" fill="#ff9aa8" />
        <circle cx="0" cy="-118" r="60" fill="#f3a23c" />
        <path d="M-14 -176 L-10 -160 M0 -178 L0 -160 M14 -176 L10 -160" stroke="#d9801c" strokeWidth="6" strokeLinecap="round" />
        {sleep ? (
          <g fill="none" stroke="#3a2a1a" strokeWidth="6" strokeLinecap="round">
            <path d="M-36 -122 Q-24 -110 -12 -122" />
            <path d="M12 -122 Q24 -110 36 -122" />
          </g>
        ) : (
          <g>
            <ellipse cx="-24" cy="-122" rx="11" ry="14" fill="#2a1a14" />
            <ellipse cx="24" cy="-122" rx="11" ry="14" fill="#2a1a14" />
            <circle cx="-20" cy="-128" r="4" fill="#fff" />
            <circle cx="28" cy="-128" r="4" fill="#fff" />
          </g>
        )}
        <path d="M-7 -102 L7 -102 L0 -92Z" fill="#ff7a8a" />
        {meow ? (
          <ellipse cx="0" cy="-80" rx="14" ry="12" fill="#7a1022" />
        ) : (
          <path d="M-14 -88 Q0 -74 14 -88" fill="none" stroke="#3a2a1a" strokeWidth="5" strokeLinecap="round" />
        )}
        <g stroke="#3a2a1a" strokeWidth="3" strokeLinecap="round">
          <path d="M-42 -96 L-84 -104 M-42 -88 L-84 -86" />
          <path d="M42 -96 L84 -104 M42 -88 L84 -86" />
        </g>
      </g>
    </g>
  )
}

function Bunny({ x, y, s = 1, happy = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="86" ry="14" fill="#000" opacity=".18" />
      <g className={happy ? 'hop' : 'bob'}>
        <ellipse cx="0" cy="-50" rx="64" ry="54" fill="#fff" />
        <ellipse cx="-30" cy="-6" rx="22" ry="13" fill="#fff" stroke="#e8e8f0" strokeWidth="3" />
        <ellipse cx="30" cy="-6" rx="22" ry="13" fill="#fff" stroke="#e8e8f0" strokeWidth="3" />
        <g className="ear-l">
          <rect x="-52" y="-250" width="34" height="120" rx="17" fill="#fff" stroke="#e8e8f0" strokeWidth="3" />
          <rect x="-44" y="-238" width="18" height="88" rx="9" fill="#ffb3c6" />
        </g>
        <g className="ear-r">
          <rect x="18" y="-250" width="34" height="120" rx="17" fill="#fff" stroke="#e8e8f0" strokeWidth="3" />
          <rect x="26" y="-238" width="18" height="88" rx="9" fill="#ffb3c6" />
        </g>
        <circle cx="0" cy="-116" r="56" fill="#fff" stroke="#e8e8f0" strokeWidth="3" />
        <circle cx="-22" cy="-122" r="10" fill="#2a1a14" />
        <circle cx="22" cy="-122" r="10" fill="#2a1a14" />
        <circle cx="-18" cy="-127" r="3.6" fill="#fff" />
        <circle cx="26" cy="-127" r="3.6" fill="#fff" />
        <ellipse cx="0" cy="-102" rx="9" ry="6" fill="#ff7a9a" />
        <path d="M0 -96 L0 -88 M-14 -82 Q0 -72 14 -82" fill="none" stroke="#7a4a4a" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="-40" cy="-98" rx="13" ry="8" fill="#ffb3c6" opacity=".7" />
        <ellipse cx="40" cy="-98" rx="13" ry="8" fill="#ffb3c6" opacity=".7" />
      </g>
    </g>
  )
}

/* ---------------- الخيارات التي تظهر في المشهد ---------------- */
const ITEM = { carrot: '🥕', apple: '🍎', leaf: '🥬' }

function Confetti() {
  const cols = ['#ff6fa5', '#ffd93d', '#4fc3ff', '#7ee07a', '#ff9a3c', '#b57cff']
  return (
    <g>
      {Array.from({ length: 26 }, (_, i) => (
        <rect
          key={i}
          className="confetti"
          x={(i * 83 + 20) % 980}
          y="-30"
          width="14"
          height="22"
          rx="3"
          fill={cols[i % cols.length]}
          style={{ animationDelay: `${(i % 9) * 0.35}s`, animationDuration: `${3.2 + (i % 5) * 0.5}s` }}
        />
      ))}
    </g>
  )
}

function Balloon({ x, y, c, d = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="balloon" style={{ animationDelay: `${d}s` }}>
        <path d="M0 52 Q-10 100 4 150" fill="none" stroke="#7a8296" strokeWidth="3" />
        <ellipse cx="0" cy="0" rx="36" ry="46" fill={c} />
        <path d="M-6 50 L6 50 L0 60Z" fill={c} />
        <ellipse cx="-12" cy="-16" rx="8" ry="14" fill="#fff" opacity=".35" />
      </g>
    </g>
  )
}

/* ---------------- المشاهد ---------------- */
export function Scene({ kind, color, choice, id = 's', photo, girl, slice = false }) {
  const col = color || COLORS[0]
  const { main, dark } = col
  const car = (p = {}) => <Car main={main} dark={dark} photo={photo} girl={girl} uid={`${id}c`} {...p} />
  let body = null

  switch (kind) {
    case 'road': {
      const dest = choice
      body = (
        <>
          <Sky id={id} />
          <Sun />
          <Cloud x={160} y={110} d={1} />
          <Cloud x={560} y={70} s={0.8} d={2} />
          <Hills y={dest === 'sea' ? 470 : 430} />
          <g key={dest || 'none'} className="pop-in">
            {dest === 'park' && (
              <g>
                <Tree x={90} y={400} s={1.1} />
                <Tree x={210} y={420} s={0.8} c="#52bf5e" />
                <Tree x={900} y={400} s={1.1} />
                <Tree x={790} y={425} s={0.75} c="#52bf5e" />
                <g transform="translate(300 420)">
                  <path d="M0 0 L0 -110 M90 0 L90 -110 M-6 -110 L96 -110" stroke="#8a5a2b" strokeWidth="8" fill="none" />
                  <g className="swing">
                    <path d="M30 -110 L30 -40 M60 -110 L60 -40" stroke="#555" strokeWidth="3" />
                    <rect x="22" y="-40" width="46" height="9" rx="4" fill="#ff9a3c" />
                  </g>
                </g>
                {[[150, 470, '#ff6fa5'], [250, 490, '#ffd93d'], [760, 480, '#ff6fa5'], [880, 470, '#b57cff']].map(([fx, fy, c], i) => (
                  <Flower key={i} x={fx} y={fy} c={c} />
                ))}
                <Bird x={420} y={200} />
                <Bird x={620} y={160} d={0.5} />
              </g>
            )}
            {dest === 'sea' && (
              <g>
                <rect x="0" y="380" width="1000" height="100" fill="#2e9bea" />
                <path className="wave-sea" d="M0 392 Q50 376 100 392 T200 392 T300 392 T400 392 T500 392 T600 392 T700 392 T800 392 T900 392 T1000 392 V430 H0Z" fill="#59b9ff" />
                <path className="wave-sea w2" d="M0 420 Q50 404 100 420 T200 420 T300 420 T400 420 T500 420 T600 420 T700 420 T800 420 T900 420 T1000 420 V470 H0Z" fill="#7acbff" />
                <path d="M0 470 Q300 440 520 470 T1000 470 V540 H0Z" fill="#ffe6a8" />
                <g transform="translate(130 470)">
                  <path d="M0 0 L0 -120" stroke="#8a5a2b" strokeWidth="7" />
                  <path d="M-80 -120 Q0 -190 80 -120Z" fill="#ff6a6a" />
                  <path d="M-27 -120 Q0 -178 -27 -158 M27 -120 Q0 -178 27 -158" fill="none" stroke="#fff" strokeWidth="14" opacity=".9" />
                  <path d="M-80 -120 Q0 -190 80 -120" fill="none" stroke="#c74545" strokeWidth="4" />
                </g>
                <g className="boat">
                  <path d="M780 372 L860 372 L840 400 L800 400Z" fill="#c7503f" />
                  <path d="M820 372 L820 320 L856 366Z" fill="#fff" />
                </g>
                <Bird x={500} y={180} />
              </g>
            )}
            {dest === 'grandma' && (
              <g>
                <House x={830} y={470} s={0.7} glow />
                <path className="smoke" d="M905 270 Q890 245 905 225" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" opacity=".7" />
                <text className="bob" x="826" y="462" fontSize="64" textAnchor="middle">👵</text>
                <Heart x={826} y={400} d={0.3} s={0.9} />
                <Tree x={120} y={420} s={0.9} />
                <Flower x={240} y={480} c="#ffd93d" />
                <Flower x={690} y={480} c="#ff6fa5" />
              </g>
            )}
          </g>
          <Road />
          {car({ cls: 'drive-in' })}
        </>
      )
      break
    }

    case 'cat': {
      const act = choice
      body = (
        <>
          <Sky id={id} />
          <Sun x={140} y={110} />
          <Cloud x={620} y={90} d={1} />
          <Hills y={420} />
          <rect x="0" y="470" width="1000" height="264" fill="#a9acb8" />
          <rect x="0" y="470" width="1000" height="30" fill="#d9dbe3" />
          <path className="road-dash" d="M0 640 L1000 640" stroke="#fff" strokeWidth="12" strokeDasharray="60 44" />
          <Tree x={900} y={400} s={0.9} />
          {car({ x: 300, y: 690, s: 0.78 })}
          <g key={act || 'none'} className="pop-in">
            <Cat x={720} y={690} s={1.05} act={act} />
            {act === 'meow' && (
              <g className="bubble-pop">
                <path d="M760 330 Q760 290 810 290 L900 290 Q950 290 950 330 Q950 370 900 370 L840 370 L800 400 L808 368 Q760 366 760 330Z" fill="#fff" stroke="#f3a23c" strokeWidth="5" />
                <text x="855" y="346" fontSize="42" textAnchor="middle" fill="#d9501f" fontWeight="900">مياو!</text>
              </g>
            )}
            {act === 'sleep' && (
              <g fill="#5b6fd6" fontWeight="900">
                <text className="zz" x="790" y="470" fontSize="54">Z</text>
                <text className="zz z2" x="830" y="440" fontSize="42">z</text>
                <text className="zz z3" x="860" y="410" fontSize="32">z</text>
              </g>
            )}
            {act === 'walk' && (
              <g fontSize="40" opacity=".55">
                <text className="floatup" x="560" y="700">🐾</text>
                <text className="floatup" x="620" y="690" style={{ animationDelay: '.5s' }}>🐾</text>
              </g>
            )}
          </g>
        </>
      )
      break
    }

    case 'bunny': {
      const item = ITEM[choice]
      body = (
        <>
          <Sky id={id} />
          <Sun x={860} y={110} />
          <Cloud x={200} y={100} d={2} />
          <Hills y={410} far="#8fd86a" near="#6cc55a" />
          <rect x="0" y="470" width="1000" height="264" fill="#78cf63" />
          {[[60, 520], [180, 600], [420, 560], [900, 560], [560, 650], [880, 680], [60, 690]].map(([fx, fy], i) => (
            <Flower key={i} x={fx} y={fy} c={['#ff6fa5', '#ffd93d', '#b57cff', '#fff'][i % 4]} />
          ))}
          {car({ x: 290, y: 690, s: 0.78 })}
          <Bunny x={730} y={690} s={1.05} happy={!!item} />
          {!item && (
            <g className="pop-in">
              <circle cx="800" cy="360" r="8" fill="#fff" />
              <circle cx="840" cy="330" r="12" fill="#fff" />
              <ellipse cx="900" cy="270" rx="64" ry="48" fill="#fff" stroke="#cfe0f5" strokeWidth="4" />
              <text x="900" y="290" fontSize="58" textAnchor="middle" fill="#6b7fd6" fontWeight="900">؟</text>
            </g>
          )}
          {item && (
            <g key={choice}>
              <text className="give-item" x="0" y="0" fontSize="96" textAnchor="middle">{item}</text>
              <Heart x={700} y={420} d={1.2} />
              <Heart x={780} y={440} d={1.6} s={0.8} />
            </g>
          )}
        </>
      )
      break
    }

    case 'sad': {
      const a = choice
      body = (
        <>
          <Sky id={id} tone="day" />
          <rect width={W} height={H} fill="#5b6b8a" opacity={a ? 0 : 0.28} />
          <Cloud x={200} y={100} d={1} />
          <Cloud x={760} y={130} s={0.9} d={2} />
          <Hills y={430} far="#86c96a" near="#64b55a" />
          <Road moving={false} />
          {!a && (
            <g>
              <g className="rain-cloud">
                <ellipse cx="500" cy="150" rx="90" ry="34" fill="#7d8ba6" />
                <ellipse cx="450" cy="140" rx="50" ry="30" fill="#7d8ba6" />
                <ellipse cx="548" cy="132" rx="54" ry="32" fill="#7d8ba6" />
              </g>
              {[0, 1, 2, 3, 4].map((i) => (
                <text key={i} className="drop" x={450 + i * 25} y="190" fontSize="26" style={{ animationDelay: `${i * 0.25}s` }}>💧</text>
              ))}
            </g>
          )}
          {!a && (
            <g>
              <circle className="puff" cx="500" cy="380" r="22" fill="#9aa3b5" />
              <circle className="puff p2" cx="520" cy="380" r="16" fill="#aab2c2" />
            </g>
          )}
          {car({ mood: a ? 'happy' : 'sad', rot: a ? 0 : -2, cls: a ? '' : 'slow' })}
          <g key={a || 'none'}>
            {a === 'fix' && (
              <g>
                <text className="wrench" x="740" y="520" fontSize="120" textAnchor="middle">🔧</text>
                <text className="spin-slow" x="270" y="470" fontSize="80" textAnchor="middle" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>⚙️</text>
                <text className="floatup" x="300" y="420" fontSize="50">✨</text>
                <text className="floatup" x="700" y="400" fontSize="50" style={{ animationDelay: '.6s' }}>✨</text>
              </g>
            )}
            {a === 'wash' && (
              <g>
                {[[280, 380], [330, 330], [690, 400], [740, 350], [500, 250], [420, 300], [590, 300]].map(([bx, by], i) => (
                  <circle key={i} className="bubble" cx={bx} cy={by} r={14 + (i % 3) * 8} fill="#fff" opacity=".7" stroke="#8fd0ff" strokeWidth="3" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
                <text className="sponge" x="500" y="480" fontSize="110" textAnchor="middle">🧽</text>
                <text className="floatup" x="250" y="480" fontSize="44">💧</text>
                <text className="floatup" x="760" y="470" fontSize="44" style={{ animationDelay: '.7s' }}>💧</text>
              </g>
            )}
            {a === 'fuel' && (
              <g>
                <text className="bounce" x="820" y="560" fontSize="150" textAnchor="middle">⛽</text>
                <path className="hose" d="M780 520 Q690 560 620 520" fill="none" stroke="#333" strokeWidth="9" strokeLinecap="round" />
                <text className="floatup" x="620" y="470" fontSize="44">💧</text>
                <text className="floatup" x="600" y="470" fontSize="44" style={{ animationDelay: '.5s' }}>💧</text>
              </g>
            )}
          </g>
        </>
      )
      break
    }

    case 'party': {
      const a = choice
      body = (
        <>
          <Sky id={id} />
          <Sun x={140} y={110} />
          <Hills y={430} far="#9ad973" near="#6cc55a" />
          <Road moving={false} />
          <Balloon x={110} y={250} c="#ff6fa5" />
          <Balloon x={190} y={290} c="#ffd93d" d={0.6} />
          <Balloon x={900} y={250} c="#4fc3ff" d={0.3} />
          <Balloon x={820} y={300} c="#7ee07a" d={0.9} />
          <Confetti />
          {car({ cls: a === 'dance' ? 'dance' : 'party', rot: 0 })}
          <g key={a || 'none'} className="pop-in">
            {a === 'sing' && (
              <g fontSize="64" fill="#6b4fd6">
                <text className="floatup" x="180" y="560">🎵</text>
                <text className="floatup" x="260" y="500" style={{ animationDelay: '.5s' }}>🎶</text>
                <text className="floatup" x="800" y="560" style={{ animationDelay: '.3s' }}>🎶</text>
                <text className="floatup" x="860" y="500" style={{ animationDelay: '.9s' }}>🎵</text>
              </g>
            )}
            {a === 'clap' && (
              <g fontSize="120">
                <text className="clap" x="130" y="600" textAnchor="middle">👏</text>
                <text className="clap c2" x="870" y="600" textAnchor="middle">👏</text>
              </g>
            )}
            {a === 'dance' && (
              <g fontSize="120">
                <text className="sway" x="120" y="610" textAnchor="middle">💃</text>
                <text className="sway s2" x="880" y="610" textAnchor="middle">🕺</text>
              </g>
            )}
          </g>
        </>
      )
      break
    }

    case 'home': {
      const who = choice
      const emo = { mama: '👩', papa: '👨', teddy: '🧸' }[who]
      body = (
        <>
          <Sky id={id} tone="dusk" />
          <circle cx="170" cy="230" r="84" fill="#fff3b0" opacity=".85" />
          <circle cx="170" cy="230" r="56" fill="#ffd54a" />
          <Cloud x={620} y={110} d={1} />
          <Hills y={450} far="#7fbf5e" near="#5aa84e" />
          <rect x="0" y="520" width="1000" height="214" fill="#d9c7a3" />
          <House x={650} y={540} s={1.25} glow />
          <Tree x={930} y={480} s={0.9} />
          <g key={who || 'none'} className="pop-in">
            {emo ? (
              <g>
                <text className="wave-emoji" x="650" y="548" fontSize="150" textAnchor="middle">{emo}</text>
                <Heart x={560} y={400} d={0.2} s={1.5} />
                <Heart x={740} y={380} d={0.8} s={1.3} />
                <Heart x={650} y={330} d={1.4} s={1.1} />
              </g>
            ) : (
              <g>
                <ellipse cx="650" cy="350" rx="52" ry="40" fill="#fff" stroke="#f3c9a0" strokeWidth="4" />
                <text x="650" y="370" fontSize="54" textAnchor="middle" fill="#d9801c" fontWeight="900">؟</text>
              </g>
            )}
          </g>
          {car({ x: 270, y: 700, s: 0.82, cls: 'drive-in' })}
        </>
      )
      break
    }

    case 'night': {
      body = (
        <>
          <Sky id={id} tone="night" />
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} className="star" cx={(i * 211 + 40) % 960 + 20} cy={(i * 97) % 380 + 20} r={2 + (i % 3)} fill="#fff6c8" style={{ animationDelay: `${(i % 7) * 0.3}s` }} />
          ))}
          <circle cx="780" cy="170" r="96" fill="#fff3b0" opacity=".25" />
          <circle cx="780" cy="170" r="66" fill="#fff3b0" />
          <circle cx="806" cy="150" r="60" fill="#0d1740" opacity=".0" />
          <g>
            <rect x="0" y="560" width="1000" height="174" fill="#2a2f5e" />
            <rect x="130" y="440" width="560" height="190" rx="26" fill="#8a5a2b" />
            <rect x="110" y="420" width="60" height="230" rx="18" fill="#a06a35" />
            <rect x="150" y="470" width="520" height="130" rx="26" fill="#fff" />
            <ellipse cx="260" cy="470" rx="110" ry="46" fill="#f2f6ff" stroke="#d6e2ff" strokeWidth="4" />
            <Kid cx={258} cy={452} r={62} photo={photo} girl={girl} uid={`${id}k`} sleep />
            <path d="M200 520 Q420 470 670 520 L670 610 L200 610Z" fill="#4f7de0" />
            {[[300, 560], [420, 540], [540, 560], [610, 590], [350, 595]].map(([sx, sy], i) => (
              <text key={i} x={sx} y={sy} fontSize="30" fill="#ffe38a">★</text>
            ))}
            <path d="M200 520 Q420 470 670 520" fill="none" stroke="#7fa3f5" strokeWidth="8" />
          </g>
          <g transform="translate(830 560)">
            <rect x="-70" y="0" width="140" height="18" rx="6" fill="#a06a35" />
            <rect x="-56" y="18" width="112" height="70" rx="6" fill="#8a5a2b" />
          </g>
          <Car main={main} dark={dark} mood="sleep" kid={false} x={830} y={560} s={0.26} uid={`${id}n`} />
          <g fill="#c9d6ff" fontWeight="900">
            <text className="zz" x="330" y="360" fontSize="56">Z</text>
            <text className="zz z2" x="380" y="320" fontSize="44">z</text>
            <text className="zz z3" x="420" y="285" fontSize="34">z</text>
          </g>
        </>
      )
      break
    }

    case 'garage':
    default: {
      body = (
        <>
          <Sky id={id} />
          <Sun />
          <Cloud x={200} y={100} d={1} />
          <Hills y={420} />
          <House x={760} y={470} s={1.1} />
          <rect x="0" y="470" width="1000" height="264" fill="#d9c7a3" />
          {car({ x: 420, y: 680, s: 0.85 })}
        </>
      )
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={slice ? 'xMidYMax slice' : 'xMidYMid meet'} className="scene" role="img" aria-hidden="true">
      {body}
    </svg>
  )
}
