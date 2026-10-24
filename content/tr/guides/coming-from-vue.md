# Vue'dan geliyorsan

Vue 3'te `<script setup>` ile öğrendiklerinin çoğu burada da geçerli:

- **Tek dosyalık bileşenler:** bir `.vibe` dosyasında `<script setup lang="ts">`, `<template>` ve `<style scoped>` blokları olur. Şablonda aynı direktifleri kullanırsın: `v-if`, `v-for`, `v-show`, `v-model`, `v-bind`, `v-on`, `v-slot`, `v-html` ve `v-text`. Kısaltmalar ve modifier'lar da aynı.
- **Reaktivite:** `ref`, `shallowRef`, `reactive`, `readonly`, `computed`, `watch`, `watchEffect`, `effectScope`, `nextTick`, `toRef`, `toRefs` ve `toValue` aynı imzaya, aynı tiplere ve aynı davranışa sahip. Hepsini `@usevibejs/ui` paketinden import edersin.
- **Bileşenler:** `defineProps`, `defineEmits`, `defineSlots`, `defineModel`, `defineExpose` ve `defineOptions` birer makro. Yaşam döngüsü hook'larının adları aynı. `InjectionKey` ile `provide`/`inject`, `useTemplateRef`, `useAttrs`, `useSlots` ve `useId` Vue'daki gibi çalışır.
- **Uygulama:** `createApp(App).mount('#app')`, `app.use()`, `app.provide()`, `app.config.errorHandler` ve `app.config.warnHandler`.

Şablon, DOM düğümlerini doğrudan oluşturan ve yalnızca durumu değişen binding'leri güncelleyen koda derlenir; sanal DOM yok. Her şey TypeScript. vibe.js'in desteklemediği bir Vue yazımı kullanırsan derleyici bunu bir `VIBE####` koduyla bildirir. Kodun sayfasında yerine ne yazacağın anlatılır.

## Kalıplar {#idioms}

