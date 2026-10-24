# تحميل البيانات

تحمّل `useAsync()` من `@usevibejs/ui` البيانات داخل المكوّن وتبقيها محدّثة. ومع عميل API ذي الأنواع، يُلغى كل طلب حين لا تعود بحاجة إليه، وتصلك كل نتيجة، بما فيها حالات الفشل، قيمةً لها نوع محدّد.

## useAsync {#useasync}

تستدعي `useAsync(fn)` الدالة `fn(signal)` فورًا، وتعيد أربع قيم:

- `data`: ref يحمل القيمة التي انتهى إليها آخر تشغيل، أو `undefined` قبل أن ينتهي التشغيل الأول.
- `error`: ref يحمل ما رماه آخر تشغيل، أو `undefined`.
- `loading`: ref قيمته `true` ما دام هناك تشغيل جارٍ.
- `refresh()`: تشغّل `fn` من جديد. يُحسم الـ promise بعد انتهاء هذا التشغيل، ولا يُرفض أبدًا.

تحمّل صفحة المهمة في التطبيق المثال مهمة واحدة بحسب المعرّف الموجود في URL:

```vibe
<script setup lang="ts">
import { inject, useAsync } from '@usevibejs/ui';
import { useRoute } from '@usevibejs/ui/router';
import { API } from '../api.ts';

const api = inject(API)!;
const route = useRoute('todo');
const { data: todo } = useAsync((signal) =>
  api.todos.get({ params: { id: route.params.id } }, { signal }),
);
</script>

<template>
  <section>
    <h1 v-if="todo?.ok">{{ todo.data.title }}</h1>
    <p v-else-if="todo" class="error">{{ todo.error.code }}</p>
  </section>
</template>
```

`API` هو مفتاح الحقن الذي يوفّر التطبيق عميله تحته.

تعرض `loading` و`refresh()` حالة التقدّم، وتعيدان التحميل عند الطلب:

```vibe
<script setup lang="ts">
import { useAsync } from '@usevibejs/ui';

const { data, loading, refresh } = useAsync(async (signal) => {
  const res = await fetch('/api/health', { signal });
  return (await res.json()) as { status: string };
});
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else>Status: {{ data?.status ?? 'unknown' }}</p>
  <button type="button" :disabled="loading" @click="refresh()">Reload</button>
</template>
```

## التتبّع وإعادة التشغيل {#tracking-and-reruns}

تعمل `fn` من جديد إذا تغيّرت قيمة تفاعلية قرأتها **قبل أول `await`**. في المثال أعلاه تُقرأ `route.params.id` بشكل متزامن، فإذا انتقلت من `/todos/1` إلى `/todos/2` تُحمَّل المهمة الجديدة والصفحة باقية على الشاشة. القيمة التي تُقرأ بعد `await` لا تُتتبَّع، فاقرأ كل المدخلات أولًا ثم انتظر.

```ts
const query = ref('');
const page = ref(1);

const results = useAsync(async (signal) => {
  const q = query.value; // tracked
  const p = page.value; // tracked
  return search(q, p, signal);
});
```

## الإلغاء {#aborting}

لكل تشغيل `AbortSignal` خاص به. عند بدء تشغيل جديد تُلغى إشارة التشغيل السابق، وعند فك المكوّن تُلغى الإشارة الحالية. مرّر الإشارة إلى استدعاء العميل، `{ signal }`، أو إلى `fetch`، ليتوقف الطلب. التشغيل الملغى لا يكتب في `data` ولا `error` ولا `loading`، فلا يمكن لاستجابة بطيئة أن تكتب فوق استجابة أحدث منها.

مكان `useAsync()` هو setup، أو دالة مركّبة يستدعيها setup. فهي تحتاج إلى مكوّن أو نطاق تأثيرات (effect scope) يملكها ([VIBE7301](https://vibejs.org/v0/errors/VIBE7301)).

## نتائج ذات أنواع {#typed-results}

لا يرفض عميل API أبدًا بسبب فشل HTTP أو فشل في الشبكة. كل استدعاء ينتهي إلى نتيجة، إما `{ ok: true, data }` وإما `{ ok: false, error }`. لذلك تصل حالات الفشل مع العميل في `data`، ولا يحمل `error` إلا الأخطاء البرمجية الحقيقية، مثل استثناء داخل `fn`.

افحص `ok` قبل أن تقرأ البيانات: في القالب بـ `v-if="data?.ok"`، وفي السكربت بـ `data.value?.ok`.

```ts
const { data } = useAsync((signal) => health({ signal }));

const status = computed(() =>
  data.value?.ok ? data.value.data.status : (data.value?.error.code ?? 'checking'),
);
```

قيمة `error.code` واحد من الرموز التي يعرّفها المسار في عقده، أو رمز من العميل مثل `NETWORK_ERROR`. لذلك يتحقق TypeScript من أي `switch` عليها.

## الحالة المشتركة {#shared-state}

الحالة التي تقرؤها عدة مكوّنات، مثل المستخدم المسجّل دخوله أو سلة المشتريات، مكانها وحدة (module). أنشئها مرة واحدة في نطاق الوحدة، واكشفها عبر دالة مركّبة.

```ts
import { computed, readonly, ref } from '@usevibejs/ui';

interface Item {
  id: number;
  price: number;
}

const items = ref<Item[]>([]);
const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0));

export function useCart() {
  return {
    items: readonly(items),
    total,
    add(item: Item) {
      items.value.push(item);
    },
    clear() {
      items.value = [];
    },
  };
}
```

كل مكوّن يستدعي `useCart()` يقرأ الحالة نفسها ويغيّرها، ويفك القالب الـ refs كالمعتاد. اجعل الكتابة محصورة في دوال الدالة المركّبة، حتى يمر كل تغيير من مكان واحد. وفي الاختبارات، أعد ضبط الحالة بـ `clear()` داخل `beforeEach`، لأن الوحدة تبقى محمّلة بين اختبارات الملف الواحد.

أما الحالة التي تخص جزءًا واحدًا من الشجرة، أو التي يجب أن يستبدلها الاختبار، فوفّرها بـ `provide()` واقرأها بـ `inject()`.

## انظر أيضًا {#see-also}

- [التوجيه](https://vibejs.org/v0/ui/routing): المعاملات، وguards، والصفحات الكسولة التحميل.
- [اختبار المكوّنات](https://vibejs.org/v0/ui/testing#waiting-for-async-work): `flushPromises()` بعد تحميل البيانات.
