// الصوت: ملفات مسجّلة بصوت صاحبة القصة، واسم الطفل من (1) أسماء مسجّلة جاهزة، (2) تسجيل الأهل، (3) صوت الجهاز.
import { speak, stop as stopTts } from './speech'

// ---------- توحيد الكتابة: أ/ا/إ، ة/ه، ى/ي، بلا تشكيل ولا علامات ----------
export const norm = (s = '') =>
  s
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[!؟?.,،:؛"'()«»…\-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

// true = صوتك المسجّل وتسجيل الأهل، false = صوت الجهاز فقط (كما كان قبل التسجيلات)
export const USE_CLIPS = false

// ---------- الملفات المرفقة مع الكتاب (src/voice) ----------
const URLS = import.meta.glob('./voice/*.mp3', { eager: true, query: '?url', import: 'default' })
const MAPS = import.meta.glob('./voice/*.json', { eager: true, import: 'default' })
const urlOf = (f) => URLS[`./voice/${f}`]
const build = (obj) => {
  const out = {}
  for (const [k, f] of Object.entries(obj || {})) {
    const u = urlOf(f)
    if (u) out[norm(k)] = u
  }
  return out
}
const CLIPS = USE_CLIPS ? build(MAPS['./voice/map.json']) : {} // جمل وأسئلة وكلمات الاختيار
const NAME_CLIPS = USE_CLIPS ? build(MAPS['./voice/names.json']) : {} // أسماء مسجّلة جاهزة

export const hasBundledName = (name) => !!NAME_CLIPS[norm(name)]

// ---------- تسجيل الأهل لاسم الطفل (يُحفظ على الجهاز فقط) ----------
const KEY = 'space-story-name-voice'
const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {}
  } catch {
    return {}
  }
}
const parentClip = (name) => (USE_CLIPS ? readStore()[norm(name)] || null : null)
export const hasParentClip = (name) => !!parentClip(name)
export const clearParentClip = (name) => {
  try {
    const s = readStore()
    delete s[norm(name)]
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}
const saveParentClip = (name, data) => {
  try {
    const s = readStore()
    s[norm(name)] = data
    const keys = Object.keys(s)
    while (keys.length > 6) delete s[keys.shift()] // نحتفظ بآخر ٦ أسماء فقط
    localStorage.setItem(KEY, JSON.stringify(s))
    return true
  } catch {
    return false
  }
}

const toDataUrl = (blob) =>
  new Promise((res) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = () => res('')
    r.readAsDataURL(blob)
  })

// يقصّ الصمت من بداية التسجيل ونهايته ويحوّله إلى WAV أحادي صغير يعمل في كل المتصفحات
async function toTrimmedWav(blob) {
  const AC = window.AudioContext || window.webkitAudioContext
  const ctx = new AC()
  const buf = await blob.arrayBuffer()
  const ab = await new Promise((res, rej) => ctx.decodeAudioData(buf, res, rej))
  ctx.close?.()
  const src = ab.getChannelData(0)
  let peak = 0
  for (let n = 0; n < src.length; n++) peak = Math.max(peak, Math.abs(src[n]))
  if (peak < 0.01) throw new Error('silent')
  const th = peak * 0.1
  let a = 0
  let b = src.length - 1
  while (a < b && Math.abs(src[a]) < th) a++
  while (b > a && Math.abs(src[b]) < th) b--
  const pad = Math.round(ab.sampleRate * 0.12)
  a = Math.max(0, a - pad)
  b = Math.min(src.length - 1, b + pad)
  const rate = 22050
  const ratio = ab.sampleRate / rate
  const len = Math.min(Math.floor((b - a) / ratio), rate * 3) // ٣ ثوانٍ كحدّ أقصى
  const gain = 0.9 / peak
  const pcm = new Int16Array(len)
  for (let n = 0; n < len; n++) {
    const v = Math.max(-1, Math.min(1, src[a + Math.floor(n * ratio)] * gain))
    pcm[n] = v * 32767
  }
  const out = new DataView(new ArrayBuffer(44 + len * 2))
  const w = (o, s) => [...s].forEach((c, k) => out.setUint8(o + k, c.charCodeAt(0)))
  w(0, 'RIFF')
  out.setUint32(4, 36 + len * 2, true)
  w(8, 'WAVEfmt ')
  out.setUint32(16, 16, true)
  out.setUint16(20, 1, true)
  out.setUint16(22, 1, true)
  out.setUint32(24, rate, true)
  out.setUint32(28, rate * 2, true)
  out.setUint16(32, 2, true)
  out.setUint16(34, 16, true)
  w(36, 'data')
  out.setUint32(40, len * 2, true)
  pcm.forEach((v, k) => out.setInt16(44 + k * 2, v, true))
  return new Blob([out], { type: 'audio/wav' })
}

