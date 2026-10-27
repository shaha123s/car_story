import { useEffect, useMemo, useRef, useState } from 'react'
import { audio } from './audio'
import { wait, unlockSpeech } from './speech'
import { sayLine, sayLabel, stopVoice as stop, unlockClips } from './voice'
import NameVoice from './NameVoice'
import { sfx } from './sfx'
import { COLORS, CHAPTERS, ENDING, fill } from './story'
import { Scene, Kid, MiniCar } from './scenes'
import coverImg from './cover.webp'
import './App.css'

// يصغّر الصورة ويقصّها مربعة على الجهاز نفسه (لا تُرفع لأي مكان)
async function toAvatar(file) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const s = Math.min(bmp.width, bmp.height)
    const c = document.createElement('canvas')
    c.width = c.height = 256
    c.getContext('2d').drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 256, 256)
    return c.toDataURL('image/jpeg', 0.85)
  } catch {
    return new Promise((res) => {
      const r = new FileReader()
      r.onload = () => res(String(r.result))
      r.onerror = () => res('')
      r.readAsDataURL(file)
    })
  }
}

// شاشة الإدخال (اسم/صورة/لون) ثم صفحات الكتاب: cover → ch(c1…) → end → cert
const FIRST = [{ type: 'cover' }]

// غلاف الكتاب: لوحة جاهزة + اسم الطفل في الغيمة + صورته (أو وجه افتراضي) مكان الوجه الفارغ
const COVER_W = 1055
const COVER_H = 1771
function CoverArt({ uid, name, girl, photo }) {
  const n = name || ''
  const w = n.length * 0.56 // عرض تقريبي بوحدة حجم الخط
  const fs = w * 132 > 540 ? Math.max(60, Math.floor(540 / w)) : 132
  const fit = w * fs > 560 ? { textLength: 560, lengthAdjust: 'spacingAndGlyphs' } : {}
  return (
    <svg viewBox={`0 0 ${COVER_W} ${COVER_H}`} preserveAspectRatio="xMidYMid slice" className="cover-svg" role="img" aria-label={`غلاف قصة ${n} وسيارته الصغيرة`}>
      <defs>
        <clipPath id={`cv-face-${uid}`}>
          <ellipse cx="446" cy="823" rx="95" ry="94" />
        </clipPath>
      </defs>
      <image href={coverImg} x="0" y="0" width={COVER_W} height={COVER_H} preserveAspectRatio="none" />
      <text x="537" y="468" textAnchor="middle" className="cover-name" fontSize={fs} {...fit}>
        {n}
      </text>
      <g clipPath={`url(#cv-face-${uid})`}>
        <rect x="340" y="720" width="212" height="210" fill="#f8d2ae" />
        <Kid cx={446} cy={823} r={98} photo={photo} girl={girl} uid={`cv${uid}`} />
      </g>
    </svg>
  )
}

function Certificate({ name, girl, color, photo }) {
  const date = new Date().toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="cert">
      <p className="cert-top">شهادة</p>
      <h2>{girl ? 'سائقة ماهرة' : 'سائق ماهر'}</h2>
      {photo ? <img className="cert-photo" src={photo} alt="" /> : <MiniCar main={color.main} dark={color.dark} />}
      <p className="cert-text">تُمنح هذه الشهادة إلى</p>
      <p className="cert-name">{name}</p>
      <p className="cert-text">
        لأنه{girl ? 'ا' : ''} اعتنى{girl ? 'ت' : ''} بسيارته{girl ? 'ا' : ''} الصغيرة وعاد{girl ? 'ت' : ''} إلى البيت {girl ? 'سالمة' : 'سالماً'}
      </p>
      <p className="cert-date">{date}</p>
    </div>
  )
}

