# Vue'dan geliyorsanız

`<script setup>` ile Vue 3'ten bildiğiniz şeylerin çoğu aynen geçerlidir:

- **Tek dosyalı bileşenler:** bir `.vibe` dosyasında `<script setup lang="ts">`, `<template>` ve `<style scoped>` blokları bulunur; template aynı direktifleri kullanır: `v-if`, `v-for`, `v-show`, `v-model`, `v-bind`, `v-on`, `v-slot`, `v-html` ve `v-text`; kısayollar ve değiştiriciler de aynıdır.
- **Reaktivite:** `ref`, `shallowRef`, `reactive`, `readonly`, `computed`, `watch`, `watchEffect`, `effectScope`, `nextTick`, `toRef`, `toRefs` ve `toValue` aynı imzalara, tiplere ve semantiğe sahiptir. Hepsi `@usevibejs/ui` paketinden import edilir.
- **Bileşenler:** `defineProps`, `defineEmits`, `defineSlots`, `defineModel`, `defineExpose` ve `defineOptions` makrodur, yaşam döngüsü hook'ları aynı adları taşır; `InjectionKey` ile `provide`/`inject`, `useTemplateRef`, `useAttrs`, `useSlots` ve `useId` Vue'daki gibi çalışır.
- **Uygulama:** `createApp(App).mount('#app')`, `app.use()`, `app.provide()`, `app.config.errorHandler` ve `app.config.warnHandler`.

Template, DOM düğümlerini doğrudan oluşturan ve yalnızca durumu değişen bağlamaları güncelleyen koda derlenir; sanal DOM (virtual DOM) yoktur. Her şey TypeScript'tir ve derleyici, vibe.js'in desteklemediği bir Vue biçimini, sayfası yerine geçecek çözümü gösteren bir `VIBE####` koduyla bildirir.

## Deyimler {#idioms}

