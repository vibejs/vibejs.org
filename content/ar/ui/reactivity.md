# التفاعلية

القيم التفاعلية تسجّل من يقرؤها. وعندما تتغير قيمة، تعمل من جديد القيم المحسوبة والمراقبات (watchers) وارتباطات القالب التي تقرؤها، ولا يعمل شيء غيرها. تُستورد كل هذه الدوال من `@usevibejs/ui`.

## ref {#ref}

يحمل `ref()` قيمة واحدة في `.value`. وتُجعل قيمة الكائن تفاعلية بعمق، فتُتتبَّع التغييرات في خصائصها المتداخلة أيضًا.

```ts
import { ref } from '@usevibejs/ui';

const count = ref(0);
count.value++;

const user = ref({ name: 'Ada', tags: ['admin'] });
user.value.tags.push('editor'); // tracked
```

`ref<T>()` بدون وسيط يحمل `T | undefined`. في القالب، وفي كائن `reactive()`، يُفك تغليف المرجع: يكتب القالب `count` وليس `count.value`.

## shallowRef {#shallowref}

يتتبّع `shallowRef()` إسناد `.value` فقط. استخدمه للقيم الكبيرة التي تُستبدل ولا تُغيَّر في مكانها، وللكائنات التي يجب أن تبقى عادية، مثل نسخ الأصناف (class instances) في مكتبة ما.

```ts
import { shallowRef, triggerRef } from '@usevibejs/ui';

const rows = shallowRef<number[]>([]);
rows.value = [...rows.value, 1]; // tracked

rows.value.push(2); // not tracked
triggerRef(rows); // runs what reads rows now
```

يُبقي `markRaw(object)` الكائن عاديًا أينما خُزّن، حتى داخل حالة تفاعلية.

## reactive وreadonly {#reactive-and-readonly}

يعيد `reactive()` وكيلًا (proxy) تفاعليًا بعمق لكائن أو مصفوفة أو `Map` أو `Set`. وتُفك تغليفات المراجع المتداخلة عند القراءة.

```ts
import { reactive, readonly, ref } from '@usevibejs/ui';

const state = reactive({ count: ref(0), items: new Map<string, number>() });
state.count++; // no .value: the nested ref is unwrapped
state.items.set('a', 1);

const view = readonly(state);
// view.count++ fails to type-check, and warns VIBE5002 at runtime
```

- الوكيل ليس الكائن الأصلي: قارن بـ `toRaw(value)` عندما تهمّك هوية الكائن.
- استبدال كائن `reactive()` بالكامل يقطع الاتصال؛ احتفظ به في `ref()` بدلًا من ذلك، أو غيّر خصائصه.
- ينطبق `shallowReactive()` و`shallowReadonly()` على الخصائص العليا فقط.
- تفحص `isRef()` و`isReactive()` و`isReadonly()` و`isShallow()` و`isProxy()` قيمةً ما.

## computed {#computed}

يشتق `computed()` قيمة من قيم تفاعلية أخرى. ولا يعمل إلا عند قراءته بعد تغيّر أحد مصادره، وتُخزَّن نتيجته مؤقتًا حتى ذلك الحين.

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

القيمة المحسوبة التي لها getter فقط للقراءة فقط. يتلقى الـ getter القيمة السابقة، مما يساعد على إعادة الكائن نفسه عندما لا يتغير شيء ذو صلة. ولا ينبغي لـ getter أن يغيّر الحالة؛ استخدم watcher لذلك.

## watch {#watch}

تستدعي `watch(source, callback, options?)` الدالة `callback(value, oldValue, onCleanup)` عندما يتغير المصدر. والمصدر هو ref أو computed أو getter أو كائن تفاعلي أو مصفوفة من هذه.

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

- `immediate: true` يستدعي الدالة مرة واحدة فورًا، مع `undefined` كقيمة قديمة.
- `deep: true` يتتبّع القيم المتداخلة في مصدر من نوع ref أو getter؛ ويتتبّع الرقم هذا العدد من المستويات.
- `once: true` يوقف المراقب بعد أول استدعاء.
- `flush` يحدد وقت تشغيل الدالة: `'pre'` (الافتراضي) قبل تحديث DOM، و`'post'` بعده، و`'sync'` داخل عملية الإسناد نفسها.

المقبض المُعاد يوقف المراقب عند استدعائه، وله `stop()` و`pause()` و`resume()`. والمراقب المنشأ في setup الخاص بمكوّن يتوقف عند إلغاء تركيب المكوّن.

## watchEffect {#watcheffect}

يشغّل `watchEffect(effect)` الدالة `effect` الآن ومن جديد كلما تغير شيء قرأته. و`watchPostEffect()` و`watchSyncEffect()` هما صيغتا التفريغ (flush) `'post'` و`'sync'`.

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

تسجّل `onWatcherCleanup()` عملية تنظيف للمراقب أو التأثير الجاري. والوسيط `onCleanup` في الدالة يفعل الشيء نفسه ويعمل أيضًا بعد `await`.

## نطاقات التأثير {#effect-scopes}

المراقبات والقيم المحسوبة المنشأة أثناء `scope.run()` تنتمي إلى النطاق، ويوقفها `scope.stop()` كلها. يعمل setup الخاص بالمكوّن في نطاق خاص به، ولذلك لا تنشئ معظم الشيفرة نطاقًا. استخدم `effectScope()` للحالة التي تعيش خارج المكوّن.

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

تسجّل `onScopeDispose()` عملية تنظيف على النطاق الحالي؛ وفي المكوّن تعمل عند إلغاء تركيبه. وتعيد `getCurrentScope()` النطاق الحالي.

## nextTick {#nexttick}

تحدّث تغييرات الحالة DOM في دفعة واحدة، قبل أن يرسم المتصفح. ينتظر `await nextTick()` حتى تُطبَّق التحديثات المعلّقة.

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

تحوّل هذه الدوال بين المراجع والـ getters والقيم العادية:

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

تعيد `unref(value)` قيمة المرجع، وتعيد أي قيمة أخرى كما هي.

## الحالة المشتركة {#shared-state}

الـ composable دالة تنشئ حالة تفاعلية وتعيدها. والحالة المنشأة على مستوى الوحدة، خارج أي دالة، يتشاركها كل مكوّن يستوردها:

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

كل استدعاء لـ `useCart()` يعيد `items` نفسها. ضع الحالة داخل الدالة بدلًا من ذلك لتمنح كل مستدعٍ حالته الخاصة. وللحالة التي ينبغي أن يتشاركها جزء من الشجرة فقط، [وفّرها بـ provide](https://vibejs.org/v0/ui/provide-inject).
