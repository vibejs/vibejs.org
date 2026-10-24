# قادم من Vue

معظم ما تعرفه من Vue 3 مع `<script setup>` ينطبق هنا كما هو:

- **مكوّنات الملف الواحد:** في ملف `.vibe` الكتل `<script setup lang="ts">` و`<template>` و`<style scoped>`، ويستخدم القالب التوجيهات (directives) نفسها: `v-if` و`v-for` و`v-show` و`v-model` و`v-bind` و`v-on` و`v-slot` و`v-html` و`v-text`، بالاختصارات والمعدِّلات (modifiers) نفسها.
- **التفاعلية:** `ref` و`shallowRef` و`reactive` و`readonly` و`computed` و`watch` و`watchEffect` و`effectScope` و`nextTick` و`toRef` و`toRefs` و`toValue` لها التواقيع والأنواع والدلالات نفسها. تستوردها من `@usevibejs/ui`.
- **المكوّنات:** `defineProps` و`defineEmits` و`defineSlots` و`defineModel` و`defineExpose` و`defineOptions` وحدات ماكرو (macros)، وخطافات دورة الحياة بالأسماء نفسها. و`provide`/`inject` مع `InjectionKey`، و`useTemplateRef` و`useAttrs` و`useSlots` و`useId` تعمل كما في Vue.
- **التطبيق:** `createApp(App).mount('#app')` و`app.use()` و`app.provide()` و`app.config.errorHandler` و`app.config.warnHandler`.

يُترجَم القالب إلى كود ينشئ عقد DOM مباشرة، ولا يحدّث إلا الارتباطات التي تغيّرت حالتها، فلا يوجد DOM افتراضي. كل شيء مكتوب بـ TypeScript. وإذا استخدمت صيغة من Vue لا يدعمها vibe.js، أبلغ عنها المترجم برمز `VIBE####` تعرض صفحته البديل.

## الأنماط الشائعة {#idioms}

