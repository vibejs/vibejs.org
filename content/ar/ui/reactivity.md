# التفاعلية

القيم التفاعلية تسجّل من يقرؤها. حين تتغيّر قيمة، تعمل من جديد قيم computed والمراقِبات وروابط القوالب التي قرأتها، ولا شيء غيرها. تستورد كل هذه الدوال من `@usevibejs/ui`.

## ref {#ref}

يحمل `ref()` قيمة واحدة في `.value`. إذا كانت القيمة كائنًا، يصبح تفاعليًا بالعمق، فتُتتبَّع التغييرات في خصائصه المتداخلة أيضًا.

```ts
import { ref } from '@usevibejs/ui';

const count = ref(0);
count.value++;

const user = ref({ name: 'Ada', tags: ['admin'] });
user.value.tags.push('editor'); // tracked
```

يحمل `ref<T>()` بلا وسيط النوع `T | undefined`. في القالب، وداخل كائن `reactive()`، تُفك قيمة الـ ref: تكتب في القالب `count` لا `count.value`.

## shallowRef {#shallowref}

لا يتتبّع `shallowRef()` إلا الإسناد إلى `.value`. استخدمه للقيم الكبيرة التي تستبدلها كاملة بدل تعديلها في مكانها، وللكائنات التي يجب أن تبقى عادية، مثل نسخ الأصناف من مكتبة ما.

```ts
import { shallowRef, triggerRef } from '@usevibejs/ui';

const rows = shallowRef<number[]>([]);
rows.value = [...rows.value, 1]; // tracked

rows.value.push(2); // not tracked
triggerRef(rows); // runs what reads rows now
```

تُبقي `markRaw(object)` الكائن عاديًا أينما خزّنته، حتى داخل حالة تفاعلية.

## reactive وreadonly {#reactive-and-readonly}

تعيد `reactive()` وكيلًا (proxy) تفاعليًا بالعمق لكائن أو مصفوفة أو `Map` أو `Set`. وتُفك الـ refs المتداخلة عند قراءتها.

```ts
import { reactive, readonly, ref } from '@usevibejs/ui';

const state = reactive({ count: ref(0), items: new Map<string, number>() });
state.count++; // no .value: the nested ref is unwrapped
state.items.set('a', 1);

const view = readonly(state);
// view.count++ fails to type-check, and warns VIBE5002 at runtime
```

- الوكيل ليس الكائن الأصلي، فقارن بـ `toRaw(value)` حين تهمّك الهوية.
- إذا استبدلت كائن `reactive()` كاملًا انقطع الاتصال. احفظه في `ref()` بدلًا من ذلك، أو غيّر خصائصه.
- لا تطبَّق `shallowReactive()` و`shallowReadonly()` إلا على خصائص المستوى الأعلى.
- تفحص `isRef()` و`isReactive()` و`isReadonly()` و`isShallow()` و`isProxy()` نوع القيمة.

## computed {#computed}

تشتق `computed()` قيمة من قيم تفاعلية أخرى. لا تعمل إلا إذا قُرئت بعد تغيّر أحد مصادرها، وتبقى نتيجتها مخزّنة حتى ذلك الحين.

```ts
import { computed, ref } from '@usevibejs/ui';

const first = ref('Ada');
const last = ref('Lovelace');

const full = computed(() => `${first.value} ${last.value}`);

const editable = computed({
  get: () => `${first.value} ${last.value}`,
  set(value: string) {
    [first.value = '', last.value = ''] = value.split(' ');
  },
});
editable.value = 'Grace Hopper';
```

قيمة computed التي لها دالة جلب فقط تكون للقراءة فقط. تستقبل دالة الجلب القيمة السابقة، وهذا يساعدك على إعادة الكائن نفسه حين لا يتغيّر شيء مهم. لا ينبغي أن تغيّر دالة الجلب الحالة، فهذا عمل المراقِب.

## watch {#watch}

تستدعي `watch(source, callback, options?)` الدالة `callback(value, oldValue, onCleanup)` حين يتغيّر المصدر. المصدر ref أو computed أو دالة جلب أو كائن تفاعلي أو مصفوفة منها.

```ts
import { reactive, ref, watch } from '@usevibejs/ui';

const query = ref('');
const filters = reactive({ done: false });

watch(query, (value, oldValue) => {
  console.log(`query: ${oldValue} -> ${value}`);
});

// A getter watches part of an object.
watch(
  () => filters.done,
  (done) => console.log(done),
);

// An array watches several sources.
watch([query, () => filters.done], ([text, done]) => console.log(text, done));

// A reactive object is watched deeply.
watch(filters, (value) => console.log(value.done));
```

الخيارات:

