# دورة الحياة

يعمل setup الخاص بالمكوّن مرة واحدة، عند إنشاء المكوّن. أما خطّافات دورة الحياة فتسجّل دوالًا تعمل في مراحل لاحقة. تستدعي هذه الخطّافات أثناء setup وبشكل متزامن، وأي استدعاء لها في مكان آخر، كأن يأتي بعد `await`، يطلق التحذير VIBE5205.

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

## الخطّافات {#the-hooks}

| الخطّاف            | متى يعمل                                           |
| ----------------- | -------------------------------------------------- |
| `onBeforeMount`   | بعد إنشاء DOM المكوّن، وقبل إدراجه في المستند       |
| `onMounted`       | بعد إدراج DOM، وقد ضُبطت مراجع القالب               |
| `onBeforeUpdate`  | قبل أن يحدّث تغيّرُ الحالة DOM المكوّن                 |
| `onUpdated`       | بعد التحديث، مرة واحدة لكل دفعة من التغييرات       |
| `onBeforeUnmount` | قبل إزالة المكوّن، وما زال DOM ومراجع القالب موجودة |
| `onUnmounted`     | بعد إزالة المكوّن وإيقاف مراقِباته                   |
| `onErrorCaptured` | حين يرمي أحد الأحفاد خطأً؛ انظر [الأخطاء](#errors)    |

التأثيرات التي تجهّز شيئًا خارج المكوّن، مثل المستمعين على `window` أو مؤقت أو observer، تبدأ في `onMounted` وتتوقف في `onBeforeUnmount` أو `onUnmounted`. أما المراقِبات وقيم computed التي تنشئها في setup فتتوقف وحدها. وتسجّل `onScopeDispose()` دالة تنظيف تعمل عند الفك أيضًا، وتعمل كذلك في الدوال المركّبة التي تُستدعى خارج أي مكوّن.

## ترتيب الخطّافات {#hook-order}

- **التركيب:** ينشئ كل مكوّن DOM الخاص به، ثم يشغّل `onBeforeMount`، ثم يدرج DOM. المكوّن الابن ينشئ DOM الخاص به ويدرجه بينما يبني أبوه DOM الخاص به، لذلك يعمل `onBeforeMount` و`onMounted` في الابن قبل نظيريهما في الأب. وحين يعمل `onMounted` تكون الشجرة الفرعية كلها في المستند.
- **التحديث:** تغيّر الحالة لا يعيد تشغيل إلا الروابط التي تقرؤها، في دفعة واحدة قبل أن يرسم المتصفح. ويعمل `onBeforeUpdate` و`onUpdated` لكل مكوّن تعمل روابط قالبه في تلك الدفعة.
- **الفك:** يعمل `onBeforeUnmount` في الأب قبل أبنائه، وتعمل خطّافات `onUnmounted` بعد إزالة DOM.

يعمل `onBeforeMount` بعد بناء DOM، فتشير مراجع القالب عندها إلى العناصر، لكن العناصر لم تدخل المستند بعد: لا تخطيط لها ولا أبعاد.

## الأخطاء {#errors}

الخطأ الذي يُرمى في setup، أو في رابط من روابط القالب، أو في مراقِب، أو في معالج حدث، أو في خطّاف، يصعد في شجرة المكوّنات:

1. يعمل خطّاف `onErrorCaptured(err, instance, info)` في كل سلف، بدءًا بالأقرب. `instance` هو المكوّن الذي وقع فيه الخطأ، و`info` يذكر المصدر، مثل `'render effect'` أو `'native event handler'`. إذا أعاد الخطّاف `false` يتوقف الخطأ عنده.
2. إن لم يوقفه أي خطّاف، يستقبله `app.config.errorHandler`.
3. إن لم يوجد `errorHandler`، يُسجَّل الخطأ بالرمز [VIBE5102](https://vibejs.org/v0/errors/VIBE5102)، ومعه تتبّع المكوّنات أثناء التطوير.

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

المكوّن الذي يرمي setup أو العرض فيه خطأً لا يعرض شيئًا، ويبقى باقي الصفحة يعمل. لا يمكن أن يكون setup `async`، ولا يمكن أن يستخدم `<script setup>` `await` في المستوى الأعلى ([VIBE3002](https://vibejs.org/v0/errors/VIBE3002)، [VIBE5204](https://vibejs.org/v0/errors/VIBE5204)). ابدأ العمل في setup، وخزّن النتيجة في ref حين تصل.
