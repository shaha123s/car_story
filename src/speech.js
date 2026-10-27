// نطق الكلمات بصوت الجهاز (Web Speech). إن لم يعمل الصوت العربي يعمل الكتاب بدون نطق.
import { audio } from './audio'

let voice = null
let failed = false
const ok = typeof window !== 'undefined' && 'speechSynthesis' in window

const findVoice = () => {
  if (!ok) return
  const all = window.speechSynthesis.getVoices() || []
  voice =
    all.find((v) => /^ar([-_]|$)/i.test(v.lang || '')) ||
    all.find((v) => /arab|عرب/i.test(v.name || '')) ||
    null
}
if (ok) {
  findVoice()
  window.speechSynthesis.addEventListener?.('voiceschanged', findVoice)
}

export const hasVoice = () => !!voice
// true إذا حاولنا النطق ولم يخرج صوت (لا يوجد محرك عربي على الجهاز)
export const speechFailed = () => failed
export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// يرجع عند انتهاء النطق. إن لم يعمل الصوت ينتظر قليلاً حتى يظهر تظليل الكلمة.
export function speak(text, rate = 0.75) {
  if (!ok) return wait(700)
  if (!voice) findVoice()
  return new Promise((res) => {
    const u = new SpeechSynthesisUtterance(text)
    // بعض الأجهزة (أندرويد) لا تُظهر الأصوات في القائمة لكنها تنطق إذا حُدّدت اللغة فقط
    u.lang = voice ? voice.lang : 'ar-SA'
    if (voice) u.voice = voice
    u.rate = rate
    const t0 = Date.now()
    let done = false
    const finish = (bad) => {
      if (done) return
      done = true
      if (bad) failed = true
      else if (Date.now() - t0 > 350) failed = false
      res()
    }
    u.onend = () => finish(Date.now() - t0 < 250 && text.length > 3)
    u.onerror = () => finish(true)
    // حماية: إن لم يبدأ النطق أبداً لا نعلق
    setTimeout(() => finish(true), Math.max(4000, text.length * 400))
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }).then(() => (failed ? wait(700) : undefined))
}

export function stop() {
  if (ok) window.speechSynthesis.cancel()
  audio.duck(false)
}

// يُستدعى من لمسة المستخدم الأولى: بعض المتصفحات (آيفون) لا تسمح بالنطق بدونها
export function unlockSpeech() {
  if (!ok) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  window.speechSynthesis.speak(u)
}