- `immediate: true` يستدعي الدالة مرة فورًا، والقيمة القديمة `undefined`.
- `deep: true` يتتبّع القيم المتداخلة في مصدر من نوع ref أو دالة جلب. وإذا مرّرت رقمًا، يتتبّع ذلك العدد من المستويات.
- `once: true` يوقف المراقِب بعد الاستدعاء الأول.
- `flush` يحدّد متى تعمل الدالة: `'pre'` (الافتراضي) قبل تحديث DOM، و`'post'` بعده، و`'sync'` داخل الإسناد نفسه.

المقبض المعاد يوقف المراقِب إذا استدعيته، وفيه `stop()` و`pause()` و`resume()`. والمراقِب الذي تنشئه في setup المكوّن يتوقف عند فك المكوّن.

## watchEffect {#watcheffect}

تشغّل `watchEffect(effect)` الدالة `effect` الآن، ثم كلما تغيّر شيء قرأته. و`watchPostEffect()` و`watchSyncEffect()` هما صيغتا `'post'` و`'sync'`.

```ts
import { onWatcherCleanup, ref, watchEffect } from '@usevibejs/ui';

const id = ref(1);

watchEffect(() => {
  const controller = new AbortController();
  void fetch(`/api/items/${id.value}`, { signal: controller.signal });
  // Runs before the effect runs again, and when it stops.
  onWatcherCleanup(() => controller.abort());
});
```

تسجّل `onWatcherCleanup()` دالة تنظيف للمراقِب أو التأثير الجاري. والوسيط `onCleanup` في الدالة يفعل الشيء نفسه، ويعمل أيضًا بعد `await`.

## نطاقات التأثيرات {#effect-scopes}

المراقِبات وقيم computed التي تُنشأ أثناء `scope.run()` تنتمي إلى النطاق، و`scope.stop()` يوقفها كلها. يعمل setup المكوّن في نطاق خاص به، لذلك لا يحتاج معظم الكود إلى إنشاء نطاق. استخدم `effectScope()` للحالة التي تعيش خارج المكوّنات.

```ts
import { effectScope, onScopeDispose, ref, watch } from '@usevibejs/ui';

const scope = effectScope();

scope.run(() => {
  const width = ref(window.innerWidth);
  const update = () => (width.value = window.innerWidth);
  window.addEventListener('resize', update);
  onScopeDispose(() => window.removeEventListener('resize', update));
  watch(width, (value) => console.log(value));
});

scope.stop(); // stops the watcher and removes the listener
```

تسجّل `onScopeDispose()` دالة تنظيف على النطاق الحالي، وفي المكوّن تعمل عند فكّه. وتعيد `getCurrentScope()` النطاق الحالي.

## nextTick {#nexttick}

تغيّرات الحالة تحدّث DOM في دفعة واحدة قبل أن يرسم المتصفح. و`await nextTick()` تنتظر حتى تُطبَّق التحديثات المعلّقة.

```ts
import { nextTick, ref } from '@usevibejs/ui';

const open = ref(false);

async function show(): Promise<void> {
  open.value = true;
  await nextTick();
  document.querySelector<HTMLInputElement>('#search')?.focus();
}
```

## toRef وtoRefs وtoValue {#toref-torefs-and-tovalue}

تحوّل هذه الدوال بين refs ودوال الجلب والقيم العادية:

```ts
import { computed, reactive, toRef, toRefs, toValue, type MaybeRefOrGetter } from '@usevibejs/ui';

const state = reactive({ x: 0, y: 0 });

const x = toRef(state, 'x'); // a ref that reads and writes state.x
const { y } = toRefs(state); // a ref for every property
const label = toRef(() => `(${state.x}, ${state.y})`); // a readonly ref of a getter
x.value++;
y.value++;

// A function that accepts a value, a ref or a getter.
function useDouble(input: MaybeRefOrGetter<number>) {
  return computed(() => toValue(input) * 2);
}
console.log(useDouble(x).value, useDouble(() => state.y).value, useDouble(2).value, label.value);
```

تعيد `unref(value)` قيمة الـ ref، وتعيد أي قيمة أخرى كما هي.

## الحالة المشتركة {#shared-state}

الدالة المركّبة (composable) دالة تنشئ حالة تفاعلية وتعيدها. والحالة التي تنشئها في نطاق الوحدة، خارج أي دالة، يتشاركها كل مكوّن يستوردها:

```ts
import { computed, ref } from '@usevibejs/ui';

interface Item {
  id: number;
  title: string;
}

// One cart for the whole app.
const items = ref<Item[]>([]);

export function useCart() {
  const count = computed(() => items.value.length);
  const add = (item: Item) => items.value.push(item);
  return { items, count, add };
}
```

كل استدعاء لـ `useCart()` يعيد `items` نفسها. إذا أردت أن يحصل كل مستدعٍ على حالته الخاصة، ضع الحالة داخل الدالة. وللحالة التي يجب أن يتشاركها جزء من الشجرة فقط، [وفّرها](https://vibejs.org/v0/ui/provide-inject).