| Vue                                                              | vibe.js                                                                 | ما الذي يكشف صيغة Vue                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `app.component('TodoItem', TodoItem)`                            | `import TodoItem from './TodoItem.vibe'` في كل ملف يستخدمه              | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.mixin({ ... })`                                             | composable مثل `useFeature()`                                           | [VIBE5301](https://vibejs.org/v0/errors/VIBE5301)                                                    |
| `app.directive('focus', ...)`، `v-focus`                         | `useTemplateRef('input')` مع `onMounted()`                              | [VIBE2908](https://vibejs.org/v0/errors/VIBE2908)، [VIBE5301](https://vibejs.org/v0/errors/VIBE5301) |
| `<script>` مع `export default { data() {} }`                     | `<script setup lang="ts">`                                              | [VIBE1004](https://vibejs.org/v0/errors/VIBE1004)                                                    |
| `<script setup>` دون `lang`، أو مع `lang="js"`                   | `<script setup lang="ts">`                                              | [VIBE1005](https://vibejs.org/v0/errors/VIBE1005)                                                    |
| `<todo-item>`                                                    | `<TodoItem>`                                                            | [VIBE2002](https://vibejs.org/v0/errors/VIBE2002)                                                    |
| `ref="input"` مع `const input = ref(null)`                       | `const input = useTemplateRef<HTMLInputElement>('input')`               | [VIBE2701](https://vibejs.org/v0/errors/VIBE2701)                                                    |
| `defineProps({ title: String })`                                 | `defineProps<{ title: string }>()`                                      | [VIBE3101](https://vibejs.org/v0/errors/VIBE3101)                                                    |
| `withDefaults(defineProps<Props>(), { size: 'md' })`             | `const { size = 'md' } = defineProps<Props>()`                          | [VIBE3006](https://vibejs.org/v0/errors/VIBE3006)                                                    |
| `const { title, ...rest } = defineProps<Props>()`                | `const { title } = defineProps<Props>()` مع `$attrs`                    | [VIBE3104](https://vibejs.org/v0/errors/VIBE3104)                                                    |
| `defineEmits(['pick'])`                                          | `defineEmits<{ pick: [id: string] }>()`                                 | [VIBE3201](https://vibejs.org/v0/errors/VIBE3201)                                                    |
| `defineEmits<{ (e: 'pick', id: string): void }>()`               | `defineEmits<{ pick: [id: string] }>()`                                 | [VIBE3202](https://vibejs.org/v0/errors/VIBE3202)                                                    |
| `<script setup lang="ts" generic="T">`                           | `defineProps<{ items: Item[] }>()` بنوع محدد                            | [VIBE1013](https://vibejs.org/v0/errors/VIBE1013)                                                    |
| `<component is="TodoItem">`، `:is="'TodoItem'"`                  | `<component :is="TodoItem">` مع المكوّن المستورد                         | [VIBE2006](https://vibejs.org/v0/errors/VIBE2006)، [VIBE5207](https://vibejs.org/v0/errors/VIBE5207) |
| `$el` أو `$parent` أو `$refs` أو `this` في القالب                | `useTemplateRef('name')` ومتغيرات `<script setup>`                      | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                    |
| `v-model="title"` و`title` خاصية (prop)                          | `const title = defineModel<string>('title')`                            | [VIBE2504](https://vibejs.org/v0/errors/VIBE2504)                                                    |
| `v-for` دون `:key`                                               | `v-for="item in items" :key="item.id"`                                  | [VIBE2203](https://vibejs.org/v0/errors/VIBE2203)                                                    |
| `v-if` و`v-for` على العنصر نفسه                                  | `<template v-for>` يحيط بـ `v-if`، أو قائمة `computed`                  | [VIBE2103](https://vibejs.org/v0/errors/VIBE2103)                                                    |
| `<Teleport to="body">`                                           | عنصر `<dialog>` أصلي أو السمة `popover`                                 | [VIBE2901](https://vibejs.org/v0/errors/VIBE2901)                                                    |
| `<KeepAlive>`                                                    | `v-show`، أو حالة محفوظة في composable                                  | [VIBE2902](https://vibejs.org/v0/errors/VIBE2902)                                                    |
| `<Transition>`                                                   | انتقالات CSS على ارتباط `:class`                                         | [VIBE2903](https://vibejs.org/v0/errors/VIBE2903)                                                    |
| `<TransitionGroup>`                                              | حركات CSS على عناصر `v-for` ذات مفاتيح                                  | [VIBE2904](https://vibejs.org/v0/errors/VIBE2904)                                                    |
| `<Suspense>`                                                     | `ref` يمتلئ حين تصل البيانات، مع `v-if`                                 | [VIBE2905](https://vibejs.org/v0/errors/VIBE2905)                                                    |
| `v-memo`                                                         | `computed`                                                              | [VIBE2906](https://vibejs.org/v0/errors/VIBE2906)                                                    |
| `v-once`                                                         | ثابت `const` في `<script setup>`                                        | [VIBE2907](https://vibejs.org/v0/errors/VIBE2907)                                                    |
| `v-cloak`                                                        | `<div id="app"></div>` عادي: القوالب تُترجَم مسبقًا، فلا يظهر قالب خام أبدًا | [VIBE2909](https://vibejs.org/v0/errors/VIBE2909)                                                    |
| `@vue:mounted`، `@vnode-mounted`                                 | `onMounted()` مع `useTemplateRef()`                                     | [VIBE2910](https://vibejs.org/v0/errors/VIBE2910)                                                    |
| `async setup()`، أو `await` في المستوى الأعلى من `<script setup>` | `const data = ref()` يمتلئ من promise                                   | [VIBE3002](https://vibejs.org/v0/errors/VIBE3002)، [VIBE5204](https://vibejs.org/v0/errors/VIBE5204) |
| `<style module>`                                                 | `<style scoped>`                                                        | [VIBE1007](https://vibejs.org/v0/errors/VIBE1007)                                                    |
| `v-bind(color)` داخل `<style>`                                   | `:style="{ '--color': color }"` مع `var(--color)`                       | [VIBE4003](https://vibejs.org/v0/errors/VIBE4003)                                                    |
| `>>> .child`، `/deep/ .child`، `::v-deep`                        | `:deep(.child)`                                                         | [VIBE4004](https://vibejs.org/v0/errors/VIBE4004)                                                    |
| `<template src="./list.html">`                                   | المحتوى مكتوبًا داخل `<template>`                                        | [VIBE1006](https://vibejs.org/v0/errors/VIBE1006)                                                    |
| `@pick.once="onPick"` على مكوّن                                   | `@pick="onPick"` مع الشرط داخل `onPick`                                 | [VIBE2305](https://vibejs.org/v0/errors/VIBE2305)                                                    |
| `v-on="{ click, focus }"`                                        | `@click="click" @focus="focus"`                                         | [VIBE2302](https://vibejs.org/v0/errors/VIBE2302)                                                    |
| `<template #[name]>`                                             | `<template v-if="wide" #wide>` بأسماء ثابتة                             | [VIBE2605](https://vibejs.org/v0/errors/VIBE2605)                                                    |

