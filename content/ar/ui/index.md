# أساسيات واجهة المستخدم

تتكوّن واجهة تطبيق vibe.js من مكوّنات مكتوبة في ملفات `.vibe` ومن الحالة التفاعلية التي تقرؤها. كل ما يستورده المكوّن يأتي من `@usevibejs/ui`؛ ويفحص المترجم وأدوات اللغة أنواع السكربت والقالب معًا.

## مكوّن {#a-component}

يحتوي ملف `.vibe` على ثلاث كتل على الأكثر: سكربت الإعداد، والقالب، والأنماط المحصورة النطاق.

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

- يعمل `<script setup lang="ts">` مرة واحدة لكل نسخة من المكوّن. ارتباطاته واستيراداته من المستوى الأعلى متاحة في القالب، وتُفك فيه تغليفات المراجع: يكتب القالب `count`، ويكتب السكربت `count.value`.
- يصف `<template>` الـ DOM. يُترجم إلى شيفرة تنشئ العناصر مرة واحدة وتحدّث فقط النصوص والسمات والقوائم التي تقرأ حالة تغيّرت.
- ينطبق `<style scoped>` على عناصر هذا المكوّن فقط.

`defineProps` وبقية استدعاءات `define*` هي ماكرو للمترجم: وهي متاحة دون استيراد. تسردها صفحة [المكوّنات](https://vibejs.org/v0/ui/components).

## تركيب التطبيق {#mounting-the-app}

تأخذ `createApp()` المكوّن الجذري؛ وتعرضه `mount()` داخل عنصر أو داخل العنصر الذي يطابقه محدِّد، مستبدلةً محتواه.

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

في تطبيق حقيقي، يكون `App` هو الاستيراد الافتراضي من `./App.vibe`.

- يتلقى `errorHandler` كل خطأ لم يوقفه أي خطاف `onErrorCaptured`: الأخطاء المرمية في setup أو في العرض أو في watcher أو في معالج حدث أو في خطاف دورة حياة. يسمّي `info` المصدر، مثل `'setup function'` أو `'native event handler'`. وبدون معالج، يُسجَّل الخطأ بالرمز [VIBE5102](https://vibejs.org/v0/errors/VIBE5102).
- يتلقى `warnHandler` تحذيرات التطوير بدلًا من وحدة التحكم، مع أثر لأسماء المكوّنات. لا تُصدر التحذيرات في إصدارات الإنتاج.
- يلغي `app.unmount()` تركيب المكوّن الجذري ويزيل عُقده.

## التحديثات الساخنة {#hot-updates}

أثناء التطوير، يؤدي حفظ ملف `.vibe` إلى تحديث الصفحة العاملة دون إعادة تحميل:

- تعديل القالب يعيد عرض كل نسخة من المكوّن ويحتفظ بحالة setup الخاصة بها. أما المكوّنات الأبناء التي يعرضها ذلك القالب فتُنشأ من جديد، فتبدأ حالتها الخاصة من الصفر.
- تعديل السكربت يعيد تركيب المكوّن بحالة جديدة.

## إلى أين تذهب بعد ذلك {#where-to-go-next}

- [التفاعلية](https://vibejs.org/v0/ui/reactivity): `ref` و`reactive` و`computed` و`watch` وبقية الأساسيات.
- [صيغة القالب](https://vibejs.org/v0/ui/template-syntax): الاستيفاء والربط والأحداث والشروط والقوائم و`v-model` والمراجع القالبية.
- [المكوّنات](https://vibejs.org/v0/ui/components): الخصائص والأحداث والفتحات والنماذج والسمات والقيم المكشوفة.
- [دورة الحياة](https://vibejs.org/v0/ui/lifecycle): خطافات دورة الحياة وترتيبها ومعالجة الأخطاء.
- [Provide وinject](https://vibejs.org/v0/ui/provide-inject): تمرير القيم إلى أسفل شجرة المكوّنات.
- [توسيع vibe.js](https://vibejs.org/v0/guides/extending): الإضافات والـ composables.
