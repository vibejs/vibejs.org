# قادم من vue-router وVue Test Utils

`createRouter` و`RouterView` و`RouterLink` و`useRoute`، والمسارات المتداخلة، والـ guards التي تعيد موقعًا، و`mount` والأغلفة (wrappers)، كلها تعمل كما تتوقع. أما الفروق فتنبع من أربعة اختيارات:

- **مسارات ذات أنواع من ملف واحد.** تعرّف المسارات مرة واحدة بـ `defineRoutes()` وتسجّلها عبر `Register`، فيجري التحقق من الأسماء والمعاملات ومن كل `to`، حتى داخل القوالب. والمسارات ثابتة، فلا يوجد `addRoute()`.
- **استيراد صريح.** لا توجد مكوّنات عامة ولا خصائص للنسخة داخل القوالب. تستورد `RouterLink` و`RouterView`، وتأخذ المسار من `useRoute()`.
- **الـ guards تعيد قرارها.** يعيد الـ guard القيمة `false` أو موقعًا أو لا شيء، ولا يوجد `next()`.
- **الاختبارات تشغّل الشجرة الحقيقية.** يعرض `mount()` الأبناء الحقيقيين مع التطبيق الحقيقي. لا بدائل وهمية (stubs)، ولا تركيب سطحي (shallow mounting)، ولا نسخة مكوّن تتسلل إلى داخلها. تستعلم الاختبارات عن DOM بمحددات CSS.

## الموجِّه {#router}