function PrintBook({ info, visited }) {
  const { name, girl, color, photo } = info
  const ctx = { name, girl, color: color.name }
  return (
    <div className="print-book">
      <section className="print-page cover">
        <CoverArt uid="pr" name={name} girl={girl} photo={photo} />
      </section>
      {visited.map((v, i) => {
        const ch = CHAPTERS[v.id]
        return (
          <section className="print-page" key={v.id}>
            <ChapterArt real={findReal(v.id, v.pick && { id: v.pick })} scene={ch.scene} color={color} choice={v.pick} photo={photo} girl={girl} uid={`pp${i}`} />
            {ch.text.map((t, k) => (
              <p key={k}>{fill(t, ctx)}</p>
            ))}
            {v.choice && (
              <p className="picked">
                اختار{girl ? 'ت' : ''} {name}: {v.choice}
              </p>
            )}
          </section>
        )
      })}
      <section className="print-page">
        <ChapterArt real={findReal('p8')} scene="night" color={color} photo={photo} girl={girl} uid="pe" />
        {ENDING.map((t, k) => (
          <p key={k}>{fill(t, ctx)}</p>
        ))}
      </section>
      <section className="print-page cert-page">
        <Certificate name={name} girl={girl} color={color} photo={photo} />
      </section>
    </div>
  )
}

/* ---------- صفحة الكتاب (وجهان: الأمامي والخلفي) ---------- */
function Page({ index, cur, children, cover = false }) {
  const state = index < cur ? 'turned' : index === cur ? 'current' : 'next'
  const depth = index - cur // لإظهار حافة الأوراق التالية
  return (
    <div
      className={`page ${state}${cover ? ' is-cover' : ''}`}
      style={{ zIndex: state === 'turned' ? 20 + index : state === 'current' ? 15 : 10 - Math.min(depth, 5), '--depth': Math.min(depth, 3) }}
      aria-hidden={state !== 'current'}
      inert={state !== 'current'}
    >
      <div className="face front">
        <div className="inner">{children}</div>
        <span className="spine" aria-hidden="true" />
      </div>
      <div className="face back" aria-hidden="true" />
    </div>
  )
}


/* ---------- شاشة الفصل: صورة + بطاقة نص + اقرأ لي + خيارات بصور + شريط التقدم ---------- */
const TOTAL = Object.keys(CHAPTERS).length + 1 // صفحات القصة (٨)
const SCENES = import.meta.glob('./scenes/*.webp', { eager: true, query: '?url', import: 'default' })
const FACES = Object.values(import.meta.glob('./scenes/faces.json', { eager: true, import: 'default' }))[0] || {}

// صورة الصفحة: لوحة حقيقية من src/scenes (١٠٠٠×٧٣٤) إن وُجدت، وإلا الرسم البرمجي
// الأسماء: p1-green.webp … (لكل اختيار)، وp8.webp للصفحة الأخيرة؛ وp{n}.webp صورة عامة للصفحة قبل الاختيار
const findReal = (pageId, chosen) => {
  // قبل الاختيار نعرض صورة الخيار الأول إن لم توجد صورة عامة للصفحة
  const first = CHAPTERS[pageId]?.choices?.[0]
  const keys = chosen ? [`${pageId}-${chosen.id}`, pageId] : [pageId, first && `${pageId}-${first.id}`].filter(Boolean)
  for (const k of keys) if (SCENES[`./scenes/${k}.webp`]) return { src: SCENES[`./scenes/${k}.webp`], key: k }
  return null
}

function ChapterArt({ real, scene, color, photo, uid, choice, girl }) {
  if (!real) return <Scene kind={scene} color={color} choice={choice} id={uid} photo={photo} girl={girl} slice />
  const f = FACES[real.key]
  return (
    <svg viewBox="0 0 1000 734" preserveAspectRatio="xMidYMid slice" className="scene real" aria-hidden="true">
      <image href={real.src} x="0" y="0" width="1000" height="734" />
      {f && (
        <>
          <clipPath id={`fc-${uid}`}>
            <ellipse cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry} />
          </clipPath>
          <g clipPath={`url(#fc-${uid})`}>
            {photo ? (
              <image href={photo} x={f.cx - f.rx} y={f.cy - f.ry} width={f.rx * 2} height={f.ry * 2} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <>
                <rect x={f.cx - f.rx} y={f.cy - f.ry} width={f.rx * 2} height={f.ry * 2} fill="#f8d2ae" />
                <Kid cx={f.cx} cy={f.cy} r={f.rx + 3} girl={girl} uid={`fk${uid}`} />
              </>
            )}
          </g>
        </>
      )}
    </svg>
  )
}