## الـ API نفسها وسلوك مختلف {#same-api-different-behavior}

- يعمل `onBeforeMount` بعد بناء DOM المكوّن وقبل إدراجه في الصفحة. لذلك يعمل خطاف الابن قبل خطاف الأب، وتكون template refs مضبوطة مسبقًا. راجع [ترتيب الخطافات](https://vibejs.org/v0/ui/lifecycle#hook-order).
- كل قراءة لخاصية (prop) تستدعي الأب وتعيد حساب التعبير المرتبط بها، فضع الاشتقاقات المكلفة في `computed`. راجع [قراءة الخصائص](https://vibejs.org/v0/ui/components#reading-props).
- المحتوى الاحتياطي للـ slot لا يُعرض إلا إذا لم يمرّر الأب أي محتوى له، وليس حين يمرّر محتوى لا يعرض شيئًا. راجع [المحتوى الاحتياطي](https://vibejs.org/v0/ui/components#fallback-content).
- الـ template ref على مكوّن لا يحمل إلا ما يمرّره المكوّن إلى `defineExpose()`، ولا يحمل نسخة المكوّن أبدًا. راجع [كشف القيم](https://vibejs.org/v0/ui/components#exposing-values).
- مستمعو الأحداث يُربطون بالعناصر نفسها، دون تفويض (delegation). راجع [الأحداث](https://vibejs.org/v0/ui/template-syntax#events).
- أثناء التطوير، تعديل القالب يحفظ حالة المكوّن لكنه ينشئ مكوّناته الأبناء من جديد. راجع [التحديثات الفورية](https://vibejs.org/v0/ui/#hot-updates).
- استدعاء دالة slot داخل السكربت يعرض الـ slot وينشئ DOM الخاص به، فافحص `$slots.name` بدلًا من ذلك. راجع [الـ slots في السكربت](https://vibejs.org/v0/ui/components#slots-in-script).

## غير موجود في vibe.js {#not-in-vibejs}

إذا استوردت أيًّا من هذه من `@usevibejs/ui` فشل التحقق من الأنواع بالخطأ TS2305 (الوحدة لا تصدّر هذا العضو).

- `h()` ودوال العرض (render functions) وJSX: اكتب قالبًا، واختر المكوّن وقت التشغيل بـ `<component :is>`.
- `defineAsyncComponent`: الموجِّه نفسه يحمّل مكوّن المسار من `() => import('./Page.vibe')`.
- `customRef`: استخدم `shallowRef` مع `watch`، أو `computed` مع `get` و`set`.
- `proxyRefs`: القوالب تفكّ تغليف الـ refs في المستوى الأعلى من `<script setup>`، وفي السكربت استخدم `.value` أو `reactive()`.
- `effect`: استخدم `watchEffect` أو `watchSyncEffect`.
- `getCurrentInstance`: تغطي `useAttrs()` و`useSlots()` و`useId()` و`inject()` استخدامات النسخة.
- `app.config.globalProperties`: استخدم `app.provide()` مع composable يحقن القيمة.
- `defineCustomElement`: مخطط له في إصدار لاحق.
- `defineStore` وPinia: حالة على مستوى الوحدة (module scope) داخل composable. راجع [الحالة المشتركة](https://vibejs.org/v0/ui/reactivity#shared-state).
- العرض من جهة الخادم والإماهة (hydration): الإصدار v0.1 يعرض في المتصفح فقط، والعرض من جهة الخادم مخطط له في إصدار لاحق.
