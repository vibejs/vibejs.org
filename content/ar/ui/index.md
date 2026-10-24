# أساسيات الواجهة

تتألف واجهة تطبيق vibe.js من مكوّنات تكتبها في ملفات `.vibe`، ومن الحالة التفاعلية التي تقرؤها هذه المكوّنات. كل ما يستورده المكوّن مصدره `@usevibejs/ui`. ويتحقق المترجم وأدوات اللغة من الأنواع في السكربت والقالب معًا.

## مكوّن {#a-component}

يضم ملف `.vibe` ثلاث كتل على الأكثر: سكربت الإعداد، والقالب، والأنماط المحصورة في المكوّن.

```vibe
<script setup lang="ts">
import { computed, ref } from '@usevibejs/ui';

const { label = 'Count' } = defineProps<{ label?: string }>();

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<template>
  <button type="button" @click="count++">{{ label }}: {{ count }} (twice: {{ doubled }})</button>
</template>

<style scoped>
button {
  font-weight: 600;
}
</style>
```

- يعمل `<script setup lang="ts">` مرة واحدة لكل نسخة من المكوّن. المتغيرات والاستيرادات في مستواه الأعلى متاحة في القالب، وفيه تُفك قيم refs تلقائيًا: تكتب في القالب `count`، وفي السكربت `count.value`.
- يصف `<template>` بنية DOM. يحوّله المترجم إلى شيفرة تنشئ العناصر مرة واحدة، ثم لا تحدّث إلا النصوص والسمات والقوائم التي تقرأ حالة تغيّرت.
- لا يطبَّق `<style scoped>` إلا على عناصر هذا المكوّن.

`defineProps` وبقية استدعاءات `define*` وحدات ماكرو يعالجها المترجم، فلا تحتاج إلى استيرادها. تجد قائمتها في صفحة [المكوّنات](https://vibejs.org/v0/ui/components).

## تركيب التطبيق {#mounting-the-app}

تأخذ `createApp()` المكوّن الجذر. وتعرضه `mount()` داخل عنصر تمرّره إليها أو داخل العنصر الذي يطابقه محدِّد، فتستبدل محتواه.

```ts
const app = createApp(App);

app.config.errorHandler = (err, instance, info) => {
  console.error(`Error in ${instance?.name ?? 'the app'} (${info})`, err);
};
app.config.warnHandler = (message, instance, trace) => {
  console.warn(message, trace);
};

app.mount('#app');
```

في التطبيق الحقيقي، `App` هو الاستيراد الافتراضي من `./App.vibe`.

- يستقبل `errorHandler` كل خطأ لم يوقفه خطّاف `onErrorCaptured`: الأخطاء التي تُرمى في setup، أو أثناء العرض، أو في مراقِب، أو في معالج حدث، أو في خطّاف من خطّافات دورة الحياة. ويذكر `info` مصدر الخطأ، مثل `'setup function'` أو `'native event handler'`. إن لم تضع معالجًا، يُسجَّل الخطأ بالرمز [VIBE5102](https://vibejs.org/v0/errors/VIBE5102).
- يستقبل `warnHandler` تحذيرات التطوير بدلًا من أن تذهب إلى الطرفية، ومعها تتبّع بأسماء المكوّنات. لا تظهر هذه التحذيرات في بناء الإنتاج.
- يفك `app.unmount()` المكوّن الجذر ويزيل عُقده من الصفحة.

## التحديث الفوري {#hot-updates}

أثناء التطوير، يكفي أن تحفظ ملف `.vibe` لتتحدّث الصفحة المفتوحة دون إعادة تحميل:

- إذا عدّلت القالب، تُعرض كل نسخة من المكوّن من جديد وتحتفظ بحالة setup الخاصة بها. أما المكوّنات الأبناء التي يعرضها هذا القالب فتُنشأ من جديد، فتبدأ حالتها من الصفر.
- إذا عدّلت السكربت، يُركَّب المكوّن من جديد بحالة جديدة.

## إلى أين بعد ذلك {#where-to-go-next}

- [التفاعلية](https://vibejs.org/v0/ui/reactivity): `ref` و`reactive` و`computed` و`watch` وبقية الأدوات الأساسية.
- [صياغة القوالب](https://vibejs.org/v0/ui/template-syntax): الإدراج، والربط، والأحداث، والشروط، والقوائم، و`v-model`، ومراجع القالب.
- [المكوّنات](https://vibejs.org/v0/ui/components): الخصائص (props)، والأحداث، وslots، والنماذج، والسمات، والقيم المكشوفة.
- [دورة الحياة](https://vibejs.org/v0/ui/lifecycle): خطّافات دورة الحياة، وترتيبها، ومعالجة الأخطاء.
- [التوفير والحقن](https://vibejs.org/v0/ui/provide-inject): تمرير القيم إلى أسفل شجرة المكوّنات.
- [توسيع vibe.js](https://vibejs.org/v0/guides/extending): الإضافات والدوال المركّبة (composables).