// يفصل الإيموجي الأخير في نص الخيار ليظهر كبيراً فوق النص
const splitEmoji = (label) => {
  const m = label.match(/^(.*?)\s*([\p{Extended_Pictographic}][\p{Extended_Pictographic}️‍]*)\s*$/u)
  return m ? { text: m[1], emo: m[2] } : { text: label, emo: '⭐' }
}

function ChapterScreen({ k, uid, pageId, scene, lines, choices, ask, picked, onNext, info, color, stars, current, muted, sfxOff, onPick, onSound, onSfx, onBack, onEdit }) {
  const startSel = choices && picked ? choices.findIndex((c) => c.id === picked.id) : -1
  const [sel, setSel] = useState(startSel)
  const [reading, setReading] = useState(false)
  const [note, setNote] = useState('')
  const [shake, setShake] = useState(false)
  const tok = useRef(0)
  const chosen = choices && sel >= 0 ? choices[sel] : null
  const real = findReal(pageId, chosen)

  const read = async () => {
    if (reading) {
      tok.current++
      stop()
      audio.duck(false)
      setReading(false)
      return
    }
    const my = ++tok.current
    setNote('')
    setReading(true)
    audio.duck(true)
    for (const l of ask ? [...lines, ask] : lines) {
      if (tok.current !== my) return
      await sayLine(l, info.name, { ask: !!ask && l === ask })
      await wait(200)
    }
    if (tok.current === my) {
      setReading(false)
      audio.duck(false)
    }
  }

  // عند وصول الصفحة تُقرأ تلقائياً بعد أن تستقر، وعند مغادرتها تتوقف القراءة
  useEffect(() => {
    if (!current) {
      tok.current++
      setReading(false)
      return undefined
    }
    // مؤثر وصول الصفحة (محرك، حزن...) ثم تبدأ القراءة بعده
    let id2
    const id = setTimeout(() => {
      const d = sfx.enter(pageId)
      id2 = setTimeout(read, d ? Math.min(d, 1.6) * 1000 : 500)
    }, 600)
    return () => {
      clearTimeout(id)
      clearTimeout(id2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])
  useEffect(() => () => { tok.current++ }, [])

  // اختيار الطفل: يتغيّر المشهد فوراً وتُنطق كلمة الاختيار، ثم يضغط «التالي»
  const choose = (c, n) => {
    const my = ++tok.current
    stop()
    setReading(false)
    const d = sfx.choice(pageId, c.id) // صوت الخيار: مواء، قرمشة، ماء...
    if (!d) audio.pick()
    audio.duck(true)
    setTimeout(() => {
      if (tok.current !== my) return
      sayLabel(c.label).then(() => audio.duck(false))
    }, Math.min(d, 0.9) * 1000)
    onPick(k, c)
    setSel(n)
  }

  // لمس الصورة: زمّور أو صوت المشهد
  const tapArt = () => {
    audio.unlock()
    sfx.tap(pageId, chosen?.id)
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  return (
    <div className="ch">
      <div className="topbar">
        <button type="button" className="round-btn" onClick={onEdit} aria-label="الرئيسية">🏠</button>
        <span className="pill title-pill">★ {pageId === 'p8' ? 'الصفحة الأخيرة' : `الصفحة ${k}`} ★</span>
        <span className="round-btn stars-circle" aria-label={`${stars} من 3 نجوم`}>
          ⭐<b>{stars}</b>
        </span>
      </div>
      <div className={`art-wrap${shake ? ' shake' : ''}`} onClick={tapArt}>
        <ChapterArt real={real} scene={scene} color={color} choice={chosen?.id} photo={info.photo} girl={info.girl} uid={uid} />
      </div>
      <div className="ch-scroll">
        <div className="text card-text">
          {lines.map((t, n) => (
            <p key={n} style={{ '--k': n }}>{t}</p>
          ))}
        </div>
        <button type="button" className="read-btn" onClick={read}>
          {reading ? '⏹ إيقاف' : '🔊 اقرأ لي'}
        </button>
        {note && <p className="hint">{note}</p>}
        {choices && (
          <>
            <p className="ask">{ask}</p>
            <div className={`cards3${choices.length > 4 ? ' many' : ''}`} style={{ '--n': Math.min(choices.length, 4) }}>
              {choices.map((c, n) => {
                const col = c.color && COLORS.find((x) => x.id === c.color)
                return (
                  <button key={c.id} type="button" className={`cardc ${col ? `col-${col.id}` : `c${n % 3}`}${sel === n ? ' sel' : ''}`} onClick={() => choose(c, n)}>
                    {col ? <MiniCar main={col.main} dark={col.dark} /> : <span className="emo" aria-hidden="true">{c.emo}</span>}
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
      {(!choices || chosen) && (
        <div className="go-wrap">
          <button type="button" className="go-btn" onClick={() => onNext(chosen)}>
            {choices ? 'التالي ←' : 'احصل على شهادتك 🏅'}
          </button>
        </div>
      )}
      <div className="botbar">
        <button type="button" className="edit-btn" onClick={onBack} aria-label="رجوع">→ رجوع</button>
        <div className="prog">
          <span className="count"><span aria-hidden="true">🚗</span> {k} / {TOTAL}</span>
          <span className="dots" aria-hidden="true">
            {Array.from({ length: TOTAL }, (_, n) => (
              <i key={n} className={n + 1 < k ? 'done' : n + 1 === k ? 'cur' : ''} />
            ))}
          </span>
        </div>
        <div className="snd-group">
          <button type="button" className="snd" onClick={onSound} aria-pressed={!muted} aria-label={muted ? 'تشغيل الموسيقى' : 'كتم الموسيقى'}>
            {muted ? '🎵' : '🎵'}
            {muted && <i className="strike" aria-hidden="true" />}
          </button>
          <button type="button" className="snd" onClick={onSfx} aria-pressed={!sfxOff} aria-label={sfxOff ? 'تشغيل المؤثرات' : 'كتم المؤثرات'}>
            🔔
            {sfxOff && <i className="strike" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [name, setName] = useState('')
  const [girl, setGirl] = useState(false)
  const [colorId, setColorId] = useState('red')
  const [photo, setPhoto] = useState('')
  const [pages, setPages] = useState(FIRST)
  const [i, setI] = useState(0)
  const [err, setErr] = useState('')
  const [stage, setStage] = useState('setup') // setup = إدخال البيانات، book = الكتاب
  const [muted, setMuted] = useState(audio.isMuted())
  const [sfxOff, setSfxOff] = useState(audio.isSfxMuted())
  const fileRef = useRef(null)
  const touch = useRef(null)

  const color = COLORS.find((c) => c.id === colorId)
  const info = useMemo(() => ({ name: name.trim(), girl, color, photo }), [name, girl, color, photo])
  const ctx = { name: info.name, girl, color: color.name }
  const seen = pages.slice(0, i + 1)
  const visited = seen.filter((p) => p.type === 'ch').map((p) => ({ id: p.id, choice: p.picked?.label, pick: p.picked?.id }))
  const cur = pages[i]

  // صوت قلب الصفحة عند كل انتقال
  const prevI = useRef(i)
  useEffect(() => {
    if (prevI.current !== i) {
      stop()
      audio.flip()
    }
    prevI.current = i
  }, [i])

  // إيقاف الصوت عند مغادرة التبويب أو الطباعة
  useEffect(() => {
    const hide = () => (document.hidden ? audio.pause() : audio.resume())
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('beforeprint', audio.pause)
    window.addEventListener('afterprint', audio.resume)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('beforeprint', audio.pause)
      window.removeEventListener('afterprint', audio.resume)
    }
  }, [])

  const toggleSound = () => {
    audio.unlock()
    audio.setMuted(!muted)
    setMuted(!muted)
  }
  const toggleSfx = () => {
    audio.unlock()
    audio.setSfxMuted(!sfxOff)
    setSfxOff(!sfxOff)
  }

  // يضيف صفحة جديدة بعد الحالية ويقلبها
  const push = (page, picked) => {
    setPages((ps) => {
      const base = ps.slice(0, i + 1).map((p, k) => (k === i && picked ? { ...p, picked } : p))
      return [...base, page]
    })
    setI(i + 1)
  }

  const goBack = () => i > 0 && setI(i - 1)
  const open = () => push({ type: 'ch', id: 'p1' })
  // اختيار الطفل في الصفحة k: نسجّله ونغيّر لون السيارة إن كان الاختيار لوناً
  const pick = (k, c) => {
    if (c.color) setColorId(c.color)
    setPages((ps) => ps.map((p, n) => (n === k ? { ...p, picked: c } : p)))
  }
  const begin = () => {
    if (!name.trim()) return setErr('اكتب اسم الطفل أولاً.')
    setErr('')
    audio.unlock()
    sfx.preload()
    unlockSpeech()
    unlockClips()
    setPages(FIRST)
    setI(0)
    setStage('book')
  }
  const editSetup = () => {
    setPages(FIRST)
    setI(0)
    setStage('setup')
  }
  const next = (to, picked) => push(to === 'end' ? { type: 'end' } : { type: 'ch', id: to }, picked)
  const restart = editSetup

  // سحب الإصبع: يميناً = الصفحة التالية (للصفحات التي بلا خيارات)، يساراً = رجوع
  const onDown = (e) => {
    audio.unlock()
    touch.current = { x: e.clientX, y: e.clientY }
  }
  const onUp = (e) => {
    const t = touch.current
    touch.current = null
    if (!t || e.target.closest('input,button,a,label')) return
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) return goBack()
    if (cur.type === 'cover') open()
    else if (cur.type === 'ch' && cur.picked) next(cur.picked.next, cur.picked)
    else if (cur.type === 'end') push({ type: 'cert' })
  }

  const style = stage === 'setup' ? { '--c': '#2f7df0', '--cd': '#1b4fb8' } : { '--c': color.main, '--cd': color.dark }

  const renderPage = (p, k) => {
    if (p.type === 'cover')
      return (
        <>
          <button type="button" className="cover-btn" onClick={open} aria-label="افتح الكتاب">
            <CoverArt uid="sc" name={info.name} girl={girl} photo={photo} />
            <span className="cover-hint">اضغط على الغلاف لفتح الكتاب</span>
          </button>
          <button type="button" className="cover-edit" onClick={editSetup}>✎ تعديل</button>
        </>
      )

    if (p.type === 'form')
      return (
        <div className="scroll form">
          <h2 className="h2">من هو بطل القصة؟</h2>
          <label className="label" htmlFor="nm">اسم الطفل</label>
          <input id="nm" className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: سامر" />
          <NameVoice name={name} />
          <p className="label">صورة الطفل (اختيارية)</p>
          <div className="photo-row">
            {photo ? <img className="photo-prev" src={photo} alt="صورة الطفل" /> : <div className="photo-prev empty" aria-hidden="true">🧒</div>}
            <div className="photo-actions">
              <button type="button" className="chip" onClick={() => fileRef.current?.click()}>
                {photo ? 'تغيير الصورة' : '📷 اختر صورة'}
              </button>
              {photo && (
                <button type="button" className="link" onClick={() => setPhoto('')}>
                  إزالة
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="file"
              aria-label="اختيار صورة الطفل"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) setPhoto(await toAvatar(f))
                e.target.value = ''
              }}
            />
          </div>
          <p className="hint">الصورة تبقى على جهازك فقط ولا تُرفع لأي مكان.</p>
          <p className="label">هل هو</p>
          <div className="row">
            <button type="button" className="chip" aria-pressed={!girl} onClick={() => setGirl(false)}>ولد</button>
            <button type="button" className="chip" aria-pressed={girl} onClick={() => setGirl(true)}>بنت</button>
          </div>
          {err && <p className="error" role="alert">{err}</p>}
          <button type="button" className="btn" onClick={begin}>ابدأ القصة 🚗</button>
        </div>
      )

    if (p.type === 'ch' || p.type === 'end') {
      const isEnd = p.type === 'end'
      const ch = isEnd ? null : CHAPTERS[p.id]
      const lines = (isEnd ? ENDING : ch.text).map((x) => fill(x, ctx))
      const nPicks = seen.filter((x) => x.picked).length
      return (
        <ChapterScreen
          k={k}
          uid={`s${k}`}
          pageId={isEnd ? 'p8' : p.id}
          scene={isEnd ? 'night' : ch.scene}
          lines={lines}
          choices={ch?.choices}
          ask={ch?.ask ? fill(ch.ask, ctx) : ''}
          picked={p.picked}
          onNext={(c) => (isEnd ? push({ type: 'cert' }) : next(c.next, c))}
          onPick={pick}
          info={info}
          color={color}
          stars={nPicks >= 6 ? 3 : nPicks >= 3 ? 2 : nPicks >= 1 ? 1 : 0}
          current={k === i}
          muted={muted}
          sfxOff={sfxOff}
          onSound={toggleSound}
          onSfx={toggleSfx}
          onBack={goBack}
          onEdit={editSetup}
        />
      )
    }

    // cert
    return (
      <div className="scroll center">
        <button type="button" className="nav-back" onClick={goBack} aria-label="رجوع">←</button>
        <Certificate name={info.name} girl={girl} color={color} photo={photo} />
        <button type="button" className="btn" onClick={() => window.print()}>
          🖨️ طباعة القصة والشهادة / حفظ PDF
        </button>
        <p className="hint">في نافذة الطباعة اختر «حفظ كملف PDF» ليُحفظ الكتاب كاملاً، أو اختر الطابعة لطباعته على الورق.</p>
        <button type="button" className="link" onClick={restart}>قصة جديدة</button>
      </div>
    )
  }

  const soundBtn = (
    <div className="sound-group">
      <button type="button" className="sound-btn" onClick={toggleSound} aria-label={muted ? 'تشغيل الموسيقى' : 'كتم الموسيقى'} title="الموسيقى">
        🎵{muted && <i className="strike" aria-hidden="true" />}
      </button>
      <button type="button" className="sound-btn" onClick={toggleSfx} aria-label={sfxOff ? 'تشغيل المؤثرات' : 'كتم المؤثرات'} title="المؤثرات">
        🔔{sfxOff && <i className="strike" aria-hidden="true" />}
      </button>
    </div>
  )

  if (stage === 'setup')
    return (
      <main className="app" style={style}>
        <div className="book">
          <Page index={0} cur={0}>
            {renderPage({ type: 'form' }, 0)}
          </Page>
        </div>
        {soundBtn}
      </main>
    )

  return (
    <>
      <main className="app" style={style}>
        <div className="book" onPointerDown={onDown} onPointerUp={onUp} data-index={i}>
          {pages.map((p, k) => (
            <Page key={`${k}-${p.type}-${p.id || ''}`} index={k} cur={i} cover={p.type === 'cover'}>
              {renderPage(p, k)}
            </Page>
          ))}
        </div>
        {cur.type !== 'ch' && cur.type !== 'end' && soundBtn}
      </main>
      {(cur.type === 'end' || cur.type === 'cert') && <PrintBook info={info} visited={visited} />}
    </>
  )
}
