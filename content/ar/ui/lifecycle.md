# دورة الحياة

يعمل setup الخاص بالمكوّن مرة واحدة عند إنشاء المكوّن. وتسجّل خطافات دورة الحياة دوال تعمل في مراحل لاحقة. تُستدعى الخطافات أثناء setup وبشكل متزامن: الخطاف المستدعى في أي مكان آخر، مثل ما بعد `await`، يُصدر تحذيرًا VIBE5205.

```vibe
<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from '@usevibejs/ui';

const box = useTemplateRef<HTMLDivElement>('box');
const width = ref(0);
const observer = new ResizeObserver(([entry]) => (width.value = entry?.contentRect.width ?? 0));

onMounted(() => {
  if (box.value) observer.observe(box.value);
});
onUpdated(() => console.log('rendered', width.value));
onBeforeUnmount(() => observer.disconnect());
</script>

<template>
  <div ref="box">{{ width }}px wide</div>
</template>
```

## الخطافات {#the-hooks}

| الخطاف            | وقت التشغيل                                                 |
| ----------------- | ----------------------------------------------------------- |
| `onBeforeMount`   | بعد إنشاء DOM المكوّن وقبل إدراجه في المستند                 |
| `onMounted`       | بعد إدراج DOM؛ وتكون المراجع القالبية قد ضُبطت               |
| `onBeforeUpdate`  | قبل أن يحدّث تغيّر في الحالة DOM المكوّن                       |
| `onUpdated`       | بعد التحديث، مرة واحدة لكل دفعة من التغييرات                |
| `onBeforeUnmount` | قبل إزالة المكوّن؛ ويظل DOM والمراجع القالبية موجودين        |
| `onUnmounted`     | بعد إزالة المكوّن وإيقاف مراقباته (watchers)                 |
| `onErrorCaptured` | عندما يرمي أحد المكوّنات التابعة خطأ؛ انظر [الأخطاء](#errors) |

التأثيرات التي تُعدّ شيئًا خارج المكوّن، مثل المستمعات على `window` أو مؤقّت أو مراقِب (observer)، تبدأ في `onMounted` وتتوقف في `onBeforeUnmount` أو `onUnmounted`. أما المراقبات (watchers) والقيم المحسوبة المنشأة في setup فتتوقف من تلقاء نفسها. وتسجّل `onScopeDispose()` عملية تنظيف تعمل عند إلغاء التركيب أيضًا، وتعمل كذلك في الـ composables المستدعاة خارج أي مكوّن.

## ترتيب الخطافات {#hook-order}

- **التركيب:** ينشئ كل مكوّن DOM الخاص به، ثم يشغّل `onBeforeMount`، ثم يُدرج DOM. ينشئ المكوّن الابن DOM الخاص به ويُدرجه بينما يبني المكوّن الأب DOM الخاص به، ولذلك يعمل `onBeforeMount` و`onMounted` للابن قبل الأب. وعند تشغيل `onMounted` تكون الشجرة الفرعية كلها في المستند.
- **التحديث:** يعيد تغيّر الحالة تشغيل الارتباطات التي تقرؤها فقط، في دفعة واحدة قبل أن يرسم المتصفح. يعمل `onBeforeUpdate` و`onUpdated` لكل مكوّن تعمل ارتباطات قالبه ضمن تلك الدفعة.
- **إلغاء التركيب:** يعمل `onBeforeUnmount` للأب قبل أبنائه؛ وتعمل خطافات `onUnmounted` بعد إزالة DOM.

يعمل `onBeforeMount` بعد بناء DOM، ولذلك تشير المراجع القالبية إلى العناصر فعلًا، لكنها لم تدخل المستند بعد: فليس لها تخطيط ولا حجم.

## الأخطاء {#errors}

الخطأ المرمي في setup أو في ارتباط قالبي أو في watcher أو في معالج حدث أو في خطاف ينتقل صعودًا في شجرة المكوّنات:

1. يعمل خطاف `onErrorCaptured(err, instance, info)` لكل سلف، بدءًا بالأقرب. `instance` هو المكوّن الذي حدث فيه الخطأ، ويسمّي `info` المصدر، مثل `'render effect'` أو `'native event handler'`. وإعادة `false` توقف الخطأ عند ذلك الحد.
2. إذا لم يوقفه أي خطاف، يتلقاه `app.config.errorHandler`.
3. وبدون `errorHandler`، يُسجَّل الخطأ بالرمز [VIBE5102](https://vibejs.org/v0/errors/VIBE5102)، مع أثر المكوّنات أثناء التطوير.

```vibe
<script setup lang="ts">
import { onErrorCaptured, ref } from '@usevibejs/ui';
import Chart from './Chart.vibe';

const failed = ref(false);

onErrorCaptured((err, instance, info) => {
  console.warn(`${instance?.name ?? 'A component'} failed in ${info}`, err);
  failed.value = true;
  return false;
});
</script>

<template>
  <p v-if="failed">The chart is not available.</p>
  <Chart v-else />
</template>
```

المكوّن الذي يرمي setup أو عرضه خطأ لا يعرض شيئًا، وتواصل بقية الصفحة العمل. لا يمكن أن يكون setup دالة `async`، ولا يمكن لـ `<script setup>` استخدام `await` على المستوى الأعلى ([VIBE3002](https://vibejs.org/v0/errors/VIBE3002)، [VIBE5204](https://vibejs.org/v0/errors/VIBE5204)): ابدأ العمل في setup وخزّن النتيجة في ref عند وصولها.