export const canRecord = () =>
  USE_CLIPS &&
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'

// يبدأ التسجيل؛ يرجع كائناً فيه stop() يرجع true إذا حُفظ الاسم
export async function startNameRecording(name) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const types = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
  const mime = types.find((t) => MediaRecorder.isTypeSupported?.(t))
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  const chunks = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  rec.start()
  return {
    stop: () =>
      new Promise((res) => {
        rec.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop())
          const raw = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' })
          let data = ''
          try {
            data = await toDataUrl(await toTrimmedWav(raw))
          } catch {
            data = raw.size < 400000 ? await toDataUrl(raw) : ''
          }
          res(!!data && saveParentClip(name, data))
        }
        try {
          rec.stop()
        } catch {
          res(false)
        }
      }),
    cancel: () => {
      rec.onstop = null
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}

// ---------- التشغيل ----------
const el = typeof Audio !== 'undefined' ? new Audio() : null
let pending = null
let gen = 0

// يُستدعى من لمسة المستخدم: بعض المتصفحات (آيفون) تسمح بتشغيل الصوت لاحقاً فقط بعد ذلك
export function unlockClips() {
  if (!el) return
  el.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
  el.play().catch(() => {})
}

const playUrl = (url) =>
  new Promise((res) => {
    if (!el || !url) return res(false)
    const done = (ok) => {
      if (pending === done) pending = null
      el.onended = null
      el.onerror = null
      res(ok)
    }
    pending = done
    el.onended = () => done(true)
    el.onerror = () => done(false)
    el.src = url
    el.play().catch(() => done(false))
  })

export function stopVoice() {
  gen++
  if (el) {
    el.pause()
    pending?.(false)
  }
  stopTts()
}

const hasText = (t) => !!norm(t)

// جزء من الجملة: ملف مسجّل إن وُجد، وإلا صوت الجهاز
async function playPart(text, rate) {
  if (!hasText(text)) return
  const g = gen
  const clip = CLIPS[norm(text)]
  if (clip) {
    if (await playUrl(clip)) return
    if (g !== gen) return // أُوقف القارئ: لا نكمل بصوت الجهاز
  }
  await speak(text.trim(), rate)
}

async function playName(name, rate) {
  const g = gen
  const clip = NAME_CLIPS[norm(name)] || parentClip(name)
  if (clip) {
    if (await playUrl(clip)) return
    if (g !== gen) return
  }
  await speak(name, rate)
}

// يقرأ سطراً من القصة: القسم قبل الاسم + الاسم + القسم بعده، كلٌّ بأفضل صوت متاح
export async function sayLine(line, name, { ask = false, rate = 0.75 } = {}) {
  if (!USE_CLIPS) return speak(line, rate) // صوت الجهاز: الجملة كاملة كما كانت
  const g = gen
  const nn = (name || '').trim()
  const idx = nn ? line.indexOf(nn) : -1
  if (idx < 0) return playPart(line, rate)
  const before = line.slice(0, idx)
  const after = line.slice(idx + nn.length)
  // في الأسئلة لا نكرّر الاسم إن كان للسؤال ملف مسجّل («كيف يساعده؟»)
  if (ask && CLIPS[norm(before)]) return playPart(before, rate)
  await playPart(before, rate)
  if (g !== gen) return undefined
  await playName(nn, rate)
  if (g !== gen) return undefined
  return playPart(after, rate)
}

// كلمة الاختيار عند ضغط البطاقة
export const sayLabel = (label, rate = 0.7) => (USE_CLIPS ? playPart(label, rate) : speak(label, rate))

// معاينة الاسم بعد التسجيل
export async function previewName(name) {
  const clip = NAME_CLIPS[norm(name)] || parentClip(name)
  if (clip) await playUrl(clip)
}
