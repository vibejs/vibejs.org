# القادم من Vue

معظم ما تعرفه من Vue 3 مع `<script setup>` ينتقل كما هو:

- **المكوّنات أحادية الملف:** يحتوي ملف `.vibe` على الكتل `<script setup lang="ts">` و`<template>` و`<style scoped>`، ويستخدم القالب الموجّهات نفسها: `v-if` و`v-for` و`v-show` و`v-model` و`v-bind` و`v-on` و`v-slot` و`v-html` و`v-text`، مع الاختصارات والمعدِّلات نفسها.
- **التفاعلية:** لكل من `ref` و`shallowRef` و`reactive` و`readonly` و`computed` و`watch` و`watchEffect` و`effectScope` و`nextTick` و`toRef` و`toRefs` و`toValue` التواقيع والأنواع والدلالات نفسها. وتُستورَد من `@usevibejs/ui`.
- **المكوّنات:** `defineProps` و`defineEmits` و`defineSlots` و`defineModel` و`defineExpose` و`defineOptions` هي ماكرو (macros)، وخطافات دورة الحياة لها الأسماء نفسها، ويعمل `provide`/`inject` مع `InjectionKey` و`useTemplateRef` و`useAttrs` و`useSlots` و`useId` كما في Vue.
- **التطبيق:** `createApp(App).mount('#app')` و`app.use()` و`app.provide()` و`app.config.errorHandler` و`app.config.warnHandler`.

يُترجَم القالب إلى شيفرة تنشئ عقد DOM مباشرة وتحدّث فقط الارتباطات التي تغيّرت حالتها؛ ولا يوجد DOM افتراضي. كل شيء TypeScript، ويبلّغ المترجم (compiler) عن أي صيغة من Vue لا يدعمها vibe.js برمز `VIBE####` تعرض صفحته البديل.

## الأساليب {#idioms}