| Vue                                                        | vibe.js                                                                                       | Vue biçimini ne yakalar                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `app.component('TodoItem', TodoItem)`                      | onu kullanan her dosyada `import TodoItem from './TodoItem.vibe'`                             | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.mixin({ ... })`                                       | `useFeature()` gibi bir composable                                                            | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.directive('focus', ...)`, `v-focus`                   | `onMounted()` ile `useTemplateRef('input')`                                                   | [VIBE2908](https://vibejs.org/v0/errors/VIBE2908), [VIBE5301](https://vibejs.org/v0/errors/VIBE5301) |
| `export default { data() {} }` içeren `<script>`           | `<script setup lang="ts">`                                                                    | [VIBE1004](https://vibejs.org/v0/errors/VIBE1004)                                                    |
| `lang` olmadan `<script setup>` veya `lang="js"`           | `<script setup lang="ts">`                                                                    | [VIBE1005](https://vibejs.org/v0/errors/VIBE1005)                                                    |
| `<todo-item>`                                              | `<TodoItem>`                                                                                  | [VIBE2002](https://vibejs.org/v0/errors/VIBE2002)                                                    |
| `ref="input"` ile `const input = ref(null)`                | `const input = useTemplateRef<HTMLInputElement>('input')`                                     | [VIBE2701](https://vibejs.org/v0/errors/VIBE2701)                                                    |
| `defineProps({ title: String })`                           | `defineProps<{ title: string }>()`                                                            | [VIBE3101](https://vibejs.org/v0/errors/VIBE3101)                                                    |
| `withDefaults(defineProps<Props>(), { size: 'md' })`       | `const { size = 'md' } = defineProps<Props>()`                                                | [VIBE3006](https://vibejs.org/v0/errors/VIBE3006)                                                    |
| `const { title, ...rest } = defineProps<Props>()`          | `const { title } = defineProps<Props>()` ve `$attrs`                                          | [VIBE3104](https://vibejs.org/v0/errors/VIBE3104)                                                    |
| `defineEmits(['pick'])`                                    | `defineEmits<{ pick: [id: string] }>()`                                                       | [VIBE3201](https://vibejs.org/v0/errors/VIBE3201)                                                    |
| `defineEmits<{ (e: 'pick', id: string): void }>()`         | `defineEmits<{ pick: [id: string] }>()`                                                       | [VIBE3202](https://vibejs.org/v0/errors/VIBE3202)                                                    |
| `<script setup lang="ts" generic="T">`                     | somut bir tiple `defineProps<{ items: Item[] }>()`                                            | [VIBE1013](https://vibejs.org/v0/errors/VIBE1013)                                                    |
| `<component is="TodoItem">`, `:is="'TodoItem'"`            | import edilen bileşenle `<component :is="TodoItem">`                                          | [VIBE2006](https://vibejs.org/v0/errors/VIBE2006), [VIBE5207](https://vibejs.org/v0/errors/VIBE5207) |
| bir template'te `$el`, `$parent`, `$refs` veya `this`      | `useTemplateRef('name')` ve `<script setup>` bağlamaları                                      | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                    |
| `title` bir prop iken `v-model="title"`                    | `const title = defineModel<string>('title')`                                                  | [VIBE2504](https://vibejs.org/v0/errors/VIBE2504)                                                    |
| `:key` olmadan `v-for`                                     | `v-for="item in items" :key="item.id"`                                                        | [VIBE2203](https://vibejs.org/v0/errors/VIBE2203)                                                    |
| aynı öğede `v-if` ve `v-for`                               | `v-if` çevresinde `<template v-for>` veya bir `computed` liste                                | [VIBE2103](https://vibejs.org/v0/errors/VIBE2103)                                                    |
| `<Teleport to="body">`                                     | yerel bir `<dialog>` veya `popover` özniteliği                                                | [VIBE2901](https://vibejs.org/v0/errors/VIBE2901)                                                    |
| `<KeepAlive>`                                              | `v-show` veya bir composable'da tutulan durum                                                 | [VIBE2902](https://vibejs.org/v0/errors/VIBE2902)                                                    |
| `<Transition>`                                             | bir `:class` bağlaması üzerinde CSS geçişleri                                                 | [VIBE2903](https://vibejs.org/v0/errors/VIBE2903)                                                    |
| `<TransitionGroup>`                                        | key'li `v-for` öğeleri üzerinde CSS animasyonları                                             | [VIBE2904](https://vibejs.org/v0/errors/VIBE2904)                                                    |
| `<Suspense>`                                               | veri geldiğinde doldurulan bir `ref` ve `v-if`                                                | [VIBE2905](https://vibejs.org/v0/errors/VIBE2905)                                                    |
| `v-memo`                                                   | `computed`                                                                                    | [VIBE2906](https://vibejs.org/v0/errors/VIBE2906)                                                    |
| `v-once`                                                   | `<script setup>` içindeki bir `const`                                                         | [VIBE2907](https://vibejs.org/v0/errors/VIBE2907)                                                    |
| `v-cloak`                                                  | düz bir `<div id="app"></div>`: template'ler önceden derlendiği için ham template gösterilmez | [VIBE2909](https://vibejs.org/v0/errors/VIBE2909)                                                    |
| `@vue:mounted`, `@vnode-mounted`                           | `useTemplateRef()` ile `onMounted()`                                                          | [VIBE2910](https://vibejs.org/v0/errors/VIBE2910)                                                    |
| `async setup()`, `<script setup>` içinde üst düzey `await` | bir promise ile doldurulan `const data = ref()`                                               | [VIBE3002](https://vibejs.org/v0/errors/VIBE3002), [VIBE5204](https://vibejs.org/v0/errors/VIBE5204) |
| `<style module>`                                           | `<style scoped>`                                                                              | [VIBE1007](https://vibejs.org/v0/errors/VIBE1007)                                                    |
| `<style>` içinde `v-bind(color)`                           | `:style="{ '--color': color }"` ve `var(--color)`                                             | [VIBE4003](https://vibejs.org/v0/errors/VIBE4003)                                                    |
| `>>> .child`, `/deep/ .child`, `::v-deep`                  | `:deep(.child)`                                                                               | [VIBE4004](https://vibejs.org/v0/errors/VIBE4004)                                                    |
| `<template src="./list.html">`                             | `<template>` içine yazılan içerik                                                             | [VIBE1006](https://vibejs.org/v0/errors/VIBE1006)                                                    |
| bir bileşende `@pick.once="onPick"`                        | `@pick="onPick"` ve denetim `onPick` içinde                                                   | [VIBE2305](https://vibejs.org/v0/errors/VIBE2305)                                                    |
| `v-on="{ click, focus }"`                                  | `@click="click" @focus="focus"`                                                               | [VIBE2302](https://vibejs.org/v0/errors/VIBE2302)                                                    |
| `<template #[name]>`                                       | statik adlarla `<template v-if="wide" #wide>`                                                 | [VIBE2605](https://vibejs.org/v0/errors/VIBE2605)                                                    |

## Aynı API, farklı davranış {#same-api-different-behavior}

- `onBeforeMount`, bileşenin DOM'u oluşturulduktan sonra ve eklenmeden önce çalışır; bu yüzden bir alt bileşenin hook'u üstünkinden önce çalışır ve template ref'ler zaten ayarlanmıştır. Bkz. [Hook sırası](https://vibejs.org/v0/ui/lifecycle#hook-order).
- Bir prop'un her okunuşu üst bileşene çağrı yapar ve bağlı ifadeyi yeniden değerlendirir; pahalı türetmeleri `computed` içine koyun. Bkz. [Props okuma](https://vibejs.org/v0/ui/components#reading-props).
- Slot'un yedek içeriği (fallback), yalnızca üst bileşen slot için hiç içerik geçmediğinde render edilir; geçirilen içerik hiçbir şey render etmediğinde edilmez. Bkz. [Yedek içerik](https://vibejs.org/v0/ui/components#fallback-content).
- Bir bileşen üzerindeki template ref yalnızca bileşenin `defineExpose()` ile geçirdiklerini tutar, asla örneğini (instance) tutmaz. Bkz. [Değerleri dışa açma](https://vibejs.org/v0/ui/components#exposing-values).
- Olay dinleyicileri delegasyon olmadan doğrudan öğelere eklenir. Bkz. [Olaylar](https://vibejs.org/v0/ui/template-syntax#events).
- Geliştirme sırasında bir template düzenlemesi bileşenin durumunu korur ama alt bileşenlerini yeniden oluşturur. Bkz. [Hot güncellemeler](https://vibejs.org/v0/ui/#hot-updates).
- Script içinde bir slot fonksiyonunu çağırmak slot'u render eder ve DOM'unu oluşturur; bunun yerine `$slots.name` değerini test edin. Bkz. [Script'te slot'lar](https://vibejs.org/v0/ui/components#slots-in-script).

## vibe.js'te olmayanlar {#not-in-vibejs}

Bunlardan birini `@usevibejs/ui` paketinden import etmek TS2305 (modülün böyle bir export'u yok) ile tip denetiminde başarısız olur.

- `h()`, render fonksiyonları ve JSX: bir template yazın; çalışma zamanında bileşen seçmek için `<component :is>` kullanın.
- `defineAsyncComponent`: router, bir rota bileşenini `() => import('./Page.vibe')` ile kendisi yükler.
- `customRef`: bir `watch` ile `shallowRef` veya `get` ve `set` ile bir `computed`.
- `proxyRefs`: template'ler `<script setup>` içindeki üst düzey ref'leri açar; script'te `.value` veya `reactive()` kullanın.
- `effect`: `watchEffect` veya `watchSyncEffect`.
- `getCurrentInstance`: örneğin kullanım alanlarını `useAttrs()`, `useSlots()`, `useId()` ve `inject()` karşılar.
- `app.config.globalProperties`: `app.provide()` ve değeri inject eden bir composable.
- `defineCustomElement`: sonraki bir sürüm için planlanmıştır.
- `defineStore` ve Pinia: bir composable içinde modül kapsamlı durum. Bkz. [Paylaşılan durum](https://vibejs.org/v0/ui/reactivity#shared-state).
- Sunucu tarafı render ve hydration: v0.1 yalnızca tarayıcıda render eder; sunucu tarafı render sonraki bir sürüm için planlanmıştır.
