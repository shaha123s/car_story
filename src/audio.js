// موسيقى خلفية وأصوات مولّدة بالكود (Web Audio) — بلا ملفات صوتية وبلا حقوق.
// الموسيقى والمؤثرات لكلٍّ منهما كتم مستقل.
const KEY_MUSIC = 'car-story-music'
const KEY_SFX = 'car-story-sfx'

let ctx = null
let master = null // الموسيقى
let fx = null // قلب الصفحة والنقرات
let timer = null
let nextTime = 0
let step = 0
let musicOff = false
let sfxOff = false
let paused = false
let started = false
let ducked = false

try {
  musicOff = localStorage.getItem(KEY_MUSIC) === 'off'
  sfxOff = localStorage.getItem(KEY_SFX) === 'off'
} catch {
  /* ignore */
}

const hz = (m) => 440 * 2 ** ((m - 69) / 12)

// لحن مرح لرحلة سيارة (دو-صول-لا-فا)، ٨ موازير × ٨ نغمات، سرعة ١١٢ نبضة
const BPM = 112
const EIGHTH = 60 / BPM / 2
const MELODY = [
  [76, -1, 79, 76, 72, -1, 74, 76],
  [74, -1, 79, 74, 71, -1, 74, 79],
  [72, -1, 76, 72, 69, -1, 72, 76],
  [69, -1, 72, 69, 65, -1, 69, 72],
  [76, 79, 76, 72, 74, 76, 79, -1],
  [74, 79, 74, 71, 72, 74, 71, -1],
  [72, 69, 72, 77, 76, 72, 69, -1],
  [74, 71, 74, 67, 72, -1, -1, -1],
]
const ROOTS = [48, 43, 45, 41, 48, 43, 41, 43] // الجهير
const CHORD = [
  [60, 64, 67],
  [59, 62, 67],
  [57, 60, 64],
  [57, 60, 65],
  [60, 64, 67],
  [59, 62, 67],
  [57, 60, 65],
  [59, 62, 67],
]

const ensure = () => {
  if (ctx) return true
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = musicOff ? 0 : 1
  master.connect(ctx.destination)
  fx = ctx.createGain()
  fx.gain.value = sfxOff ? 0 : 1
  fx.connect(ctx.destination)
  return true
}

const tone = (freq, t, dur, vol, type = 'sine', dest = master) => {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(dest)
  o.start(t)
  o.stop(t + dur + 0.05)
}

// نغمة «ماريمبا»: أساسي + نغمة علوية سريعة الخمود
const marimba = (m, t, vol = 0.1) => {
  const f = hz(m)
  tone(f, t, 0.42, vol)
  tone(f * 4, t, 0.09, vol * 0.35)
  tone(f * 2, t, 0.18, vol * 0.25)
}

// جهير «بلك»
const pluck = (m, t, vol = 0.16) => {
  const f = hz(m)
  tone(f, t, 0.34, vol, 'triangle')
  tone(f * 2, t, 0.1, vol * 0.25)
}

let noiseBuf = null
const shaker = (t, vol = 0.03) => {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = 6500
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  s.connect(f)
  f.connect(g)
  g.connect(master)
  s.start(t)
  s.stop(t + 0.08)
}

const schedule = () => {
  if (!ctx || paused) return
  while (nextTime < ctx.currentTime + 0.4) {
    const bar = Math.floor(step / 8) % MELODY.length
    const pos = step % 8
    const n = MELODY[bar][pos]
    if (n >= 0) marimba(n, nextTime, 0.1)
    if (pos === 0) pluck(ROOTS[bar], nextTime)
    if (pos === 4) pluck(ROOTS[bar] + 7, nextTime, 0.11)
    if (pos === 2 || pos === 6) CHORD[bar].forEach((m) => tone(hz(m), nextTime, 0.14, 0.022, 'triangle'))
    if (pos % 2 === 1) shaker(nextTime, 0.026)
    nextTime += EIGHTH
    step += 1
  }
}

const startLoop = () => {
  if (timer || !ctx) return
  nextTime = ctx.currentTime + 0.1
  timer = setInterval(schedule, 120)
}

const stopLoop = () => {
  clearInterval(timer)
  timer = null
}

export const audio = {
  isMuted: () => musicOff, // الموسيقى
  isSfxMuted: () => sfxOff, // المؤثرات
  rawContext: () => ctx,

  // للمؤثرات الصوتية (sfx.js): السياق إن كانت المؤثرات تعمل الآن، وإلا null
  context: () => (ctx && !sfxOff && !paused && ctx.state === 'running' ? ctx : null),

  // يُستدعى من أول لمسة (المتصفح يمنع الصوت قبلها)
  unlock() {
    if (!ensure()) return
    if (ctx.state === 'suspended') ctx.resume()
    if (!started) {
      started = true
      startLoop()
    }
  },

  setMuted(m) {
    musicOff = m
    try {
      localStorage.setItem(KEY_MUSIC, m ? 'off' : 'on')
    } catch {
      /* ignore */
    }
    if (!ctx) return
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(m ? 0 : ducked ? 0.3 : 1, ctx.currentTime, 0.08)
  },

  setSfxMuted(m) {
    sfxOff = m
    try {
      localStorage.setItem(KEY_SFX, m ? 'off' : 'on')
    } catch {
      /* ignore */
    }
    if (!ctx) return
    fx.gain.cancelScheduledValues(ctx.currentTime)
    fx.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05)
  },

  // يخفض الموسيقى أثناء النطق
  duck(on) {
    ducked = on
    if (!ctx || musicOff) return
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(on ? 0.3 : 1, ctx.currentTime, 0.1)
  },

  // نغمة صغيرة عند اختيار بطاقة بلا مؤثر خاص
  pick() {
    if (!ctx || sfxOff || paused || ctx.state !== 'running') return
    const f = hz(88)
    tone(f, ctx.currentTime, 0.5, 0.07, 'sine', fx)
    tone(f * 2, ctx.currentTime, 0.2, 0.03, 'sine', fx)
  },

  // صوت قلب الصفحة: خشخشة ورق قصيرة
  flip() {
    if (!ctx || sfxOff || paused || ctx.state !== 'running') return
    const t = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * 0.35)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let k = 0; k < len; k++) d[k] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 0.9
    f.frequency.setValueAtTime(900, t)
    f.frequency.exponentialRampToValueAtTime(3600, t + 0.3)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.06)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
    src.connect(f)
    f.connect(g)
    g.connect(fx)
    src.start(t)
    tone(1318.5, t + 0.2, 0.25, 0.03, 'sine', fx) // نقرة صغيرة لطيفة عند استقرار الصفحة
  },

  // إيقاف مؤقت (خروج من التبويب / الطباعة)
  pause() {
    paused = true
    stopLoop()
    if (ctx && ctx.state === 'running') ctx.suspend()
  },

  resume() {
    paused = false
    if (!ctx || !started) return
    ctx.resume().then(startLoop)
  },
}