| Vue                                                              | vibe.js                                                                                   | Vue yazımını ne yakalar                                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `app.component('TodoItem', TodoItem)`                            | onu kullanan her dosyada `import TodoItem from './TodoItem.vibe'`                         | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.mixin({ ... })`                                             | `useFeature()` gibi bir composable                                                        | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.directive('focus', ...)`, `v-focus`                         | `onMounted()` ile `useTemplateRef('input')`                                               | [VIBE2908](https://vibejs.org/v0/errors/VIBE2908), [VIBE5301](https://vibejs.org/v0/errors/VIBE5301) |
| `export default { data() {} }` içeren `<script>`                 | `<script setup lang="ts">`                                                                | [VIBE1004](https://vibejs.org/v0/errors/VIBE1004)                                                    |
| `lang` olmadan ya da `lang="js"` ile `<script setup>`            | `<script setup lang="ts">`                                                                | [VIBE1005](https://vibejs.org/v0/errors/VIBE1005)                                                    |
| `<todo-item>`                                                    | `<TodoItem>`                                                                              | [VIBE2002](https://vibejs.org/v0/errors/VIBE2002)                                                    |
| `const input = ref(null)` ile `ref="input"`                      | `const input = useTemplateRef<HTMLInputElement>('input')`                                 | [VIBE2701](https://vibejs.org/v0/errors/VIBE2701)                                                    |
| `defineProps({ title: String })`                                 | `defineProps<{ title: string }>()`                                                        | [VIBE3101](https://vibejs.org/v0/errors/VIBE3101)                                                    |
| `withDefaults(defineProps<Props>(), { size: 'md' })`             | `const { size = 'md' } = defineProps<Props>()`                                            | [VIBE3006](https://vibejs.org/v0/errors/VIBE3006)                                                    |
| `const { title, ...rest } = defineProps<Props>()`                | `const { title } = defineProps<Props>()` ve `$attrs`                                      | [VIBE3104](https://vibejs.org/v0/errors/VIBE3104)                                                    |
| `defineEmits(['pick'])`                                          | `defineEmits<{ pick: [id: string] }>()`                                                   | [VIBE3201](https://vibejs.org/v0/errors/VIBE3201)                                                    |
| `defineEmits<{ (e: 'pick', id: string): void }>()`               | `defineEmits<{ pick: [id: string] }>()`                                                   | [VIBE3202](https://vibejs.org/v0/errors/VIBE3202)                                                    |
| `<script setup lang="ts" generic="T">`                           | somut bir tiple `defineProps<{ items: Item[] }>()`                                        | [VIBE1013](https://vibejs.org/v0/errors/VIBE1013)                                                    |
| `<component is="TodoItem">`, `:is="'TodoItem'"`                  | import ettiğin bileşenle `<component :is="TodoItem">`                                     | [VIBE2006](https://vibejs.org/v0/errors/VIBE2006), [VIBE5207](https://vibejs.org/v0/errors/VIBE5207) |
| şablonda `$el`, `$parent`, `$refs` ya da `this`                  | `useTemplateRef('name')` ve `<script setup>` binding'leri                                 | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                    |
| `title` bir prop'ken `v-model="title"`                           | `const title = defineModel<string>('title')`                                              | [VIBE2504](https://vibejs.org/v0/errors/VIBE2504)                                                    |
| `:key` olmadan `v-for`                                           | `v-for="item in items" :key="item.id"`                                                    | [VIBE2203](https://vibejs.org/v0/errors/VIBE2203)                                                    |
| aynı elemanda `v-if` ve `v-for`                                  | `v-if`'i saran bir `<template v-for>` ya da bir `computed` liste                          | [VIBE2103](https://vibejs.org/v0/errors/VIBE2103)                                                    |
| `<Teleport to="body">`                                           | yerleşik bir `<dialog>` ya da `popover` attribute'u                                       | [VIBE2901](https://vibejs.org/v0/errors/VIBE2901)                                                    |
| `<KeepAlive>`                                                    | `v-show` ya da durumu bir composable'da tutmak                                            | [VIBE2902](https://vibejs.org/v0/errors/VIBE2902)                                                    |
| `<Transition>`                                                   | bir `:class` binding'i üzerinde CSS transition'ları                                       | [VIBE2903](https://vibejs.org/v0/errors/VIBE2903)                                                    |
| `<TransitionGroup>`                                              | key'li `v-for` öğelerinde CSS animasyonları                                               | [VIBE2904](https://vibejs.org/v0/errors/VIBE2904)                                                    |
| `<Suspense>`                                                     | veri gelince dolan bir `ref` ve `v-if`                                                    | [VIBE2905](https://vibejs.org/v0/errors/VIBE2905)                                                    |
| `v-memo`                                                         | `computed`                                                                                | [VIBE2906](https://vibejs.org/v0/errors/VIBE2906)                                                    |
| `v-once`                                                         | `<script setup>` içinde bir `const`                                                       | [VIBE2907](https://vibejs.org/v0/errors/VIBE2907)                                                    |
| `v-cloak`                                                        | düz bir `<div id="app"></div>`: şablonlar önceden derlendiği için ham şablon hiç görünmez | [VIBE2909](https://vibejs.org/v0/errors/VIBE2909)                                                    |
| `@vue:mounted`, `@vnode-mounted`                                 | `useTemplateRef()` ile `onMounted()`                                                      | [VIBE2910](https://vibejs.org/v0/errors/VIBE2910)                                                    |
| `async setup()`, `<script setup>` içinde en üst seviyede `await` | bir promise'in doldurduğu `const data = ref()`                                            | [VIBE3002](https://vibejs.org/v0/errors/VIBE3002), [VIBE5204](https://vibejs.org/v0/errors/VIBE5204) |
| `<style module>`                                                 | `<style scoped>`                                                                          | [VIBE1007](https://vibejs.org/v0/errors/VIBE1007)                                                    |
| `<style>` içinde `v-bind(color)`                                 | `:style="{ '--color': color }"` ve `var(--color)`                                         | [VIBE4003](https://vibejs.org/v0/errors/VIBE4003)                                                    |
| `>>> .child`, `/deep/ .child`, `::v-deep`                        | `:deep(.child)`                                                                           | [VIBE4004](https://vibejs.org/v0/errors/VIBE4004)                                                    |
| `<template src="./list.html">`                                   | içeriği doğrudan `<template>` içine yazmak                                                | [VIBE1006](https://vibejs.org/v0/errors/VIBE1006)                                                    |
| bir bileşende `@pick.once="onPick"`                              | `@pick="onPick"` ve kontrolü `onPick` içinde yapmak                                       | [VIBE2305](https://vibejs.org/v0/errors/VIBE2305)                                                    |
| `v-on="{ click, focus }"`                                        | `@click="click" @focus="focus"`                                                           | [VIBE2302](https://vibejs.org/v0/errors/VIBE2302)                                                    |
| `<template #[name]>`                                             | statik adlarla `<template v-if="wide" #wide>`                                             | [VIBE2605](https://vibejs.org/v0/errors/VIBE2605)                                                    |

## Aynı API, farklı davranış {#same-api-different-behavior}

- `onBeforeMount`, bileşenin DOM'u kurulduktan sonra ve sayfaya eklenmeden önce çalışır. Bu yüzden çocuğunki ebeveyninkinden önce çalışır ve template ref'ler o noktada zaten atanmıştır. Bkz. [Hook sırası](https://vibejs.org/v0/ui/lifecycle#hook-order).
- Bir prop'u her okuduğunda ebeveyndeki bağlı ifade yeniden çalışır. Pahalı türetmeleri `computed` içine koy. Bkz. [Prop okumak](https://vibejs.org/v0/ui/components#reading-props).
- Slot'un yedek içeriği yalnızca ebeveyn o slot'a hiç içerik vermediğinde görünür. Verilen içerik boş render edilirse görünmez. Bkz. [Yedek içerik](https://vibejs.org/v0/ui/components#fallback-content).
- Bir bileşene verilen template ref, bileşenin örneğini asla tutmaz; yalnızca bileşenin `defineExpose()`'a verdiklerini tutar. Bkz. [Değerleri dışa açmak](https://vibejs.org/v0/ui/components#exposing-values).
- Olay dinleyicileri delegasyon olmadan doğrudan elemanların kendisine bağlanır. Bkz. [Olaylar](https://vibejs.org/v0/ui/template-syntax#events).
- Geliştirme sırasında şablonu değiştirirsen bileşen durumunu korur ama çocuk bileşenlerini baştan oluşturur. Bkz. [Sıcak güncellemeler](https://vibejs.org/v0/ui/#hot-updates).
- Script içinde bir slot fonksiyonunu çağırırsan slot render olur ve DOM'u oluşur. Onun yerine `$slots.name`'e bak. Bkz. [Script'te slot'lar](https://vibejs.org/v0/ui/components#slots-in-script).

## vibe.js'te olmayanlar {#not-in-vibejs}

Bunlardan birini `@usevibejs/ui` paketinden import edersen tip denetimi TS2305 (module has no exported member) ile hata verir.

- `h()`, render fonksiyonları ve JSX: şablon yaz; çalışma anında bileşen seçmek için `<component :is>` kullan.
- `defineAsyncComponent`: router, rota bileşenini `() => import('./Page.vibe')` üzerinden kendisi yükler.
- `customRef`: `watch` ile bir `shallowRef` ya da `get` ve `set` içeren bir `computed`.
- `proxyRefs`: şablonlar `<script setup>`'taki en üst seviye ref'leri kendiliğinden açar; script içinde `.value` ya da `reactive()` kullan.
- `effect`: `watchEffect` ya da `watchSyncEffect`.
- `getCurrentInstance`: örneğe ihtiyaç duyduğun durumları `useAttrs()`, `useSlots()`, `useId()` ve `inject()` karşılar.
- `app.config.globalProperties`: `app.provide()` ve değeri inject eden bir composable.
- `defineCustomElement`: sonraki bir sürüm için planlanıyor.
- `defineStore` ve Pinia: bir composable içinde modül seviyesinde durum. Bkz. [Paylaşılan durum](https://vibejs.org/v0/ui/reactivity#shared-state).
- Sunucu tarafı render ve hydration: v0.1 yalnızca tarayıcıda render eder; sunucu tarafı render sonraki bir sürüm için planlanıyor.
