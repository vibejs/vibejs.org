// The lesson texts in Turkish and Arabic, by step slug, written to read naturally in each
// language (see TRANSLATING.md). The code is the same in every language; English lives in
// steps.ts. Names in <em> match the labels that localize.ts gives each lesson's app.
type Lesson = { title: string; body: string };

export const LESSONS: Record<'tr' | 'ar', Record<string, Lesson>> = {
  tr: {
    components: {
      title: 'İlk bileşenin',
      body: `<p>Her <code>.vibe</code> dosyası bir bileşendir. İçinde TypeScript yazdığın bir <code>&lt;script setup&gt;</code> ve ekrana çizilecek her şeyin durduğu bir <code>&lt;template&gt;</code> var. Script'te tanımladığın her şeyi şablonda doğrudan kullanabilirsin; <code>{{ }}</code> bir değeri ekrana yazar.</p>
<p><strong>Sıra sende:</strong> <code>name</code> değerini kendi adınla değiştir. Sen yazdıkça önizleme de değişir.</p>`,
    },
    reactivity: {
      title: 'Reaktif durum',
      body: `<p><code>ref()</code> bir değeri reaktif yapar: değer değişince onu okuyan metin güncellenir, başka hiçbir şey baştan çizilmez. <code>@click</code> tıklanınca kod çalıştırır. Şablonda ref'i doğrudan değeri gibi okursun; script'te ise <code>.value</code> ile erişirsin.</p>
<p><strong>Sıra sende:</strong> <code>count</code> değerini sıfıra döndüren bir <em>Sıfırla</em> butonu ekle.</p>`,
    },
    computed: {
      title: 'Hesaplanan değerler',
      body: `<p><code>computed()</code> başka reaktif değerlerden yeni bir değer türetir. Sonucu aklında tutar ve yalnızca bağlı olduğu değerlerden biri değişince yeniden hesaplar.</p>
<p><strong>Sıra sende:</strong> <code>isEven</code> adında bir computed ekle ve sayının çift mi tek mi olduğunu yazdır.</p>`,
    },
    lists: {
      title: 'Koşullar ve listeler',
      body: `<p><code>v-if</code> ile <code>v-else</code> iki seçenekten birini gösterir. <code>v-for</code> listedeki her öğe için bir eleman çizer; her öğeye değişmeyen bir <code>:key</code> vermen gerekir.</p>
<p><strong>Sıra sende:</strong> liste boşalınca yerine “Yapılacak bir şey yok.” yazsın. Denemek için <em>Temizle</em>'ye bas.</p>`,
    },
    forms: {
      title: 'Formlar',
      body: `<p><code>v-model</code> bir input'u bir ref'e iki yönlü bağlar: biri değişince diğeri de değişir. <code>@submit.prevent</code> formu sayfayı yenilemeden gönderir.</p>
<p><strong>Sıra sende:</strong> <em>Ekle</em>'ye basınca yazdığın başlık <code>todos</code> listesine girsin ve input temizlensin.</p>`,
    },
    props: {
      title: 'Bileşenler ve prop’lar',
      body: `<p>Başka bir <code>.vibe</code> dosyasını import edip etiket gibi kullanabilirsin. <code>defineProps</code> bileşenin hangi değerleri aldığını söyler; derleyici bu tipleri bileşeni kullanan her şablonda denetler.</p>
<p><strong>Sıra sende:</strong> <code>TodoItem.vibe</code> dosyasına bir <code>done</code> prop'u ekle, <code>App.vibe</code>'dan gönder ve <code>true</code> olunca yanına ✓ koy.</p>`,
    },
    events: {
      title: 'Olaylar',
      body: `<p>Alt bileşen bir şey olduğunda bunu üst bileşene bir olay göndererek haber verir. <code>defineEmits</code> hangi olayları ve hangi verileri gönderdiğini tanımlar; üst bileşen de <code>@</code> ile dinler.</p>
<p><strong>Sıra sende:</strong> <em>Sil</em> butonu <code>remove</code> olayını göndersin, <code>App.vibe</code> da o görevi listeden çıkarsın.</p>`,
    },
    slots: {
      title: 'Slot’lar',
      body: `<p>Bir bileşen, üst bileşeninden işaretleme alabilir. <code>&lt;slot&gt;</code> bu içeriğin nereye geleceğini belirler. İsimli slot'lar bir <code>name</code> alır, üst bileşen de onları <code>&lt;template #name&gt;</code> ile doldurur.</p>
<p><strong>Sıra sende:</strong> <code>title</code> slot'u boş gelirse “Başlıksız” yazsın; sonra başlığı olmayan üçüncü bir kart ekle.</p>`,
    },
    'v-model': {
      title: 'Bileşenlerde v-model',
      body: `<p><code>defineModel()</code> bileşene iki yönlü bir değer verir: okursan üst bileşenin değerini okursun, atarsan üst bileşeni güncellersin. Üst bileşen de onu bir input'a bağlar gibi <code>v-model</code> ile bağlar.</p>
<p><strong>Sıra sende:</strong> anahtara tıklayınca <code>on</code> tersine dönsün; <code>App.vibe</code>'daki yazı da ona uysun.</p>`,
    },
    styles: {
      title: 'Kapsamlı stiller',
      body: `<p><code>&lt;style scoped&gt;</code> içindeki kurallar yalnızca bu bileşenin işaretlemesine uygulanır, dışarı taşmaz. <code>:class</code> ile sınıfları duruma göre açıp kapatırsın.</p>
<p><strong>Sıra sende:</strong> <code>done</code> <code>true</code> olunca öğeye <code>done</code> sınıfını ver; tıklayınca üstü çizilsin.</p>`,
    },
    watchers: {
      title: 'Watcher’lar',
      body: `<p><code>watch()</code> reaktif bir değer değişince, yeni ve eski değerle birlikte kod çalıştırır. Kaydetmek, loglamak ya da bir API'yi çağırmak gibi yan etkiler için birebirdir.</p>
<p><strong>Sıra sende:</strong> watcher içinde <code>name</code> değerini <code>localStorage</code>'a kaydet, bileşen açılırken de oradan oku. Kodda bir şey değiştirip önizlemeyi yenile: adın yerinde duruyor olmalı.</p>`,
    },
    lifecycle: {
      title: 'Yaşam döngüsü ve şablon ref’leri',
      body: `<p><code>onMounted</code> bileşen sayfaya yerleşince çalışır. <code>onBeforeUnmount</code> ise bileşen sayfadan kalkmadan hemen önce çalışır; <code>onMounted</code>'da kurduğun şeyi burada toplarsın. <code>useTemplateRef</code> sana aynı <code>ref</code> adını taşıyan elemanı verir.</p>
<p><strong>Sıra sende:</strong> pencere genişliğini göster ve güncel tut: <code>onMounted</code>'da bir <code>resize</code> dinleyicisi ekle, <code>onBeforeUnmount</code>'ta kaldır.</p>`,
    },
    'provide-inject': {
      title: 'Provide ve inject',
      body: `<p><code>provide()</code> bir değeri altındaki bütün bileşenlerin erişimine açar. <code>inject()</code> da onu ne kadar derinde olursa olsun okur; arada her seviyeden prop geçirmen gerekmez. Değerin tipini <code>InjectionKey</code> taşır.</p>
<p><strong>Sıra sende:</strong> <code>App.vibe</code>'da <code>user</code> değerini <code>USER</code> anahtarıyla provide et, <code>Avatar.vibe</code> adı göstersin. Sonra input'a bir şey yaz; avatar da değişecek.</p>`,
    },
    'global-styles': {
      title: 'main.ts ve global stiller',
      body: `<p>Bir uygulama <code>main.ts</code>'ten başlar: kök bileşenden uygulamayı oluşturur ve sayfaya bağlar. Global CSS de buradan, düz bir <code>import './styles.css'</code> ile gelir. Global kurallar her yerde geçerlidir; <code>&lt;style scoped&gt;</code> ise kendi bileşeninin dışına çıkmaz.</p>
<p><strong>Sıra sende:</strong> <code>main.ts</code>'te <code>styles.css</code>'i import et, sonra dosyadaki <code>--accent</code> rengini değiştir. Başlık da buton da birlikte değişecek.</p>`,
    },
    routing: {
      title: 'Yönlendirme',
      body: `<p>Router her adresi bir sayfa bileşenine bağlar. <code>RouterView</code> o anki sayfayı gösterir, <code>RouterLink</code> da sayfayı yenilemeden geçiş yapar. Yoldaki <code>:id</code> gibi bir parça, <code>route.params.id</code> olarak elinin altındadır.</p>
<p><strong>Sıra sende:</strong> <code>App.vibe</code>'a 2 numaralı kullanıcı için bir link ekle; açıp ana sayfaya geri dön.</p>`,
    },
    'loading-data': {
      title: 'Veri yükleme',
      body: `<p><code>useAsync()</code> bileşen açılınca bir async fonksiyonu çalıştırır ve sana <code>data</code>, <code>error</code>, <code>loading</code> ve <code>refresh()</code> verir. Artık gerekmeyen bir isteği de verdiği <code>signal</code> ile iptal eder.</p>
<p><strong>Sıra sende:</strong> istek sürerken “Yükleniyor…” yazsın; bir de <code>refresh()</code>'i çağıran <em>Tekrar at</em> butonu ekle.</p>`,
    },
    contracts: {
      title: 'Tipli sözleşmeler',
      body: `<p>vibe.js'i full-stack yapan parça bu. <code>contract.ts</code> her rotayı bir kez tanımlar. Sunucu onu karşılar, <code>createClient</code> de arayüze aynı sözleşmeden tiplenmiş, her rota için bir fonksiyon verir. Bir alanın adını değiştirirsen iki tarafta da tip hatası alırsın. Çağrı hiçbir zaman hata fırlatmaz; ya <code>{ ok: true, data }</code> ya da <code>{ ok: false, error }</code> döner.</p>
<p><strong>Sıra sende:</strong> id'si 3 olan görevi <code>api.todos.one</code> ile yükle ve başlığını göster. <code>error.code</code> <code>TODO_NOT_FOUND</code> gelirse “Bulunamadı” yazsın.</p>`,
    },
  },
  ar: {
    components: {
      title: 'مكوّنك الأول',
      body: `<p>كل ملف <code>.vibe</code> مكوّن قائم بذاته: فيه <code>&lt;script setup&gt;</code> تكتب فيه بـ TypeScript، و<code>&lt;template&gt;</code> يضم ما يظهر على الشاشة. كل ما تعرّفه في السكربت تستخدمه مباشرة في القالب، و<code>{{ }}</code> تعرض القيمة.</p>
<p><strong>دورك:</strong> غيّر <code>name</code> إلى اسمك، وستتحدّث المعاينة وأنت تكتب.</p>`,
    },
    reactivity: {
      title: 'الحالة التفاعلية',
      body: `<p><code>ref()</code> تجعل القيمة تفاعلية: إذا تغيّرت، يتحدّث النص الذي يقرؤها، ولا يُعاد رسم شيء آخر. و<code>@click</code> تشغّل شيفرة عند النقر. في القالب تقرأ الـ ref كقيمة عادية، أما في السكربت فتصل إليها عبر <code>.value</code>.</p>
<p><strong>دورك:</strong> أضف زر <em>إعادة الضبط</em> يعيد <code>count</code> إلى الصفر.</p>`,
    },
    computed: {
      title: 'القيم المحسوبة',
      body: `<p><code>computed()</code> تشتق قيمة جديدة من قيم تفاعلية أخرى. تحتفظ بالنتيجة، ولا تعيد الحساب إلا إذا تغيّرت إحدى القيم التي تعتمد عليها.</p>
<p><strong>دورك:</strong> أضف قيمة محسوبة باسم <code>isEven</code>، واكتب بجانب الرقم إن كان زوجيًا أو فرديًا.</p>`,
    },
    lists: {
      title: 'الشروط والقوائم',
      body: `<p><code>v-if</code> و<code>v-else</code> تعرضان أحد خيارين. و<code>v-for</code> ترسم عنصرًا لكل بند في القائمة، ولكل بند <code>:key</code> ثابت لا يتغيّر.</p>
<p><strong>دورك:</strong> إذا فرغت القائمة، اعرض بدلها «لا شيء للقيام به.». جرّب ذلك بالنقر على <em>امسح</em>.</p>`,
    },
    forms: {
      title: 'النماذج',
      body: `<p><code>v-model</code> تربط حقل الإدخال بـ ref في الاتجاهين: إن تغيّر أحدهما تغيّر الآخر. و<code>@submit.prevent</code> ترسل النموذج دون إعادة تحميل الصفحة.</p>
<p><strong>دورك:</strong> عند النقر على <em>أضف</em>، أضف العنوان المكتوب إلى <code>todos</code> وفرّغ الحقل.</p>`,
    },
    props: {
      title: 'المكوّنات والخصائص',
      body: `<p>استورد ملف <code>.vibe</code> آخر واستخدمه كوسم. <code>defineProps</code> تحدّد القيم التي يستقبلها المكوّن، ويتحقق المترجم من أنواعها في كل قالب يستخدمه.</p>
<p><strong>دورك:</strong> أضف خاصية <code>done</code> إلى <code>TodoItem.vibe</code>، ومرّرها من <code>App.vibe</code>، واعرض ✓ حين تكون <code>true</code>.</p>`,
    },
    events: {
      title: 'الأحداث',
      body: `<p>حين يقع شيء في المكوّن الابن، يخبر الأب بإطلاق حدث. <code>defineEmits</code> تحدّد الأحداث والبيانات التي يحملها كل حدث، ويستمع الأب إليها بـ <code>@</code>.</p>
<p><strong>دورك:</strong> اجعل زر <em>احذف</em> يطلق الحدث <code>remove</code>، ودع <code>App.vibe</code> يحذف المهمة من القائمة.</p>`,
    },
    slots: {
      title: 'الفتحات (slots)',
      body: `<p>يمكن للمكوّن أن يستقبل محتوى من أبيه. <code>&lt;slot&gt;</code> تحدّد أين يظهر هذا المحتوى. والفتحات المسمّاة تأخذ <code>name</code>، ويملؤها الأب بـ <code>&lt;template #name&gt;</code>.</p>
<p><strong>دورك:</strong> إذا لم تصل فتحة <code>title</code>، اعرض «بلا عنوان»، ثم أضف بطاقة ثالثة دون عنوان.</p>`,
    },
    'v-model': {
      title: 'v-model على المكوّنات',
      body: `<p><code>defineModel()</code> تعطي المكوّن قيمة باتجاهين: حين تقرؤها تقرأ قيمة الأب، وحين تُسند إليها تحدّث الأب. ويربطها الأب بـ <code>v-model</code> تمامًا كما يربط حقل إدخال.</p>
<p><strong>دورك:</strong> عند النقر على المفتاح اعكس <code>on</code>، فيتبعه النص في <code>App.vibe</code>.</p>`,
    },
    styles: {
      title: 'الأنماط المحصورة',
      body: `<p>قواعد <code>&lt;style scoped&gt;</code> تنطبق على ترميز هذا المكوّن وحده، ولا تتسرّب إلى غيره. و<code>:class</code> تضيف الأصناف أو تزيلها حسب الحالة.</p>
<p><strong>دورك:</strong> حين تصبح <code>done</code> صحيحة، أعطِ العنصر الصنف <code>done</code> ليُشطب بنقرة.</p>`,
    },
    watchers: {
      title: 'المراقِبات',
      body: `<p><code>watch()</code> تشغّل شيفرة كلما تغيّرت قيمة تفاعلية، وتعطيك القيمة الجديدة والقديمة. هي المكان المناسب للتأثيرات الجانبية: الحفظ والتسجيل واستدعاء الواجهات البرمجية.</p>
<p><strong>دورك:</strong> احفظ <code>name</code> في <code>localStorage</code> داخل المراقِب، واقرأه منه عند بدء المكوّن. عدّل الشيفرة لتُعيد تحميل المعاينة، وسيبقى الاسم كما هو.</p>`,
    },
    lifecycle: {
      title: 'دورة الحياة ومراجع القوالب',
      body: `<p><code>onMounted</code> تعمل بعد أن يستقر المكوّن في الصفحة، و<code>onBeforeUnmount</code> تعمل قبل أن يغادرها مباشرة، وفيها تتراجع عمّا أعددته في <code>onMounted</code>. أما <code>useTemplateRef</code> فتعطيك العنصر الذي يحمل اسم <code>ref</code> نفسه.</p>
<p><strong>دورك:</strong> اعرض عرض النافذة وأبقه محدّثًا: أضف مستمعًا لـ <code>resize</code> في <code>onMounted</code>، وأزله في <code>onBeforeUnmount</code>.</p>`,
    },
    'provide-inject': {
      title: 'التزويد والحقن',
      body: `<p><code>provide()</code> تتيح قيمة لكل المكوّنات التي تحتها، و<code>inject()</code> تقرؤها مهما كان العمق، دون أن تمرّر الخصائص من مستوى إلى مستوى. ونوع القيمة يحمله <code>InjectionKey</code>.</p>
<p><strong>دورك:</strong> زوّد <code>user</code> في <code>App.vibe</code> تحت المفتاح <code>USER</code> ليعرض <code>Avatar.vibe</code> الاسم. ثم اكتب في الحقل، وسيتغيّر الاسم في الأعلى معك.</p>`,
    },
    'global-styles': {
      title: 'main.ts والأنماط العامة',
      body: `<p>يبدأ التطبيق من <code>main.ts</code>: هناك يُنشأ من المكوّن الجذر ويُركَّب في الصفحة. ومن هناك أيضًا تأتي أنماط CSS العامة، باستيراد بسيط: <code>import './styles.css'</code>. القواعد العامة تسري في كل مكان، أما <code>&lt;style scoped&gt;</code> فلا تتجاوز مكوّنها.</p>
<p><strong>دورك:</strong> استورد <code>styles.css</code> في <code>main.ts</code>، ثم غيّر لون <code>--accent</code> في الملف، وسيتغيّر العنوان والزر معًا.</p>`,
    },
    routing: {
      title: 'التوجيه',
      body: `<p>يربط الموجِّه كل عنوان بمكوّن صفحة. <code>RouterView</code> تعرض الصفحة الحالية، و<code>RouterLink</code> تنتقل بين الصفحات دون إعادة تحميل. وأي جزء مثل <code>:id</code> في المسار تجده في <code>route.params.id</code>.</p>
<p><strong>دورك:</strong> أضف في <code>App.vibe</code> رابطًا إلى المستخدم 2، ثم افتحه وعُد إلى الرئيسية.</p>`,
    },
    'loading-data': {
      title: 'تحميل البيانات',
      body: `<p><code>useAsync()</code> تشغّل دالة غير متزامنة عند فتح المكوّن، وتعطيك <code>data</code> و<code>error</code> و<code>loading</code> و<code>refresh()</code>. وإذا لم يعد الطلب مطلوبًا ألغته عبر <code>signal</code> التي تمرّرها إليك.</p>
<p><strong>دورك:</strong> اعرض «جارٍ التحميل…» أثناء الطلب، وأضف زر <em>ارمِ مجددًا</em> يستدعي <code>refresh()</code>.</p>`,
    },
    contracts: {
      title: 'العقود ذات الأنواع',
      body: `<p>هذا ما يجعل vibe.js إطارًا متكاملًا. يعرّف <code>contract.ts</code> كل مسار مرة واحدة، فيعالجه الخادم، وتعطي <code>createClient</code> الواجهة دالة لكل مسار بأنواع مأخوذة من العقد نفسه. غيّر اسم حقل، وستحصل على خطأ أنواع في الطرفين. والاستدعاء لا يرمي خطأً أبدًا: يعيد إما <code>{ ok: true, data }</code> وإما <code>{ ok: false, error }</code>.</p>
<p><strong>دورك:</strong> حمّل المهمة رقم 3 عبر <code>api.todos.one</code> واعرض عنوانها، أو اعرض «غير موجود» إذا كان <code>error.code</code> هو <code>TODO_NOT_FOUND</code>.</p>`,
    },
  },
};