| Vue                                                           | vibe.js                                                                 | ما الذي يكشف صيغة Vue                                                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `app.component('TodoItem', TodoItem)`                         | `import TodoItem from './TodoItem.vibe'` في كل ملف يستخدمه              | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.mixin({ ... })`                                          | composable مثل `useFeature()`                                           | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.directive('focus', ...)`, `v-focus`                      | `useTemplateRef('input')` مع `onMounted()`                              | [VIBE2908](https://vibejs.org/v0/errors/VIBE2908), [VIBE5301](https://vibejs.org/v0/errors/VIBE5301) |
| `<script>` مع `export default { data() {} }`                  | `<script setup lang="ts">`                                              | [VIBE1004](https://vibejs.org/v0/errors/VIBE1004)                                                    |
| `<script setup>` بدون `lang`، أو `lang="js"`                  | `<script setup lang="ts">`                                              | [VIBE1005](https://vibejs.org/v0/errors/VIBE1005)                                                    |
| `<todo-item>`                                                 | `<TodoItem>`                                                            | [VIBE2002](https://vibejs.org/v0/errors/VIBE2002)                                                    |
| `ref="input"` مع `const input = ref(null)`                    | `const input = useTemplateRef<HTMLInputElement>('input')`               | [VIBE2701](https://vibejs.org/v0/errors/VIBE2701)                                                    |
| `defineProps({ title: String })`                              | `defineProps<{ title: string }>()`                                      | [VIBE3101](https://vibejs.org/v0/errors/VIBE3101)                                                    |
| `withDefaults(defineProps<Props>(), { size: 'md' })`          | `const { size = 'md' } = defineProps<Props>()`                          | [VIBE3006](https://vibejs.org/v0/errors/VIBE3006)                                                    |
| `const { title, ...rest } = defineProps<Props>()`             | `const { title } = defineProps<Props>()` و`$attrs`                      | [VIBE3104](https://vibejs.org/v0/errors/VIBE3104)                                                    |
| `defineEmits(['pick'])`                                       | `defineEmits<{ pick: [id: string] }>()`                                 | [VIBE3201](https://vibejs.org/v0/errors/VIBE3201)                                                    |
| `defineEmits<{ (e: 'pick', id: string): void }>()`            | `defineEmits<{ pick: [id: string] }>()`                                 | [VIBE3202](https://vibejs.org/v0/errors/VIBE3202)                                                    |
| `<script setup lang="ts" generic="T">`                        | `defineProps<{ items: Item[] }>()` مع نوع محدد                          | [VIBE1013](https://vibejs.org/v0/errors/VIBE1013)                                                    |
| `<component is="TodoItem">`, `:is="'TodoItem'"`               | `<component :is="TodoItem">` مع المكوّن المستورد                         | [VIBE2006](https://vibejs.org/v0/errors/VIBE2006), [VIBE5207](https://vibejs.org/v0/errors/VIBE5207) |
| `$el` أو `$parent` أو `$refs` أو `this` في قالب               | `useTemplateRef('name')` وارتباطات `<script setup>`                     | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                    |
| `v-model="title"` حيث `title` هو prop                         | `const title = defineModel<string>('title')`                            | [VIBE2504](https://vibejs.org/v0/errors/VIBE2504)                                                    |
| `v-for` بدون `:key`                                           | `v-for="item in items" :key="item.id"`                                  | [VIBE2203](https://vibejs.org/v0/errors/VIBE2203)                                                    |
| `v-if` و`v-for` على عنصر واحد                                 | `<template v-for>` حول `v-if`، أو قائمة `computed`                      | [VIBE2103](https://vibejs.org/v0/errors/VIBE2103)                                                    |
| `<Teleport to="body">`                                        | عنصر `<dialog>` أصلي أو السمة `popover`                                 | [VIBE2901](https://vibejs.org/v0/errors/VIBE2901)                                                    |
| `<KeepAlive>`                                                 | `v-show`، أو حالة محفوظة في composable                                  | [VIBE2902](https://vibejs.org/v0/errors/VIBE2902)                                                    |
| `<Transition>`                                                | انتقالات CSS على ارتباط `:class`                                         | [VIBE2903](https://vibejs.org/v0/errors/VIBE2903)                                                    |
| `<TransitionGroup>`                                           | رسوم CSS المتحركة على عناصر `v-for` ذات المفاتيح                        | [VIBE2904](https://vibejs.org/v0/errors/VIBE2904)                                                    |
| `<Suspense>`                                                  | `ref` يُملأ عند وصول البيانات، و`v-if`                                    | [VIBE2905](https://vibejs.org/v0/errors/VIBE2905)                                                    |
| `v-memo`                                                      | `computed`                                                              | [VIBE2906](https://vibejs.org/v0/errors/VIBE2906)                                                    |
| `v-once`                                                      | ثابت `const` في `<script setup>`                                        | [VIBE2907](https://vibejs.org/v0/errors/VIBE2907)                                                    |
| `v-cloak`                                                     | عنصر `<div id="app"></div>` عادي: تُترجَم القوالب مسبقًا، فلا يظهر قالب خام | [VIBE2909](https://vibejs.org/v0/errors/VIBE2909)                                                    |
| `@vue:mounted`, `@vnode-mounted`                              | `onMounted()` مع `useTemplateRef()`                                     | [VIBE2910](https://vibejs.org/v0/errors/VIBE2910)                                                    |
| `async setup()` و`await` في المستوى الأعلى من `<script setup>` | `const data = ref()` يملؤه وعد (promise)                                | [VIBE3002](https://vibejs.org/v0/errors/VIBE3002), [VIBE5204](https://vibejs.org/v0/errors/VIBE5204) |
| `<style module>`                                              | `<style scoped>`                                                        | [VIBE1007](https://vibejs.org/v0/errors/VIBE1007)                                                    |
| `v-bind(color)` في `<style>`                                  | `:style="{ '--color': color }"` و`var(--color)`                         | [VIBE4003](https://vibejs.org/v0/errors/VIBE4003)                                                    |
| `>>> .child`, `/deep/ .child`, `::v-deep`                     | `:deep(.child)`                                                         | [VIBE4004](https://vibejs.org/v0/errors/VIBE4004)                                                    |
| `<template src="./list.html">`                                | المحتوى المكتوب داخل `<template>`                                       | [VIBE1006](https://vibejs.org/v0/errors/VIBE1006)                                                    |
| `@pick.once="onPick"` على مكوّن                                | `@pick="onPick"` والفحص داخل `onPick`                                   | [VIBE2305](https://vibejs.org/v0/errors/VIBE2305)                                                    |
| `v-on="{ click, focus }"`                                     | `@click="click" @focus="focus"`                                         | [VIBE2302](https://vibejs.org/v0/errors/VIBE2302)                                                    |
| `<template #[name]>`                                          | `<template v-if="wide" #wide>` بأسماء ثابتة                             | [VIBE2605](https://vibejs.org/v0/errors/VIBE2605)                                                    |

## الـ API نفسه بسلوك مختلف {#same-api-different-behavior}

- يعمل `onBeforeMount` بعد بناء DOM المكوّن وقبل إدراجه، لذا يعمل خطاف الابن قبل خطاف الأب، وتكون مراجع القالب (template refs) معيَّنة بالفعل. راجع [ترتيب الخطافات](https://vibejs.org/v0/ui/lifecycle#hook-order).
- كل قراءة لـ prop تستدعي الأب وتقيّم التعبير المربوط من جديد؛ ضع الاشتقاقات المكلفة في `computed`. راجع [قراءة الـ props](https://vibejs.org/v0/ui/components#reading-props).
- لا يُعرَض المحتوى الاحتياطي للـ slot إلا عندما لا يمرّر الأب أي محتوى لذلك الـ slot، لا عندما لا يعرض المحتوى الممرَّر شيئًا. راجع [المحتوى الاحتياطي](https://vibejs.org/v0/ui/components#fallback-content).
- لا يحمل مرجع القالب على مكوّن إلا ما يمرّره المكوّن إلى `defineExpose()`، وليس نسخته أبدًا. راجع [كشف القيم](https://vibejs.org/v0/ui/components#exposing-values).
- تُربَط مستمعات الأحداث بالعناصر نفسها، دون تفويض (delegation). راجع [الأحداث](https://vibejs.org/v0/ui/template-syntax#events).
- في التطوير، يحتفظ تعديل القالب بحالة المكوّن لكنه ينشئ مكوّناته الأبناء من جديد. راجع [التحديثات الساخنة](https://vibejs.org/v0/ui/#hot-updates).
- استدعاء دالة slot في السكربت يعرض الـ slot وينشئ DOM الخاص به؛ اختبر `$slots.name` بدلًا من ذلك. راجع [الـ slots في السكربت](https://vibejs.org/v0/ui/components#slots-in-script).

## ما ليس في vibe.js {#not-in-vibejs}

استيراد أي من هذه من `@usevibejs/ui` يفشل في فحص الأنواع بالخطأ TS2305 (الوحدة ليس لها عضو مُصدَّر بهذا الاسم).

- `h()` ودوال العرض (render functions) وJSX: اكتب قالبًا؛ واختر مكوّنًا وقت التشغيل بـ `<component :is>`.
- `defineAsyncComponent`: يحمّل الموجّه (router) مكوّن المسار بنفسه من `() => import('./Page.vibe')`.
- `customRef`: `shallowRef` مع `watch`، أو `computed` مع `get` و`set`.
- `proxyRefs`: تفكّ القوالب refs المستوى الأعلى في `<script setup>`؛ وفي السكربت استخدم `.value` أو `reactive()`.
- `effect`: `watchEffect` أو `watchSyncEffect`.
- `getCurrentInstance`: تغطي `useAttrs()` و`useSlots()` و`useId()` و`inject()` استخدامات النسخة.
- `app.config.globalProperties`: `app.provide()` وcomposable يحقن القيمة.
- `defineCustomElement`: مخطط له في إصدار لاحق.
- `defineStore` وPinia: حالة على مستوى الوحدة في composable. راجع [الحالة المشتركة](https://vibejs.org/v0/ui/reactivity#shared-state).
- العرض على الخادم (SSR) والإماهة (hydration): يعرض v0.1 في المتصفح فقط؛ والعرض على الخادم مخطط له في إصدار لاحق.
