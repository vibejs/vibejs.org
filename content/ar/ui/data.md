# تحميل البيانات

تحمّل `useAsync()` من `@usevibejs/ui` البيانات داخل المكوّن وتُبقيها محدَّثة. وبالتعاون مع عميل API المُنمَّط، يُلغى كل طلب عندما لا تعود هناك حاجة إليه، وتكون كل نتيجة، بما فيها حالات الفشل، قيمة مُنمَّطة.

## useAsync {#useasync}

تستدعي `useAsync(fn)` الدالة `fn(signal)` فورًا وتعيد أربع قيم:

- `data`: مرجع بالقيمة التي انتهى إليها آخر تشغيل، أو `undefined` قبل انتهاء أول تشغيل.
- `error`: مرجع بما رماه آخر تشغيل، أو `undefined`.
- `loading`: مرجع قيمته `true` أثناء جريان تشغيل.
- `refresh()`: تشغّل `fn` من جديد؛ ويُحلّ الوعد (promise) عند انتهاء ذلك التشغيل، ولا يُرفض أبدًا.

تحمّل صفحة المهمة في التطبيق النموذجي مهمة واحدة بحسب المعرّف الموجود في عنوان URL:

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

يعرض `loading` و`refresh()` التقدّم ويعيدان التحميل عند الطلب:

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

تعمل `fn` من جديد عندما تتغير قيمة تفاعلية قرأتها **قبل أول `await`**. في المثال أعلاه تُقرأ `route.params.id` بشكل متزامن، فالانتقال من `/todos/1` إلى `/todos/2` يحمّل المهمة الجديدة بينما تبقى الصفحة معروضة. القيمة التي تُقرأ بعد `await` لا تُتتبَّع: اقرأ كل المدخلات أولًا، ثم انتظر.

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

يحصل كل تشغيل على `AbortSignal` خاص به. عند بدء تشغيل جديد يُلغى الإشارة السابقة؛ وعند إلغاء تركيب المكوّن تُلغى الإشارة الحالية. مرّر الإشارة إلى استدعاء العميل، `{ signal }`، أو إلى `fetch`، حتى يتوقف الطلب. التشغيل الملغى لا يكتب أبدًا في `data` أو `error` أو `loading`، ولذلك لا يمكن لاستجابة بطيئة أن تحل محل استجابة أحدث.

مكان `useAsync()` هو setup أو composable تستدعيه setup؛ فهي تحتاج إلى مكوّن أو نطاق تأثير (effect scope) يملكها ([VIBE7301](https://vibejs.org/v0/errors/VIBE7301)).

## النتائج المُنمَّطة {#typed-results}

لا يرفض عميل API أبدًا عند حدوث فشل في HTTP أو الشبكة: كل استدعاء يُحَلّ إلى نتيجة هي إما `{ ok: true, data }` أو `{ ok: false, error }`. لذلك تصل حالات الفشل مع العميل داخل `data`، ويحمل `error` الأخطاء البرمجية الحقيقية فقط، مثل استثناء داخل `fn`.

تحقّق من `ok` قبل قراءة الحمولة: في القالب باستخدام `v-if="data?.ok"`، وفي السكربت باستخدام `data.value?.ok`.

```ts
const { data } = useAsync((signal) => health({ signal }));

const status = computed(() =>
  data.value?.ok ? data.value.data.status : (data.value?.error.code ?? 'checking'),
);
```

`error.code` هو أحد الرموز التي يصرّح بها المسار في عقده (contract)، أو رمز من العميل مثل `NETWORK_ERROR`، ولذلك يفحص TypeScript أي `switch` عليه.

## الحالة المشتركة {#shared-state}

الحالة التي تقرؤها عدة مكوّنات، مثل المستخدم المسجّل دخوله أو سلة المشتريات، تعيش في وحدة (module): أنشئها مرة واحدة على مستوى الوحدة واكشفها عبر composable.

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

كل مكوّن يستدعي `useCart()` يقرأ الحالة نفسها ويغيّرها، ويفك القالب تغليف المراجع كالمعتاد. أبقِ عمليات الكتابة داخل دوال الـ composable، حتى يمرّ كل تغيير عبر مكان واحد. وفي الاختبارات، أعد ضبط الحالة بـ `clear()` داخل `beforeEach`، لأن الوحدة تبقى محمّلة بين اختبارات الملف نفسه.

أما الحالة التي تخص جزءًا واحدًا من الشجرة، أو التي يجب أن يستبدلها اختبار، فوفّرها بـ `provide()` واقرأها بـ `inject()` بدلًا من ذلك.

## انظر أيضًا {#see-also}

- [التوجيه](https://vibejs.org/v0/ui/routing): المعاملات والحراس والصفحات المحمّلة كسولًا.
- [اختبار المكوّنات](https://vibejs.org/v0/ui/testing#waiting-for-async-work): `flushPromises()` بعد تحميل البيانات.
