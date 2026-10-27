// مؤثرات صوتية مولّدة بالكود (Web Audio) — بلا ملفات وبلا حقوق: قطة، سيارة، قرمشة، ماء...
import { audio } from './audio'

// لو وضعتِ ملفاً صوتياً حقيقياً في src/sfx باسم المؤثر (meow.mp3 أو crunchCarrot.mp3 ...) يُستخدم بدل الصوت المولّد
const FILES = import.meta.glob('./sfx/*.{mp3,wav,m4a,ogg}', { eager: true, query: '?url', import: 'default' })
const SAMPLE_URL = {}
for (const [p, u] of Object.entries(FILES)) SAMPLE_URL[p.split('/').pop().replace(/\.[^.]+$/, '')] = u
const SAMPLE_BUF = {}

// ---------- أدوات بناء الأصوات ----------
export function makeBank(ctx, out) {
  let noiseBuf = null
  const noise = () => {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const d = noiseBuf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    const s = ctx.createBufferSource()
    s.buffer = noiseBuf
    s.loop = true
    return s
  }

  const tone = ({ f0, f1 = f0, t = 0, dur = 0.2, type = 'sine', vol = 0.3, a = 0.012, filt, vib }) => {
    const T = ctx.currentTime + t
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(f0, T)
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, T + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, T)
    g.gain.exponentialRampToValueAtTime(vol, T + a)
    g.gain.exponentialRampToValueAtTime(0.0001, T + dur)
    let n = o
    if (filt) {
      const f = ctx.createBiquadFilter()
      f.type = filt.type || 'lowpass'
      f.frequency.value = filt.f
      f.Q.value = filt.q || 1
      o.connect(f)
      n = f
    }
    n.connect(g)
    g.connect(out)
    if (vib) {
      const l = ctx.createOscillator()
      l.frequency.value = vib.rate
      const lg = ctx.createGain()
      lg.gain.value = vib.depth
      l.connect(lg)
      lg.connect(o.frequency)
      l.start(T)
      l.stop(T + dur + 0.05)
    }
    o.start(T)
    o.stop(T + dur + 0.05)
  }

  const burst = ({ t = 0, dur = 0.08, f = 2000, q = 1, type = 'bandpass', vol = 0.3, a = 0.005, sweep, am }) => {
    const T = ctx.currentTime + t
    const s = noise()
    const fl = ctx.createBiquadFilter()
    fl.type = type
    fl.frequency.setValueAtTime(f, T)
    if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, T + dur)
    fl.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, T)
    g.gain.exponentialRampToValueAtTime(vol, T + a)
    g.gain.exponentialRampToValueAtTime(0.0001, T + dur)
    s.connect(fl)
    fl.connect(g)
    g.connect(out)
    if (am) {
      const l = ctx.createOscillator()
      l.frequency.value = am.rate
      const lg = ctx.createGain()
      lg.gain.value = am.depth
      l.connect(lg)
      lg.connect(g.gain)
      l.start(T)
      l.stop(T + dur + 0.05)
    }
    s.start(T)
    s.stop(T + dur + 0.05)
  }

  const swell = ({ t = 0, dur = 1.6, f = 500, vol = 0.25, q = 0.8, type = 'bandpass' }) => {
    const T = ctx.currentTime + t
    const s = noise()
    const fl = ctx.createBiquadFilter()
    fl.type = type
    fl.frequency.value = f
    fl.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, T)
    g.gain.exponentialRampToValueAtTime(vol, T + dur * 0.45)
    g.gain.exponentialRampToValueAtTime(0.0001, T + dur)
    s.connect(fl)
    fl.connect(g)
    g.connect(out)
    s.start(T)
    s.stop(T + dur + 0.05)
  }

  // قضمة: طقطقة + جسم منخفض
  const bite = (t, f, vol) => {
    burst({ t, dur: 0.07, f, q: 0.8, vol })
    burst({ t: t + 0.004, dur: 0.035, f: 4500, type: 'highpass', vol: vol * 0.5 })
    tone({ f0: 170, f1: 90, t, dur: 0.07, type: 'sine', vol: vol * 0.5, a: 0.003 })
  }

  const N = { c: 523.25, d: 587.33, e: 659.25, g: 783.99, a: 880, c2: 1046.5 }

  // ---------- المؤثرات (كل دالة ترجع مدتها بالثواني) ----------
  const fx = {
    // محرك السيارة يبدأ
    engine() {
      tone({ f0: 55, f1: 170, dur: 0.9, type: 'sawtooth', vol: 0.28, a: 0.08, filt: { f: 520, q: 2 }, vib: { rate: 28, depth: 12 } })
      tone({ f0: 110, f1: 340, dur: 0.9, type: 'square', vol: 0.06, a: 0.1, filt: { f: 700 } })
      burst({ dur: 0.9, f: 260, type: 'lowpass', vol: 0.12, a: 0.1 })
      return 0.9
    },
    // زمّور: بيب بيب
    horn() {
      for (let i = 0; i < 2; i++) {
        tone({ f0: 440, t: i * 0.26, dur: 0.2, type: 'square', vol: 0.15, a: 0.01, filt: { f: 2200 } })
        tone({ f0: 554, t: i * 0.26, dur: 0.2, type: 'square', vol: 0.12, a: 0.01, filt: { f: 2200 } })
      }
      return 0.5
    },
    // مواء القطة: «مِي-آو» مرتين (مصدر منشاري + مرنانات صوتية تتحرك)
    meow() {
      const once = (t0, k) => {
        const T = ctx.currentTime + t0
        const dur = 0.8
        const env = ctx.createGain()
        env.gain.setValueAtTime(0.0001, T)
        env.gain.exponentialRampToValueAtTime(0.3, T + 0.06)
        env.gain.setValueAtTime(0.3, T + dur - 0.25)
        env.gain.exponentialRampToValueAtTime(0.0001, T + dur)
        env.connect(out)
        const src = ctx.createGain()
        src.gain.value = 0.5
        const oscs = [0, 8].map((det) => {
          const o = ctx.createOscillator()
          o.type = 'sawtooth'
          o.detune.value = det
          o.frequency.setValueAtTime(430 * k, T)
          o.frequency.linearRampToValueAtTime(770 * k, T + 0.22)
          o.frequency.linearRampToValueAtTime(710 * k, T + 0.4)
          o.frequency.linearRampToValueAtTime(440 * k, T + dur)
          o.connect(src)
          return o
        })
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 6.5
        const lg = ctx.createGain()
        lg.gain.value = 9
        lfo.connect(lg)
        oscs.forEach((o) => lg.connect(o.frequency))
        const formant = (f0, f1, f2, q, gain) => {
          const b = ctx.createBiquadFilter()
          b.type = 'bandpass'
          b.Q.value = q
          b.frequency.setValueAtTime(f0, T)
          b.frequency.linearRampToValueAtTime(f1, T + 0.3)
          b.frequency.linearRampToValueAtTime(f2, T + dur)
          const g = ctx.createGain()
          g.gain.value = gain
          src.connect(b)
          b.connect(g)
          g.connect(env)
        }
        formant(380, 820, 470, 5, 2.2) // F1: «إي» ثم «آو»
        formant(2600, 1500, 950, 6, 1.6) // F2
        formant(3300, 3000, 2700, 7, 0.7) // F3
        ;[...oscs, lfo].forEach((o) => {
          o.start(T)
          o.stop(T + dur + 0.05)
        })
        burst({ t: t0, dur: 0.12, f: 3500, type: 'highpass', vol: 0.05 })
      }
      once(0, 1)
      once(1.0, 1.12)
      return 1.8
    },
    // خطوات خفيفة
    steps() {
      for (let i = 0; i < 6; i++) burst({ t: i * 0.2, dur: 0.07, f: 320, type: 'lowpass', q: 1, vol: 0.62 - (i % 2) * 0.16 })
      return 1.2
    },
    // شخير ناعم
    snore() {
      swell({ dur: 1.2, f: 220, vol: 0.5, type: 'lowpass', q: 1.5 })
      tone({ f0: 95, f1: 80, t: 0.15, dur: 0.9, type: 'sawtooth', vol: 0.14, filt: { f: 240 }, vib: { rate: 24, depth: 8 } })
      swell({ t: 1.3, dur: 1.2, f: 200, vol: 0.4, type: 'lowpass', q: 1.5 })
      return 2.5
    },
    // قفزة أرنب
    boing() {
      tone({ f0: 260, f1: 760, dur: 0.18, type: 'sine', vol: 0.3, a: 0.01 })
      tone({ f0: 760, f1: 380, t: 0.16, dur: 0.2, type: 'sine', vol: 0.22 })
      return 0.4
    },
    // قرمشة جزرة (عالية وحادة): ٥ قضمات
    crunchCarrot() {
      ;[0, 0.12, 0.26, 0.38, 0.52].forEach((t, i) => bite(t, 2400 - i * 120, 0.7))
      fx.boing_soft()
      return 0.8
    },
    // قرمشة تفاحة (أعمق وعصيرية): ٣ قضمات
    crunchApple() {
      ;[0, 0.2, 0.4].forEach((t, i) => {
        bite(t, 1250 - i * 90, 0.85)
        burst({ t: t + 0.03, dur: 0.16, f: 5200, type: 'highpass', vol: 0.12 })
      })
      fx.boing_soft()
      return 0.8
    },
    // خشخشة ورقة خس
    rustle() {
      for (let i = 0; i < 6; i++) burst({ t: i * 0.07, dur: 0.1, f: 5200, type: 'highpass', q: 0.7, vol: 0.05 })
      fx.boing_soft()
      return 0.6
    },
    boing_soft() {
      tone({ f0: 300, f1: 600, t: 0.45, dur: 0.14, type: 'sine', vol: 0.14 })
    },
    // زقزقة عصافير
    birds() {
      const seq = [0, 0.18, 0.5, 0.68, 0.84, 1.15, 1.3]
      seq.forEach((t, i) => tone({ f0: 2400 + (i % 3) * 300, f1: 3600 - (i % 2) * 400, t, dur: 0.11, type: 'sine', vol: 0.12, a: 0.01 }))
      return 1.5
    },
    // أمواج البحر
    waves() {
      swell({ dur: 1.8, f: 700, vol: 0.28, q: 0.6 })
      swell({ t: 1.5, dur: 1.8, f: 600, vol: 0.24, q: 0.6 })
      return 2.4
    },
    // جرس الباب: دينغ دونغ
    doorbell() {
      tone({ f0: 880, dur: 1, type: 'sine', vol: 0.26, a: 0.005 })
      tone({ f0: 1760, dur: 0.5, type: 'sine', vol: 0.06, a: 0.005 })
      tone({ f0: 659, t: 0.55, dur: 1.2, type: 'sine', vol: 0.26, a: 0.005 })
      tone({ f0: 1318, t: 0.55, dur: 0.6, type: 'sine', vol: 0.06, a: 0.005 })
      return 1.2
    },
    // مفتاح إصلاح: طَق طَق معدن
    clink() {
      for (let i = 0; i < 4; i++) {
        tone({ f0: 1900, t: i * 0.17, dur: 0.14, type: 'triangle', vol: 0.2, a: 0.003 })
        tone({ f0: 2870, t: i * 0.17, dur: 0.1, type: 'sine', vol: 0.1, a: 0.003 })
        burst({ t: i * 0.17, dur: 0.03, f: 4000, type: 'highpass', vol: 0.12 })
      }
      return 0.8
    },
    // غسيل: رذاذ وفقاعات
    splash() {
      swell({ dur: 1.1, f: 2400, vol: 0.2, q: 0.5 })
      for (let i = 0; i < 7; i++) tone({ f0: 500 + (i % 3) * 140, f1: 1100 + (i % 4) * 120, t: 0.1 + i * 0.13, dur: 0.07, type: 'sine', vol: 0.12, a: 0.005 })
      return 1.1
    },
    // تعبئة وقود: قرقرة ثم دينغ
    fuel() {
      burst({ dur: 1.1, f: 350, type: 'lowpass', q: 1.2, vol: 0.28, a: 0.1, am: { rate: 13, depth: 0.12 } })
      tone({ f0: 1318, t: 1.1, dur: 0.4, type: 'sine', vol: 0.22, a: 0.004 })
      return 1.4
    },
    // سيارة حزينة: ووا-ووا-وووا
    sad() {
      const f = { f: 700, q: 2 }
      tone({ f0: 330, f1: 310, dur: 0.38, type: 'sawtooth', vol: 0.22, filt: f, vib: { rate: 5, depth: 6 } })
      tone({ f0: 310, f1: 290, t: 0.42, dur: 0.38, type: 'sawtooth', vol: 0.22, filt: f, vib: { rate: 5, depth: 6 } })
      tone({ f0: 290, f1: 200, t: 0.84, dur: 0.8, type: 'sawtooth', vol: 0.22, filt: f, vib: { rate: 5, depth: 8 } })
      return 1.6
    },
    // فرحة: سلّم صاعد
    yay() {
      ;[N.c, N.e, N.g, N.c2].forEach((f, i) => tone({ f0: f, t: i * 0.11, dur: 0.35, type: 'triangle', vol: 0.22, a: 0.01 }))
      tone({ f0: N.c2, t: 0.45, dur: 0.6, type: 'sine', vol: 0.1 })
      return 1
    },
    // غناء: لا لا لا
    sing() {
      ;[N.e, N.g, N.a, N.g, N.e, N.d, N.c].forEach((f, i) =>
        tone({ f0: f, t: i * 0.27, dur: 0.3, type: 'triangle', vol: 0.24, a: 0.03, vib: { rate: 5.5, depth: 6 } })
      )
      return 1.9
    },
    // تصفيق
    clap() {
      for (let i = 0; i < 6; i++) {
        burst({ t: i * 0.2, dur: 0.07, f: 1500, q: 0.7, vol: 0.34 })
        burst({ t: i * 0.2 + 0.015, dur: 0.05, f: 3200, q: 0.9, vol: 0.18 })
      }
      return 1.2
    },
    // رقص: طبل وصنج
    dance() {
      for (let i = 0; i < 8; i++) {
        const t = i * 0.2
        if (i % 2 === 0) tone({ f0: 160, f1: 50, t, dur: 0.18, type: 'sine', vol: 0.4, a: 0.004 })
        else burst({ t, dur: 0.12, f: 1800, q: 0.8, vol: 0.2 })
        burst({ t: t + 0.1, dur: 0.04, f: 7000, type: 'highpass', vol: 0.08 })
      }
      return 1.6
    },
    // حضن: نغمات دافئة
    chime() {
      ;[N.c, N.g, N.c2].forEach((f, i) => tone({ f0: f * 0.8, t: i * 0.16, dur: 0.7, type: 'sine', vol: 0.2, a: 0.01 }))
      return 0.8
    },
    chimeLow() {
      ;[N.c / 2, N.g / 2, N.c].forEach((f, i) => tone({ f0: f * 0.9, t: i * 0.16, dur: 0.8, type: 'sine', vol: 0.24, a: 0.01 }))
      return 0.8
    },
    // دبدوب: صوت صرير لعبة
    squeak() {
      for (let i = 0; i < 2; i++) tone({ f0: 900, f1: 1500, t: i * 0.22, dur: 0.14, type: 'sine', vol: 0.2, a: 0.01, vib: { rate: 30, depth: 40 } })
      return 0.5
    },
  }
  return fx
}

