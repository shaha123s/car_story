// قصة «{الاسم} وسيارته الصغيرة» — للأطفال ٢–٣ سنوات: ٨ صفحات، جملة قصيرة، وبعدها يختار الطفل فيتغيّر المشهد.
// {n} = اسم الطفل،  {c} = لون السيارة،  [مذكر|مؤنث] = حسب الجنس
// id = اسم الاختيار في ملفات الصور: scenes/p1-red.webp …

export const COLORS = [
  { id: 'red', name: 'الأحمر', main: '#e5484d', dark: '#a62a2f' },
  { id: 'blue', name: 'الأزرق', main: '#2f7df0', dark: '#1b4fb8' },
  { id: 'yellow', name: 'الأصفر', main: '#ffc928', dark: '#c28f00' },
  { id: 'green', name: 'الأخضر', main: '#35b44f', dark: '#1f7a34' },
]

const ch = (id, label, emo, extra = {}) => ({ id, label, emo, ...extra })

export const CHAPTERS = {
  p1: {
    scene: 'garage',
    ask: 'ما لون السيارة؟',
    text: ['[وجد|وجدت] {n} سيارةً صغيرة.'],
    choices: [
      ch('red', 'أحمر', '', { color: 'red', next: 'p2' }),
      ch('blue', 'أزرق', '', { color: 'blue', next: 'p2' }),
      ch('yellow', 'أصفر', '', { color: 'yellow', next: 'p2' }),
      ch('green', 'أخضر', '', { color: 'green', next: 'p2' }),
    ],
  },
  p2: {
    scene: 'road',
    ask: 'إلى أين [يذهب|تذهب]؟',
    text: ['[ركب|ركبت] {n} السيارة.'],
    choices: [
      ch('park', 'الحديقة', '🌳', { next: 'p3' }),
      ch('sea', 'البحر', '🏖️', { next: 'p3' }),
      ch('grandma', 'بيت الجدة', '🏡', { next: 'p3' }),
    ],
  },
  p3: {
    scene: 'cat',
    ask: 'ماذا تفعل القطة؟',
    text: ['[رأى|رأت] {n} قطةً.'],
    choices: [
      ch('meow', 'تموء', '🐱', { next: 'p4' }),
      ch('walk', 'تمشي', '🐾', { next: 'p4' }),
      ch('sleep', 'تنام', '😴', { next: 'p4' }),
    ],
  },
  p4: {
    scene: 'bunny',
    ask: 'ماذا [يعطيه|تعطيه]؟',
    text: ['[قابل|قابلت] {n} أرنباً صغيراً.'],
    choices: [
      ch('carrot', 'جزرة', '🥕', { next: 'p5' }),
      ch('apple', 'تفاحة', '🍎', { next: 'p5' }),
      ch('leaf', 'ورقة', '🥬', { next: 'p5' }),
    ],
  },
  p5: {
    scene: 'sad',
    ask: 'كيف نساعدها؟',
    text: ['توقفت سيارةُ {n}.'],
    choices: [
      ch('fix', 'نصلحها', '🔧', { next: 'p6' }),
      ch('wash', 'ننظفها', '🧽', { next: 'p6' }),
      ch('fuel', 'نملؤها بالوقود', '⛽', { next: 'p6' }),
    ],
  },
  p6: {
    scene: 'party',
    ask: 'كيف نحتفل؟',
    text: ['فرحت سيارةُ {n}.'],
    choices: [
      ch('sing', 'نغني', '🎵', { next: 'p7' }),
      ch('clap', 'نصفق', '👏', { next: 'p7' }),
      ch('dance', 'نرقص', '💃', { next: 'p7' }),
    ],
  },
  p7: {
    scene: 'home',
    ask: 'مَن [ينتظره|ينتظرها]؟',
    text: ['[عاد|عادت] {n} إلى البيت.'],
    choices: [
      ch('mama', 'ماما', '👩', { next: 'end' }),
      ch('papa', 'بابا', '👨', { next: 'end' }),
      ch('teddy', 'دبدوبه', '🧸', { next: 'end' }),
    ],
  },
}

// الصفحة الأخيرة (٨): بلا خيارات ثم الشهادة
export const ENDING = ['[نام|نامت] {n} [سعيداً|سعيدة].', 'تصبح على خير يا [بطل|بطلة]! 🌙']

// يبدّل {n} و {c} و [مذكر|مؤنث]
export function fill(text, { name, girl, color }) {
  return text
    .replace(/\[([^|\]]+)\|([^\]]+)\]/g, (_, m, f) => (girl ? f : m))
    .replace(/\{n\}/g, name)
    .replace(/\{c\}/g, color)
}
