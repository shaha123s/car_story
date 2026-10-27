import { useEffect, useRef, useState } from 'react'
import { audio } from './audio'
import { canRecord, clearParentClip, hasBundledName, hasParentClip, previewName, startNameRecording, stopVoice } from './voice'

// تسجيل اسم الطفل بصوت أحد الأهل (يبقى على الجهاز فقط)
export default function NameVoice({ name }) {
  const nm = name.trim()
  const [rec, setRec] = useState(null)
  const [tick, setTick] = useState(0)
  const [msg, setMsg] = useState('')
  const timer = useRef(null)

  // تغيير الاسم أثناء التسجيل يلغيه
  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    []
  )
  useEffect(() => {
    setMsg('')
  }, [nm])

  if (!nm) return null
  if (hasBundledName(nm)) return <p className="hint voice-ok">🎙️ اسمه مسجّل بصوت جاهز، سيُقرأ بالصوت الحقيقي ✓</p>
  if (!canRecord()) return null

  const saved = hasParentClip(nm)

  const stop = async (r) => {
    clearTimeout(timer.current)
    setRec(null)
    const ok = await r.stop()
    setTick((t) => t + 1)
    setMsg(ok ? '' : 'لم يُسجَّل شيء، جرّب مرة أخرى بصوت أعلى.')
  }

  const start = async () => {
    setMsg('')
    audio.pause?.()
    stopVoice()
    try {
      const r = await startNameRecording(nm)
      setRec(r)
      timer.current = setTimeout(() => stop(r), 3500)
    } catch {
      audio.resume?.()
      setMsg('لم نتمكن من استخدام الميكروفون. اسمح به من إعدادات المتصفح، وإلا سيُقرأ الاسم بصوت الجهاز.')
    }
  }

  const finish = async () => {
    const r = rec
    await stop(r)
    audio.resume?.()
  }

  return (
    <div className="voice-box" data-tick={tick}>
      {rec ? (
        <button type="button" className="chip rec on" onClick={finish}>
          <span className="rec-dot" aria-hidden="true" /> قل «{nm}» ثم اضغط ⏹
        </button>
      ) : saved ? (
        <div className="row">
          <button type="button" className="chip" onClick={() => previewName(nm)}>▶ استمع لاسم {nm}</button>
          <button type="button" className="chip" onClick={start}>🎙️ إعادة التسجيل</button>
          <button
            type="button"
            className="link"
            onClick={() => {
              clearParentClip(nm)
              setTick((t) => t + 1)
            }}
          >
            حذف
          </button>
        </div>
      ) : (
        <button type="button" className="chip rec" onClick={start}>
          🎙️ سجّل اسم {nm} بصوتك
        </button>
      )}
      <p className="hint">
        {saved ? 'تم حفظ التسجيل على جهازك فقط ✓' : 'قُل اسم الطفل مرة واحدة فقط، فيسمعه بصوتك في القصة. اختياري، وبدونه يُقرأ الاسم بصوت الجهاز.'}
      </p>
      {msg && <p className="error" role="alert">{msg}</p>}
    </div>
  )
}