// ---------- ربط الأصوات بصفحات القصة ----------
const CHOICE = {
  'p1-red': 'engine', 'p1-blue': 'engine', 'p1-yellow': 'engine', 'p1-green': 'engine',
  'p2-park': 'birds', 'p2-sea': 'waves', 'p2-grandma': 'doorbell',
  'p3-meow': 'meow', 'p3-walk': 'steps', 'p3-sleep': 'snore',
  'p4-carrot': 'crunchCarrot', 'p4-apple': 'crunchApple', 'p4-leaf': 'rustle',
  'p5-fix': 'clink', 'p5-wash': 'splash', 'p5-fuel': 'fuel',
  'p6-sing': 'sing', 'p6-clap': 'clap', 'p6-dance': 'dance',
  'p7-mama': 'chime', 'p7-papa': 'chimeLow', 'p7-teddy': 'squeak',
}
// عند وصول الصفحة
const ENTER = { p2: 'engine', p5: 'sad', p6: 'yay', p7: 'horn', p8: 'snore' }
// عند لمس الصورة
const TAP = { p1: 'horn', p2: 'horn', p3: 'meow', p4: 'boing', p5: 'sad', p6: 'yay', p7: 'doorbell', p8: 'snore' }

let bank = null
let bankCtx = null
let out = null
const loadSamples = (ctx) => {
  Object.entries(SAMPLE_URL).forEach(async ([name, url]) => {
    if (SAMPLE_BUF[name] || SAMPLE_BUF[`!${name}`]) return
    SAMPLE_BUF[`!${name}`] = true
    try {
      const r = await fetch(url)
      SAMPLE_BUF[name] = await ctx.decodeAudioData(await r.arrayBuffer())
    } catch {
      /* نبقى على الصوت المولّد */
    }
  })
}

const run = (name) => {
  const ctx = audio.context()
  if (!ctx || !name) return 0
  if (bankCtx !== ctx) {
    out = ctx.createGain()
    out.gain.value = 1.4
    out.connect(ctx.destination)
    bank = makeBank(ctx, out)
    bankCtx = ctx
  }
  loadSamples(ctx)
  const buf = SAMPLE_BUF[name]
  if (buf) {
    const s = ctx.createBufferSource()
    s.buffer = buf
    s.connect(out)
    s.start()
    return buf.duration
  }
  try {
    return bank[name]?.() || 0
  } catch {
    return 0
  }
}

export const sfx = {
  choice: (page, id) => run(CHOICE[`${page}-${id}`]),
  enter: (page) => run(ENTER[page]),
  tap: (page, id) => run(CHOICE[`${page}-${id}`] || TAP[page]),
  play: run,
  // تحميل الملفات الصوتية مسبقاً بعد أول لمسة
  preload: () => {
    const c = audio.rawContext()
    if (c) loadSamples(c)
  },
}
