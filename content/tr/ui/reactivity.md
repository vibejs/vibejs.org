# Reaktivite

Reaktif değerler kendilerini kimin okuduğunu kaydeder. Bir değer değişince sadece onu okuyan computed değerler, watcher'lar ve şablon bağlamaları yeniden çalışır, başka hiçbir şey çalışmaz. Bu fonksiyonların hepsini `@usevibejs/ui` paketinden import edersin.

## ref {#ref}

`ref()` tek bir değeri `.value` içinde tutar. Değer bir nesneyse derinlemesine reaktif olur, yani iç içe alanlarındaki değişiklikler de takip edilir.

```ts
import { ref } from '@usevibejs/ui';

const count = ref(0);
count.value++;

const user = ref({ name: 'Ada', tags: ['admin'] });
user.value.tags.push('editor'); // tracked
```

Argümansız `ref<T>()`, `T | undefined` tutar. Şablonda ve bir `reactive()` nesnesinin içinde ref otomatik açılır: şablonda `count.value` değil, `count` yazarsın.

## shallowRef {#shallowref}

`shallowRef()` sadece `.value` alanına yapılan atamayı takip eder. Yerinde değiştirmek yerine baştan değiştirdiğin büyük değerler için kullan. Bir kütüphanenin sınıf örnekleri gibi düz kalması gereken nesneler için de uygundur.

```ts
import { shallowRef, triggerRef } from '@usevibejs/ui';

const rows = shallowRef<number[]>([]);
rows.value = [...rows.value, 1]; // tracked

rows.value.push(2); // not tracked
triggerRef(rows); // runs what reads rows now
```

`markRaw(object)` bir nesneyi, reaktif bir durumun içinde dursa bile, nerede saklarsan sakla düz tutar.

## reactive ve readonly {#reactive-and-readonly}

`reactive()` bir nesnenin, dizinin, `Map` ya da `Set` yapısının derinlemesine reaktif bir proxy'sini döner. İçindeki ref'ler okunurken açılır.

```ts
import { reactive, readonly, ref } from '@usevibejs/ui';

const state = reactive({ count: ref(0), items: new Map<string, number>() });
state.count++; // no .value: the nested ref is unwrapped
state.items.set('a', 1);

const view = readonly(state);
// view.count++ fails to type-check, and warns VIBE5002 at runtime
```

- Proxy, orijinal nesneyle aynı şey değildir. Kimlik önemliyse `toRaw(value)` ile karşılaştır.
- Bir `reactive()` nesnesini komple değiştirirsen bağlantı kopar. Onun yerine nesneyi bir `ref()` içinde tut ya da alanlarını değiştir.
- `shallowReactive()` ve `shallowReadonly()` sadece en üst seviyedeki alanlara etki eder.
- Bir değerin ne olduğunu `isRef()`, `isReactive()`, `isReadonly()`, `isShallow()` ve `isProxy()` ile kontrol edersin.

## computed {#computed}

`computed()` başka reaktif değerlerden yeni bir değer türetir. Sadece kaynaklarından biri değiştikten sonra okunursa çalışır. O zamana kadar sonucu cache'te kalır.

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

Sadece getter'ı olan bir computed salt okunurdur. Getter önceki değeri de alır. Önemli bir şey değişmediyse aynı nesneyi dönmek için bunu kullanabilirsin. Getter durumu değiştirmemeli. Bunun için bir watcher kullan.

## watch {#watch}

`watch(source, callback, options?)`, kaynak değiştiğinde `callback(value, oldValue, onCleanup)` çağırır. Kaynak bir ref, bir computed, bir getter, reaktif bir nesne ya da bunlardan oluşan bir dizi olabilir.

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

- `immediate: true` callback'i hemen bir kere çağırır. Eski değer olarak `undefined` gelir.
- `deep: true`, ref ya da getter kaynağının iç içe değerlerini de takip eder. Sayı verirsen o kadar seviye takip eder.
- `once: true` ilk çağrıdan sonra watcher'ı durdurur.
- `flush` callback'in ne zaman çalışacağını belirler: `'pre'` (varsayılan) DOM güncellenmeden önce, `'post'` güncellemelerden sonra, `'sync'` ise atamanın içinde.

Dönen handle'ı çağırırsan watcher durur. Handle'da `stop()`, `pause()` ve `resume()` da var. Bir bileşenin setup'ında oluşturduğun watcher, bileşen unmount olunca durur.

## watchEffect {#watcheffect}

`watchEffect(effect)`, `effect` fonksiyonunu hemen çalıştırır. Okuduğu bir şey değiştikçe de tekrar çalıştırır. `watchPostEffect()` ve `watchSyncEffect()` bunun `'post'` ve `'sync'` flush hâlleridir.

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

`onWatcherCleanup()` o an çalışan watcher ya da effect için bir temizlik fonksiyonu kaydeder. Callback'in `onCleanup` argümanı da aynı işi yapar, üstelik bir `await` sonrasında da çalışır.

## Effect scope'ları {#effect-scopes}

`scope.run()` sırasında oluşturduğun watcher ve computed değerler o scope'a aittir. `scope.stop()` hepsini durdurur. Bileşenin setup'ı zaten kendi scope'unda çalışır, bu yüzden çoğu kodda scope oluşturman gerekmez. Bir bileşenin dışında yaşayan durum için `effectScope()` kullan.

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

`onScopeDispose()` o anki scope'a bir temizlik fonksiyonu kaydeder. Bileşen içindeyse bileşen unmount olunca çalışır. `getCurrentScope()` o anki scope'u döner.

## nextTick {#nexttick}

Durum değişiklikleri DOM'u toplu olarak, tarayıcı ekranı çizmeden önce günceller. `await nextTick()` bekleyen güncellemeler uygulanana kadar bekler.

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

`unref(value)` bir ref'in değerini döner, diğer değerleri de olduğu gibi döner.

## Paylaşılan durum {#shared-state}

Composable, reaktif durum oluşturup dönen bir fonksiyondur. Modül seviyesinde, yani herhangi bir fonksiyonun dışında oluşturduğun durumu, onu import eden bütün bileşenler paylaşır:

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

Her `useCart()` çağrısı aynı `items` değerini döner. Her çağırana ayrı bir durum vermek istiyorsan durumu fonksiyonun içine taşı. Ağacın sadece bir kısmının paylaşması gereken durum için onu [provide et](https://vibejs.org/v0/ui/provide-inject).
