import type { Locale } from '../i18n.ts';

// What a lesson's app shows to its user, in Turkish and Arabic: button labels, placeholders,
// headings, sample data and comments. Identifiers stay English, so the code reads the same in
// every language. Each entry is specific enough to match only the text it means.
export const PHRASES: [en: string, tr: string, ar: string][] = [
  ['<h1>Hello, {{ name }}!</h1>', '<h1>Merhaba, {{ name }}!</h1>', '<h1>مرحبًا، {{ name }}!</h1>'],
  ['Clicked {{ count }} times', '{{ count }} kez tıklandı', 'نُقر {{ count }} مرة'],
  ['>Reset</button>', '>Sıfırla</button>', '>إعادة الضبط</button>'],
  ['>Add one</button>', '>Bir ekle</button>', '>أضف واحدًا</button>'],
  [
    '{{ count }} doubled is {{ double }}.',
    '{{ count }} sayısının iki katı {{ double }}.',
    'ضعف {{ count }} هو {{ double }}.',
  ],
  [
    "{{ count }} is {{ isEven ? 'even' : 'odd' }}.",
    "{{ count }} bir {{ isEven ? 'çift' : 'tek' }} sayı.",
    "{{ count }} عدد {{ isEven ? 'زوجي' : 'فردي' }}.",
  ],
  ['Read the docs', 'Dokümanları oku', 'اقرأ التوثيق'],
  ['Build something', 'Bir şey yap', 'ابنِ شيئًا'],
  ['>Clear</button>', '>Temizle</button>', '>امسح</button>'],
  ['Nothing to do.', 'Yapılacak bir şey yok.', 'لا شيء للقيام به.'],
  ['placeholder="What next?"', 'placeholder="Sırada ne var?"', 'placeholder="ما التالي؟"'],
  ['<button>Add</button>', '<button>Ekle</button>', '<button>أضف</button>'],
  ['// Your code here', '// Kodunuz buraya', '// اكتب شيفرتك هنا'],
  ['>Remove</button>', '>Sil</button>', '>احذف</button>'],
  [
    '<template #title>Contracts</template>',
    "<template #title>Contract'lar</template>",
    '<template #title>العقود</template>',
  ],
  [
    'Routes typed once, for both sides.',
    "Route'lar bir kez, iki taraf için tiplenir.",
    'مسارات تُكتب أنواعها مرة واحدة للطرفين.',
  ],
  [
    '<template #title>Templates</template>',
    "<template #title>Template'ler</template>",
    '<template #title>القوالب</template>',
  ],
  [
    'Checked like any TypeScript.',
    'Her TypeScript kodu gibi denetlenir.',
    'تُدقَّق مثل أي شيفرة TypeScript.',
  ],
  ['A card without a title.', 'Başlıksız bir kart.', 'بطاقة دون عنوان.'],
  ['>Untitled</slot>', '>Başlıksız</slot>', '>بلا عنوان</slot>'],
  [
    "Notifications are {{ notifications ? 'on' : 'off' }}.",
    "Bildirimler {{ notifications ? 'açık' : 'kapalı' }}.",
    "الإشعارات {{ notifications ? 'مفعّلة' : 'معطّلة' }}.",
  ],
  ["{{ on ? 'On' : 'Off' }}", "{{ on ? 'Açık' : 'Kapalı' }}", "{{ on ? 'تشغيل' : 'إيقاف' }}"],
  ['>Ship v0.1</p>', ">v0.1'i yayınla</p>", '>أطلق الإصدار 0.1</p>'],
  ['placeholder="Your name"', 'placeholder="Adınız"', 'placeholder="اسمك"'],
  [
    "Hello, {{ name || 'stranger' }}. Changed {{ changes }} times.",
    "Merhaba, {{ name || 'yabancı' }}. {{ changes }} kez değişti.",
    "مرحبًا، {{ name || 'أيها الغريب' }}. تغيّر {{ changes }} مرة.",
  ],
  ['placeholder="I have focus"', 'placeholder="Odak bende"', 'placeholder="التركيز هنا"'],
  [
    'The window is {{ width }}px wide.',
    'Pencere {{ width }}px genişliğinde.',
    'عرض النافذة {{ width }}px.',
  ],
  ['<header>Toolbar ·', '<header>Araç çubuğu ·', '<header>شريط الأدوات ·'],
  ["?? 'Nobody'", "?? 'Kimse'", "?? 'لا أحد'"],
  ['<h1>Global styles</h1>', '<h1>Global stiller</h1>', '<h1>الأنماط العامة</h1>'],
  ['>A button</button>', '>Bir buton</button>', '>زر</button>'],
  ['">Home</RouterLink>', '">Ana sayfa</RouterLink>', '">الرئيسية</RouterLink>'],
  ['<h1>Home</h1>', '<h1>Ana sayfa</h1>', '<h1>الرئيسية</h1>'],
  ['">User 1</RouterLink>', '">Kullanıcı 1</RouterLink>', '">المستخدم 1</RouterLink>'],
  ['">User 2</RouterLink>', '">Kullanıcı 2</RouterLink>', '">المستخدم 2</RouterLink>'],
  [
    '<h1>User {{ route.params.id }}</h1>',
    '<h1>Kullanıcı {{ route.params.id }}</h1>',
    '<h1>المستخدم {{ route.params.id }}</h1>',
  ],
  [
    '// The preview keeps its URL in memory; an app uses createWebHistory().',
    "// Önizleme URL'sini bellekte tutar; bir uygulama createWebHistory() kullanır.",
    '// تحتفظ المعاينة بعنوانها في الذاكرة؛ يستخدم التطبيق createWebHistory().',
  ],
  ['// Pretends to be a slow request.', '// Yavaş bir isteği taklit eder.', '// يحاكي طلبًا بطيئًا.'],
  ['You rolled {{ data }}.', 'Zar: {{ data }}.', 'النتيجة: {{ data }}.'],
  ['>Loading…</p>', '>Yükleniyor…</p>', '>جارٍ التحميل…</p>'],
  ['>Roll again</button>', '>Tekrar at</button>', '>ارمِ مجددًا</button>'],
  ["return 'Loading…';", "return 'Yükleniyor…';", "return 'جارٍ التحميل…';"],
  ["? 'Not found' :", "? 'Bulunamadı' :", "? 'غير موجود' :"],
  [
    '<p>Todo 3: {{ third }}</p>',
    '<p>3 numaralı todo: {{ third }}</p>',
    '<p>المهمة 3: {{ third }}</p>',
  ],
  [
    '// Each route once: its path, its response and the errors it can return.',
    '// Her route bir kez: yolu, yanıtı ve dönebileceği hatalar.',
    '// كل مسار مرة واحدة: مساره واستجابته والأخطاء التي قد يعيدها.',
  ],
  [
    '// A stand-in for the server, so this step runs in your browser. In an app, a controller\n// handles the same contract on the server.',
    "// Sunucunun yerine geçen bir taklit; bu adım tarayıcınızda çalışsın diye. Bir uygulamada\n// aynı contract'ı sunucuda bir controller karşılar.",
    '// بديل عن الخادم لكي تعمل هذه الخطوة في متصفحك. في التطبيق الحقيقي\n// يعالج متحكّم (controller) العقد نفسه على الخادم.',
  ],
];

/** A lesson's files with what its app shows translated into `locale`. */
export function localizeFiles(
  files: Record<string, string>,
  locale: Locale,
): Record<string, string> {
  if (locale === 'en') return files;
  const column = locale === 'tr' ? 1 : 2;
  return Object.fromEntries(
    Object.entries(files).map(([name, text]) => [
      name,
      PHRASES.reduce((out, phrase) => out.replaceAll(phrase[0], phrase[column]), text),
    ]),
  );
}