| vue-router                                                                | vibe.js                                                                                                           | ما الذي يكشف الصيغة القديمة                                                                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next()` و`next(false)` و`next('/login')` داخل guard                      | `return` و`return false` و`return '/login'`                                                                       | [VIBE7107](https://vibejs.org/v0/errors/VIBE7107) للـ guard الذي يأخذ معاملًا ثالثًا                                                                          |
| `createWebHashHistory()`                                                  | `createWebHistory()`، مع خادم يرجع إلى `index.html` عند عدم وجود الملف                                            | غير مُصدَّر، فيظهر خطأ ترجمة                                                                                                                                  |
| `alias` و`sensitive` و`strict` و`parseQuery` وبقية الخيارات المؤجَّلة       | مسار يعيد التوجيه بدل الاسم البديل (alias)، وقواعد المطابقة الثابتة                                                | [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)، وهو يذكر البديل                                                                                         |
| `router.addRoute()` و`router.removeRoute()`                               | كل المسارات في `routes.ts`، مع guards و`meta` للمسارات التي تعتمد على المستخدم                                    | غير موجود في `Router`، فيظهر خطأ ترجمة؛ راجع [المسارات](https://vibejs.org/v0/ui/routing#routes)                                                           |
| العروض المسمّاة: `components: { default, sidebar }`                        | مسارات أبناء متداخلة، لكل منها مكوّن واحد                                                                          | [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)                                                                                                          |
| `<RouterView v-slot="{ Component }">` مع `KeepAlive` أو `Transition`      | `<RouterView />` دون محتوى                                                                                        | [VIBE7115](https://vibejs.org/v0/errors/VIBE7115)                                                                                                          |
| `<RouterLink custom v-slot="{ href, navigate }">`                         | `useLink({ to })` داخل مكوّن رابط تكتبه بنفسك                                                                      | `custom` ليست خاصية (prop)، فيظهر خطأ أنواع في القالب؛ راجع [useLink](https://vibejs.org/v0/ui/routing#routerview-and-routerlink)                          |
| `<RouterLink to="https://example.com">`                                   | وسم `<a href>` عادي                                                                                               | [VIBE7114](https://vibejs.org/v0/errors/VIBE7114)                                                                                                          |
| `<router-link>` و`<router-view>`                                          | `<RouterLink>` و`<RouterView>`                                                                                    | [VIBE2002](https://vibejs.org/v0/errors/VIBE2002) بعد استيراد المكوّن                                                                                       |
| `RouterLink` دون استيراد (تسجيل عام)                                      | `import { RouterLink, RouterView } from '@usevibejs/ui/router'`                                                   | [VIBE2001](https://vibejs.org/v0/errors/VIBE2001)                                                                                                          |
| `$route` و`$router` داخل القالب                                           | `const route = useRoute()` و`const router = useRouter()` في `<script setup lang="ts">`                            | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                                                                          |
| خيارات المكوّن `beforeRouteEnter` و`beforeRouteLeave` و`beforeRouteUpdate` | `beforeEnter` في سجل المسار أو `router.beforeEach()`؛ و`onBeforeRouteLeave()` و`onBeforeRouteUpdate()` داخل setup | [VIBE1004](https://vibejs.org/v0/errors/VIBE1004) لـ `<script>` بأسلوب الخيارات، و[VIBE3331](https://vibejs.org/v0/errors/VIBE3331) داخل `defineOptions()` |
| مسارات ذات أنواع من ملف مولَّد أو من `RouteNamedMap`                        | `defineRoutes([...])` و`interface Register { router: typeof router }`                                             | الاسم أو المعامل الخاطئ خطأ أنواع؛ راجع [المسارات ذات الأنواع](https://vibejs.org/v0/ui/routing#creating-the-router)                                         |
| `useRoute()` مع `route.params.id as string`                               | `useRoute('user')`، ومعاملاته ذات أنواع                                                                            | [VIBE7113](https://vibejs.org/v0/errors/VIBE7113) إذا لم يكن ذلك المسار معروضًا                                                                             |
| `defineStore()` و`storeToRefs()` من Pinia                                 | composable على مستوى الوحدة يعيد refs ودوالّ                                                                       | غير مُصدَّر، فيظهر خطأ ترجمة؛ راجع [الحالة المشتركة](https://vibejs.org/v0/ui/data#shared-state)                                                              |

## اختبار المكوّنات {#component-testing}

| Vue Test Utils                                   | vibe.js                                                          | ما الذي يكشف الصيغة القديمة                                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `mount(C, { global: { plugins: [router] } })`    | `mount(C, { plugins: [router] })`                                | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                                 |
| `global.provide`                                 | `provide`                                                        | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                                 |
| `global.stubs` و`stubs` و`shallow: true`         | الأبناء الحقيقيون، أو `vi.mock('./Child.vibe', ...)` لابن واحد     | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                                 |
| `shallowMount()`                                 | `mount()`                                                        | غير مُصدَّر، فيظهر خطأ ترجمة                                                                                         |
| `wrapper.findComponent(Child)` و`getComponent()` | محدد CSS على ما يعرضه الابن                                       | غير موجود في الغلاف، فيظهر خطأ ترجمة؛ راجع [العثور على العناصر](https://vibejs.org/v0/ui/testing#finding-elements) |
| `wrapper.vm.count` و`setData()`                  | افحص DOM، وابدأ من `props`                                       | غير موجود في الغلاف، فيظهر خطأ ترجمة؛ أما `data` فيعطي [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)           |
| `trigger('keydown.enter')`                       | `trigger('keydown', { key: 'Enter' })`                           | [VIBE7203](https://vibejs.org/v0/errors/VIBE7203)                                                                 |
| `enableAutoUnmount(afterEach)`                   | لا شيء: كل اختبار يفكّ تركيب ما ركّبه                               | غير مُصدَّر، فيظهر خطأ ترجمة                                                                                         |
| `attrs`                                          | السمات داخل `props`                                              | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                                 |
| `findByRole()` وبقية استعلامات Testing Library    | محددات CSS على الغلاف، أو أي مكتبة DOM على `wrapper.element`      | غير مُصدَّر، فيظهر خطأ ترجمة                                                                                         |
| `environment: 'happy-dom'`                       | `environment: 'jsdom'`، وهي البيئة التي تُختبَر فيها واجهة الاختبار | لا شيء وقت الترجمة؛ راجع [الإعداد](https://vibejs.org/v0/ui/testing#setup)                                          |

## guard في المقارنة {#a-guard-side-by-side}

هذا الـ guard في vue-router

```text
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isSignedIn()) next({ name: 'login' });
  else next();
});
```

يصبح guard يعيد قراره:

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn()) return { name: 'login' };
});
```

## اختبار في المقارنة {#a-test-side-by-side}

هذا الاختبار في Vue Test Utils

```text
const wrapper = mount(App, { global: { plugins: [router], stubs: { Chart: true } } });
expect(wrapper.findComponent(UserCard).props('id')).toBe(1);
```

يصبح اختبارًا يشغّل الشجرة الحقيقية ويقرأ DOM:

```ts
import { createMemoryHistory, createRouter } from '@usevibejs/ui/router';
import { flushPromises, mount } from '@usevibejs/ui/testing';
import { expect, vi } from 'vitest';
import App from './App.vibe';

vi.mock('./Chart.vibe', () => import('./test/ChartStub.vibe'));

const router = createRouter({ history: createMemoryHistory(), routes });
const wrapper = mount(App, { plugins: [router] });
await router.isReady();
await router.push('/users/1');
await flushPromises();
expect(wrapper.get('.user-card h2').text()).toBe('Ada');
```

## إلى أين بعد ذلك {#where-to-go-next}

- [التوجيه](https://vibejs.org/v0/ui/routing) و[اختبار المكوّنات](https://vibejs.org/v0/ui/testing) و[جلب البيانات](https://vibejs.org/v0/ui/data).
