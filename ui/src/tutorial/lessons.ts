// The lesson texts in Turkish and Arabic, by step slug. The code of each lesson is the same in
// every language; English lives in steps.ts.
type Lesson = { title: string; body: string };

export const LESSONS: Record<'tr' | 'ar', Record<string, Lesson>> = {
  tr: {
    components: {
      title: 'İlk bileşeniniz',
      body: `<p>Bir <code>.vibe</code> dosyası tek bir bileşendir: TypeScript ile yazılmış bir <code>&lt;script setup&gt;</code> ve işaretlemeyi içeren bir <code>&lt;template&gt;</code>. Script'in tanımladığı her şey template'te kullanılabilir; <code>{{ }}</code> bir değeri yazdırır.</p>
<p><strong>Deneyin:</strong> <code>name</code> değerini kendi adınızla değiştirin. Siz yazarken önizleme güncellenir.</p>`,
    },
    reactivity: {
      title: 'Reaktif durum',
      body: `<p><code>ref()</code> bir değeri reaktif yapar: değer değiştiğinde onu okuyan metin güncellenir, başka hiçbir şey yeniden render edilmez. <code>@click</code> bir tıklamada kod çalıştırır. Template'te bir ref doğrudan değeri olarak okunur; script'te <code>.value</code> kullanın.</p>
<p><strong>Deneyin:</strong> <code>count</code> değerini 0'a döndüren bir <em>Reset</em> butonu ekleyin.</p>`,
    },
    computed: {
      title: 'Hesaplanan değerler',
      body: `<p><code>computed()</code> başka reaktif değerlerden bir değer türetir. Yalnızca onlardan biri değiştiğinde yeniden hesaplanır, arada sonucu önbellekte tutar.</p>
<p><strong>Deneyin:</strong> <code>isEven</code> adında bir computed ekleyin ve sayının yanında “even” ya da “odd” gösterin.</p>`,
    },
    lists: {
      title: 'Koşullar ve listeler',
      body: `<p><code>v-if</code> ve <code>v-else</code> iki daldan birini render eder. <code>v-for</code> her öğe için bir eleman render eder; her öğenin sabit bir <code>:key</code> değeri olmalıdır.</p>
<p><strong>Deneyin:</strong> hiç todo yokken listenin yerine “Nothing to do.” gösterin. Kontrol etmek için <em>Clear</em>'a tıklayın.</p>`,
    },
    forms: {
      title: 'Formlar',
      body: `<p><code>v-model</code> bir input'u bir ref'e iki yönlü bağlar. <code>@submit.prevent</code> bir formu sayfayı yeniden yüklemeden işler.</p>
<p><strong>Deneyin:</strong> <em>Add</em> butonu yazılan başlığı <code>todos</code> listesine eklesin ve input'u temizlesin.</p>`,
    },
    props: {
      title: 'Bileşenler ve props',
      body: `<p>Başka bir <code>.vibe</code> dosyasını import ederek onu bir etiket olarak kullanın. <code>defineProps</code> bileşenin ne aldığını tanımlar; tipleri, bileşeni kullanan her template'te derleyici tarafından denetlenir.</p>
<p><strong>Deneyin:</strong> <code>TodoItem.vibe</code> dosyasını açıp bir <code>done</code> prop'u ekleyin; onu <code>App.vibe</code>'dan geçirin ve true olduğunda ✓ gösterin.</p>`,
    },
    events: {
      title: 'Olaylar',
      body: `<p>Bir alt bileşen, bir şey olduğunu üst bileşene bir olay yayınlayarak bildirir. <code>defineEmits</code> olayları ve taşıdıkları verileri tanımlar; üst bileşen <code>@</code> ile dinler.</p>
<p><strong>Deneyin:</strong> <em>Remove</em> butonu <code>remove</code> olayını yayınlasın ve <code>App.vibe</code> todo'yu silsin.</p>`,
    },
    slots: {
      title: 'Slot’lar',
      body: `<p>Bir bileşen üst bileşeninden işaretleme alabilir. <code>&lt;slot&gt;</code> bu içeriğin nereye geleceğini belirler; adlandırılmış slot'lar bir <code>name</code> alır ve üst bileşen onları <code>&lt;template #name&gt;</code> ile doldurur.</p>
<p><strong>Deneyin:</strong> <code>title</code> slot'una “Untitled” varsayılanını verin, ardından başlıksız üçüncü bir kart ekleyin.</p>`,
    },
    'v-model': {
      title: 'Bileşenlerde v-model',
      body: `<p><code>defineModel()</code> bir bileşene iki yönlü bir değer verir: okumak üst bileşenin değerini okur, atamak üst bileşeni günceller. Üst bileşen onu bir input'taki gibi <code>v-model</code> ile bağlar.</p>
<p><strong>Deneyin:</strong> anahtara tıklamak <code>on</code> değerini tersine çevirsin, böylece <code>App.vibe</code>'daki metin de değişsin.</p>`,
    },
    styles: {
      title: 'Kapsamlı stiller',
      body: `<p><code>&lt;style scoped&gt;</code> yalnızca bu bileşenin işaretlemesine uygulanır. <code>:class</code> sınıfları duruma göre açıp kapatır.</p>
<p><strong>Deneyin:</strong> <code>done</code> true olduğunda öğeye <code>done</code> sınıfını verin; böylece bir tıklama onun üstünü çizsin.</p>`,
    },
    watchers: {
      title: 'Watcher’lar',
      body: `<p><code>watch()</code> reaktif bir değer değiştiğinde, yeni ve eski değerle birlikte kod çalıştırır. Kaydetme, loglama ya da bir API çağırma gibi yan etkiler için kullanın.</p>
<p><strong>Deneyin:</strong> watcher içinde <code>name</code> değerini <code>localStorage</code>'a kaydedin ve bileşen başlarken geri okuyun. Kodu düzenleyerek önizlemeyi yenileyin: ad korunur.</p>`,
    },
    lifecycle: {
      title: 'Yaşam döngüsü ve template ref’leri',
      body: `<p><code>onMounted</code> bileşen sayfaya yerleştiğinde çalışır; <code>onBeforeUnmount</code> sayfadan ayrılmadan önce çalışır ve <code>onMounted</code>'ın kurduklarını geri alabilir. <code>useTemplateRef</code> eşleşen <code>ref</code>'e sahip elemanı verir.</p>
<p><strong>Deneyin:</strong> pencere genişliğini gösterin ve güncel tutun: <code>onMounted</code> içinde bir <code>resize</code> dinleyicisi ekleyip <code>onBeforeUnmount</code> içinde kaldırın.</p>`,
    },
    'provide-inject': {
      title: 'Provide ve inject',
      body: `<p><code>provide()</code> bir değeri altındaki tüm bileşenlere açar; <code>inject()</code> onu ne kadar derinde olursa olsun, her seviyeden props geçirmeden okur. Bir <code>InjectionKey</code> değerin tipini taşır.</p>
<p><strong>Deneyin:</strong> <code>App.vibe</code> içinde <code>user</code> değerini <code>USER</code> anahtarıyla provide edin; böylece <code>Avatar.vibe</code> adı göstersin. Input'a yazın: avatar da değişir.</p>`,
    },
    'global-styles': {
      title: 'main.ts ve global stiller',
      body: `<p>Bir uygulama <code>main.ts</code> ile başlar: kök bileşenden uygulamayı oluşturur ve mount eder. Global CSS de orada, sade bir <code>import './styles.css'</code> ile gelir. Global kurallar her yerde geçerlidir; <code>&lt;style scoped&gt;</code> ise kendi bileşeninin içinde kalır.</p>
<p><strong>Deneyin:</strong> <code>main.ts</code> içinde <code>styles.css</code>'i import edin, sonra içindeki <code>--accent</code> değerini değiştirip başlığın ve butonun birlikte değiştiğini görün.</p>`,
    },
    routing: {
      title: 'Yönlendirme',
      body: `<p>Router yolları sayfa bileşenlerine eşler. <code>RouterView</code> geçerli sayfayı gösterir, <code>RouterLink</code> sayfayı yeniden yüklemeden geçiş yapar. Bir yoldaki <code>:id</code>, <code>route.params.id</code> olur.</p>
<p><strong>Deneyin:</strong> <code>App.vibe</code>'a kullanıcı 2 için bir link ekleyin, ardından onu açıp ana sayfaya geri dönün.</p>`,
    },
    'loading-data': {
      title: 'Veri yükleme',
      body: `<p><code>useAsync()</code> bileşen mount olduğunda async bir fonksiyon çalıştırır ve size <code>data</code>, <code>error</code>, <code>loading</code> ve <code>refresh()</code> verir. Artık gerekmeyen bir çalıştırmayı, verdiği <code>signal</code> üzerinden iptal eder.</p>
<p><strong>Deneyin:</strong> çalışırken “Loading…” gösterin ve <code>refresh()</code>'i çağıran bir <em>Roll again</em> butonu ekleyin.</p>`,
    },
    contracts: {
      title: 'Tipli contract’lar',
      body: `<p>vibe.js'i full-stack yapan şey budur. <code>contract.ts</code> her route'u bir kez tanımlar. Sunucu onu karşılar; <code>createClient</code> ise arayüze aynı contract'tan tiplenmiş, her route için bir fonksiyon verir: adı değişen bir alan iki tarafta da tip hatası olur. Bir çağrı asla hata fırlatmaz; <code>{ ok: true, data }</code> ya da <code>{ ok: false, error }</code> döndürür.</p>
<p><strong>Deneyin:</strong> id'si 3 olan todo'yu <code>api.todos.one</code> ile yükleyin ve başlığını gösterin; <code>error.code</code> <code>TODO_NOT_FOUND</code> olduğunda “Not found” gösterin.</p>`,
    },
  },
  ar: {
    components: {
      title: 'مكوّنك الأول',
      body: `<p>ملف <code>.vibe</code> هو مكوّن واحد: <code>&lt;script setup&gt;</code> مكتوب بـ TypeScript و<code>&lt;template&gt;</code> يحتوي الترميز. كل ما يعرّفه السكربت متاح في القالب، و<code>{{ }}</code> تطبع قيمة.</p>
<p><strong>جرّب:</strong> غيّر <code>name</code> إلى اسمك. تتحدّث المعاينة أثناء الكتابة.</p>`,
    },
    reactivity: {
      title: 'الحالة التفاعلية',
      body: `<p>تجعل <code>ref()</code> القيمة تفاعلية: عندما تتغيّر، يتحدّث النص الذي يقرؤها ولا يُعاد عرض أي شيء آخر. تشغّل <code>@click</code> شيفرة عند النقر. في القالب يُقرأ الـ ref كقيمته مباشرة، أما في السكربت فاستخدم <code>.value</code>.</p>
<p><strong>جرّب:</strong> أضف زر <em>Reset</em> يعيد <code>count</code> إلى 0.</p>`,
    },
    computed: {
      title: 'القيم المحسوبة',
      body: `<p>تشتق <code>computed()</code> قيمة من قيم تفاعلية أخرى. لا تُعاد حسابها إلا عندما تتغيّر إحدى تلك القيم، وتُخزَّن نتيجتها مؤقتًا بين ذلك.</p>
<p><strong>جرّب:</strong> أضف قيمة محسوبة <code>isEven</code> واعرض “even” أو “odd” بجانب الرقم.</p>`,
    },
    lists: {
      title: 'الشروط والقوائم',
      body: `<p>تعرض <code>v-if</code> و<code>v-else</code> أحد الفرعين. وتعرض <code>v-for</code> عنصرًا لكل بند؛ ويحتاج كل بند إلى <code>:key</code> ثابت.</p>
<p><strong>جرّب:</strong> عندما لا توجد مهام، اعرض “Nothing to do.” بدل القائمة. انقر <em>Clear</em> للتحقق.</p>`,
    },
    forms: {
      title: 'النماذج',
      body: `<p>تربط <code>v-model</code> حقل إدخال بـ ref في الاتجاهين. وتعالج <code>@submit.prevent</code> النموذج دون إعادة تحميل الصفحة.</p>
<p><strong>جرّب:</strong> اجعل <em>Add</em> يضيف العنوان المكتوب إلى <code>todos</code> ويفرّغ الحقل.</p>`,
    },
    props: {
      title: 'المكوّنات والخصائص',
      body: `<p>استورد ملف <code>.vibe</code> آخر لتستخدمه كوسم. تعرّف <code>defineProps</code> ما يقبله المكوّن، بأنواع يتحقق منها المترجم في كل قالب يستخدمه.</p>
<p><strong>جرّب:</strong> افتح <code>TodoItem.vibe</code> وأضف خاصية <code>done</code>؛ مرّرها من <code>App.vibe</code> واعرض ✓ عندما تكون true.</p>`,
    },
    events: {
      title: 'الأحداث',
      body: `<p>يخبر المكوّن الابن أباه بأن شيئًا ما حدث بإطلاق حدث. تعرّف <code>defineEmits</code> الأحداث وحمولاتها، ويستمع الأب إليها بـ <code>@</code>.</p>
<p><strong>جرّب:</strong> اجعل زر <em>Remove</em> يطلق الحدث <code>remove</code>، واحذف المهمة في <code>App.vibe</code>.</p>`,
    },
    slots: {
      title: 'الفتحات (Slots)',
      body: `<p>يمكن للمكوّن أن يستقبل ترميزًا من أبيه. يحدّد <code>&lt;slot&gt;</code> مكانه؛ وتأخذ الفتحات المسمّاة <code>name</code>، ويملؤها الأب بـ <code>&lt;template #name&gt;</code>.</p>
<p><strong>جرّب:</strong> اجعل “Untitled” القيمة الافتراضية لفتحة <code>title</code>، ثم أضف بطاقة ثالثة دون عنوان.</p>`,
    },
    'v-model': {
      title: 'v-model على المكوّنات',
      body: `<p>تمنح <code>defineModel()</code> المكوّن قيمة باتجاهين: قراءتها تقرأ قيمة الأب، والإسناد إليها يحدّث الأب. ويربطها الأب بـ <code>v-model</code> كما في حقل الإدخال.</p>
<p><strong>جرّب:</strong> اجعل النقر على المفتاح يعكس <code>on</code>، فيتبعه النص في <code>App.vibe</code>.</p>`,
    },
    styles: {
      title: 'الأنماط المحصورة',
      body: `<p>تنطبق <code>&lt;style scoped&gt;</code> على ترميز هذا المكوّن فقط. وتبدّل <code>:class</code> الأصناف حسب الحالة.</p>
<p><strong>جرّب:</strong> أعطِ العنصر الصنف <code>done</code> عندما تكون <code>done</code> صحيحة، ليُشطب بنقرة.</p>`,
    },
    watchers: {
      title: 'المراقِبات',
      body: `<p>تشغّل <code>watch()</code> شيفرة عندما تتغيّر قيمة تفاعلية، مع القيمة الجديدة والقديمة. استخدمها للتأثيرات الجانبية مثل الحفظ أو التسجيل أو استدعاء واجهة برمجية.</p>
<p><strong>جرّب:</strong> احفظ <code>name</code> في <code>localStorage</code> داخل المراقِب واقرأه عند بدء المكوّن. أعد تحميل المعاينة بتعديل الشيفرة: يبقى الاسم.</p>`,
    },
    lifecycle: {
      title: 'دورة الحياة ومراجع القوالب',
      body: `<p>تعمل <code>onMounted</code> بعد أن يصبح المكوّن في الصفحة؛ وتعمل <code>onBeforeUnmount</code> قبل مغادرته، فتستطيع التراجع عمّا أعدّته <code>onMounted</code>. وتعطيك <code>useTemplateRef</code> العنصر الذي يحمل <code>ref</code> مطابقًا.</p>
<p><strong>جرّب:</strong> اعرض عرض النافذة وأبقه محدّثًا: أضف مستمعًا لـ <code>resize</code> في <code>onMounted</code> وأزله في <code>onBeforeUnmount</code>.</p>`,
    },
    'provide-inject': {
      title: 'التزويد والحقن',
      body: `<p>تتيح <code>provide()</code> قيمة لكل المكوّنات التي تحته، وتقرؤها <code>inject()</code> مهما كان العمق، دون تمرير الخصائص عبر كل مستوى. ويحمل <code>InjectionKey</code> نوع القيمة.</p>
<p><strong>جرّب:</strong> زوّد <code>user</code> في <code>App.vibe</code> تحت المفتاح <code>USER</code>، ليعرض <code>Avatar.vibe</code> الاسم. اكتب في الحقل: يتبعك الأفاتار.</p>`,
    },
    'global-styles': {
      title: 'main.ts والأنماط العامة',
      body: `<p>يبدأ التطبيق في <code>main.ts</code>: ينشئ التطبيق من المكوّن الجذر ويركّبه. ومن هناك تأتي أنماط CSS العامة أيضًا، باستيراد بسيط <code>import './styles.css'</code>. تنطبق القواعد العامة في كل مكان، أما <code>&lt;style scoped&gt;</code> فيبقى داخل مكوّنه.</p>
<p><strong>جرّب:</strong> استورد <code>styles.css</code> في <code>main.ts</code>، ثم غيّر <code>--accent</code> فيه وشاهد العنوان والزر يتبعانه.</p>`,
    },
    routing: {
      title: 'التوجيه',
      body: `<p>يربط الموجّه المسارات بمكوّنات الصفحات. يعرض <code>RouterView</code> الصفحة الحالية، وينتقل <code>RouterLink</code> دون إعادة تحميل. ويصبح <code>:id</code> في المسار <code>route.params.id</code>.</p>
<p><strong>جرّب:</strong> أضف رابطًا إلى المستخدم 2 في <code>App.vibe</code>، ثم افتحه وعُد إلى الرئيسية.</p>`,
    },
    'loading-data': {
      title: 'تحميل البيانات',
      body: `<p>تشغّل <code>useAsync()</code> دالة غير متزامنة عند تركيب المكوّن، وتعطيك <code>data</code> و<code>error</code> و<code>loading</code> و<code>refresh()</code>. وتلغي التشغيل الذي لم يعد مطلوبًا عبر <code>signal</code> التي تمرّرها.</p>
<p><strong>جرّب:</strong> اعرض “Loading…” أثناء التشغيل، وأضف زر <em>Roll again</em> يستدعي <code>refresh()</code>.</p>`,
    },
    contracts: {
      title: 'العقود ذات الأنواع',
      body: `<p>هذا ما يجعل vibe.js متكاملًا. يعرّف <code>contract.ts</code> كل مسار مرة واحدة. يعالجه الخادم، ويعطي <code>createClient</code> الواجهة دالة لكل مسار، مستمدّة أنواعها من العقد نفسه: الحقل الذي يتغيّر اسمه يصبح خطأ أنواع في الطرفين. لا يرمي الاستدعاء أخطاءً أبدًا؛ بل يعيد <code>{ ok: true, data }</code> أو <code>{ ok: false, error }</code>.</p>
<p><strong>جرّب:</strong> حمّل المهمة ذات المعرّف 3 عبر <code>api.todos.one</code> واعرض عنوانها، أو “Not found” عندما يكون <code>error.code</code> هو <code>TODO_NOT_FOUND</code>.</p>`,
    },
  },
};
