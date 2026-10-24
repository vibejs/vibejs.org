# Reaktivite

Reaktif değerler, kendilerini kimin okuduğunu kaydeder. Bir değer değiştiğinde onu okuyan computed değerler, watcher'lar ve template bağlamaları yeniden çalışır; başka hiçbir şey çalışmaz. Bu fonksiyonların hepsi `@usevibejs/ui` paketinden içe aktarılır.

## ref {#ref}

`ref()` tek bir değeri `.value` içinde tutar. Nesne değerleri derin reaktif yapılır; yani iç içe özelliklerindeki değişiklikler de izlenir.

```ts
import { ref } from '@usevibejs/ui';

const count = ref(0);
count.value++;

const user = ref({ name: 'Ada', tags: ['admin'] });
user.value.tags.push('editor'); // tracked
```

Argümansız `ref<T>()`, `T | undefined` tutar. Template içinde ve bir `reactive()` nesnesinin içinde ref açılır (unwrap): template `count.value` değil, `count` yazar.

## shallowRef {#shallowref}

`shallowRef()` yalnızca `.value` atamasını izler. Yerinde değiştirilmek yerine yenisiyle değiştirilen büyük değerler ve düz kalması gereken nesneler (örneğin bir kütüphanenin sınıf örnekleri) için kullanın.

```ts
import { shallowRef, triggerRef } from '@usevibejs/ui';

const rows = shallowRef<number[]>([]);
rows.value = [...rows.value, 1]; // tracked

rows.value.push(2); // not tracked
triggerRef(rows); // runs what reads rows now
```

`markRaw(object)`, bir nesneyi reaktif durumun içinde bile, nerede saklanırsa saklansın düz tutar.

## reactive ve readonly {#reactive-and-readonly}

`reactive()`, bir nesnenin, dizinin, `Map` ya da `Set` yapısının derin reaktif proxy'sini döndürür. İç içe ref'ler okunurken açılır.

```ts
import { reactive, readonly, ref } from '@usevibejs/ui';

const state = reactive({ count: ref(0), items: new Map<string, number>() });
state.count++; // no .value: the nested ref is unwrapped
state.items.set('a', 1);

const view = readonly(state);
// view.count++ fails to type-check, and warns VIBE5002 at runtime
```

- Proxy, özgün nesne değildir: kimlik karşılaştırması önemliyse `toRaw(value)` ile karşılaştırın.
- Bir `reactive()` nesnesini bütünüyle değiştirmek bağlantıyı koparır; bunun yerine onu bir `ref()` içinde tutun ya da özelliklerini değiştirin.
- `shallowReactive()` ve `shallowReadonly()` yalnızca üst düzey özelliklere uygulanır.
- `isRef()`, `isReactive()`, `isReadonly()`, `isShallow()` ve `isProxy()` bir değeri sınar.

## computed {#computed}

`computed()`, bir değeri diğer reaktif değerlerden türetir. Yalnızca kaynaklarından biri değiştikten sonra okunduğunda çalışır ve o zamana kadar sonucu önbellekte tutulur.

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

Yalnızca getter'ı olan bir computed salt okunurdur. Getter önceki değeri alır; bu, ilgili hiçbir şey değişmediğinde aynı nesneyi döndürmeye yardımcı olur. Bir getter durumu değiştirmemelidir; bunun için bir watcher kullanın.

## watch {#watch}

`watch(source, callback, options?)`, kaynak değiştiğinde `callback(value, oldValue, onCleanup)` çağırır. Kaynak bir ref, bir computed, bir getter, bir reaktif nesne ya da bunlardan oluşan bir dizi olabilir.

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

Seçenekler:

- `immediate: true`, callback'i eski değer olarak `undefined` vererek hemen bir kez çağırır.
- `deep: true`, bir ref ya da getter kaynağının iç içe değerlerini izler; bir sayı verilirse o kadar seviye izlenir.
- `once: true`, watcher'ı ilk çağrıdan sonra durdurur.
- `flush`, callback'in ne zaman çalışacağını belirler: `'pre'` (varsayılan) DOM güncellenmeden önce, `'post'` güncellendikten sonra, `'sync'` atamanın içinde.

Dönen tutamaç çağrıldığında watcher'ı durdurur; ayrıca `stop()`, `pause()` ve `resume()` metotlarına sahiptir. Bir bileşenin setup'ında oluşturulan watcher, bileşen unmount edildiğinde durur.

## watchEffect {#watcheffect}

`watchEffect(effect)`, `effect` fonksiyonunu hemen çalıştırır ve okuduğu bir şey değiştiğinde yeniden çalıştırır. `watchPostEffect()` ve `watchSyncEffect()`, sırasıyla `'post'` ve `'sync'` flush biçimleridir.

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

`onWatcherCleanup()`, çalışmakta olan watcher ya da effect için bir temizlik fonksiyonu kaydeder. Callback'in `onCleanup` argümanı aynı işi yapar ve bir `await` sonrasında da çalışır.

## Effect scope'lar {#effect-scopes}

`scope.run()` sırasında oluşturulan watcher'lar ve computed değerler scope'a aittir ve `scope.stop()` hepsini durdurur. Bir bileşenin setup'ı kendi scope'unda çalışır; bu yüzden çoğu kod scope oluşturmaz. Bileşenin dışında yaşayan durum için `effectScope()` kullanın.

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

`onScopeDispose()`, geçerli scope'a bir temizlik fonksiyonu kaydeder; bir bileşende bileşen unmount edildiğinde çalışır. `getCurrentScope()` geçerli scope'u döndürür.

## nextTick {#nexttick}

Durum değişiklikleri DOM'u, tarayıcı boyamadan önce bir grup halinde günceller. `await nextTick()`, bekleyen güncellemeler uygulanana kadar bekler.

```ts
import { nextTick, ref } from '@usevibejs/ui';

const open = ref(false);

async function show(): Promise<void> {
  open.value = true;
  await nextTick();
  document.querySelector<HTMLInputElement>('#search')?.focus();
}
```

## toRef, toRefs ve toValue {#toref-torefs-and-tovalue}

Bunlar ref'ler, getter'lar ve düz değerler arasında dönüşüm yapar:

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

`unref(value)`, bir ref'in değerini döndürür; başka her değeri olduğu gibi döndürür.

## Paylaşılan durum {#shared-state}

Composable, reaktif durum oluşturup döndüren bir fonksiyondur. Herhangi bir fonksiyonun dışında, modül kapsamında oluşturulan durum, onu içe aktaran tüm bileşenler tarafından paylaşılır:

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

`useCart()` çağrısının her biri aynı `items` değerini döndürür. Her çağıranın kendine ait durumu olması için durumu bunun yerine fonksiyonun içine koyun. Ağacın yalnızca bir bölümünün paylaşması gereken durum için [onu provide edin](https://vibejs.org/v0/ui/provide-inject).
