# القادم من vue-router وVue Test Utils

تعمل `createRouter` و`RouterView` و`RouterLink` و`useRoute` والمسارات المتداخلة والـ guards التي تُرجع موقعًا و`mount` والمُغلِّفات (wrappers) كما تتوقع. وما يختلف ينتج عن أربعة اختيارات:

- **مسارات مُنمَّطة من ملف واحد.** تُعلَن المسارات مرة واحدة بـ `defineRoutes()` وتُسجَّل بـ `Register`، فتُفحَص الأسماء والمعاملات وكل `to`، في القوالب أيضًا. المسارات ثابتة: لا توجد `addRoute()`.
- **استيرادات صريحة.** لا توجد مكوّنات عامة ولا خصائص نسخة في القوالب: يُستورَد `RouterLink` و`RouterView`، ويأتي المسار من `useRoute()`.
- **الـ guards تُرجع قرارها.** يُرجع الـ guard القيمة `false` أو موقعًا أو لا شيء؛ ولا توجد `next()`.
- **الاختبارات تشغّل الشجرة الحقيقية.** يعرض `mount()` الأبناء الحقيقيين مع التطبيق الحقيقي؛ فلا بدائل (stubs) ولا تركيب سطحي (shallow mounting) ولا نسخة مكوّن يمكن النفاذ إليها. تستعلم الاختبارات عن DOM بمحددات CSS.

## الموجّه {#router}

| vue-router                                                                | vibe.js                                                                                                     | ما الذي يكشف الصيغة القديمة                                                                                                                      |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next()` و`next(false)` و`next('/login')` في guard                        | `return` و`return false` و`return '/login'`                                                                 | [VIBE7107](https://vibejs.org/v0/errors/VIBE7107) للـ guard ذي المعامل الثالث                                                                    |
| `createWebHashHistory()`                                                  | `createWebHistory()`، مع رجوع الخادم إلى `index.html`                                                       | غير مُصدَّرة، خطأ ترجمة                                                                                                                             |
| `alias` و`sensitive` و`strict` و`parseQuery` وسائر الخيارات المؤجلة       | مسار يعيد التوجيه بدلًا من alias؛ وقواعد المطابقة الثابتة                                                     | [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)، الذي يسمّي البديل                                                                              |
| `router.addRoute()` و`router.removeRoute()`                               | كل مسار في `routes.ts`؛ وguards و`meta` للمسارات التي تعتمد على المستخدم                                    | غير موجودة في `Router`، خطأ ترجمة؛ راجع [المسارات](https://vibejs.org/v0/ui/routing#routes)                                                      |
| العروض المسمّاة: `components: { default, sidebar }`                        | مسارات فرعية متداخلة، لكل منها مكوّن واحد                                                                    | [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)                                                                                                |
| `<RouterView v-slot="{ Component }">` مع `KeepAlive` أو `Transition`      | `<RouterView />` بلا محتوى                                                                                   | [VIBE7115](https://vibejs.org/v0/errors/VIBE7115)                                                                                                |
| `<RouterLink custom v-slot="{ href, navigate }">`                         | `useLink({ to })` في مكوّن الرابط الخاص بك                                                                   | `custom` ليس prop، خطأ نوع في القالب؛ راجع [useLink](https://vibejs.org/v0/ui/routing#routerview-and-routerlink)                                 |
| `<RouterLink to="https://example.com">`                                   | عنصر `<a href>` عادي                                                                                        | [VIBE7114](https://vibejs.org/v0/errors/VIBE7114)                                                                                                |
| `<router-link>` و`<router-view>`                                          | `<RouterLink>` و`<RouterView>`                                                                              | [VIBE2002](https://vibejs.org/v0/errors/VIBE2002) بعد استيراد المكوّن                                                                             |
| استخدام `RouterLink` بلا استيراد (تسجيل عام)                               | `import { RouterLink, RouterView } from '@usevibejs/ui/router'`                                             | [VIBE2001](https://vibejs.org/v0/errors/VIBE2001)                                                                                                |
| `$route` و`$router` في قالب                                               | `const route = useRoute()` و`const router = useRouter()` في `<script setup lang="ts">`                      | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                                                                |
| خيارات المكوّن `beforeRouteEnter` و`beforeRouteLeave` و`beforeRouteUpdate` | `beforeEnter` على السجل أو `router.beforeEach()`؛ و`onBeforeRouteLeave()` و`onBeforeRouteUpdate()` في setup | [VIBE1004](https://vibejs.org/v0/errors/VIBE1004) لـ `<script>` الخيارات، [VIBE3331](https://vibejs.org/v0/errors/VIBE3331) في `defineOptions()` |
| مسارات مُنمَّطة من ملف مولَّد أو `RouteNamedMap`                               | `defineRoutes([...])` و`interface Register { router: typeof router }`                                       | اسم أو معامل خاطئ هو خطأ نوع؛ راجع [المسارات المُنمَّطة](https://vibejs.org/v0/ui/routing#creating-the-router)                                      |
| `useRoute()` مع `route.params.id as string`                               | `useRoute('user')`، التي معاملاتها مُنمَّطة                                                                     | [VIBE7113](https://vibejs.org/v0/errors/VIBE7113) عندما لا يكون ذلك المسار معروضًا                                                                 |
| `defineStore()` و`storeToRefs()` من Pinia                                 | composable على مستوى الوحدة يُرجع refs ودوال                                                                 | غير مُصدَّرة، خطأ ترجمة؛ راجع [الحالة المشتركة](https://vibejs.org/v0/ui/data#shared-state)                                                         |

## اختبار المكوّنات {#component-testing}

| Vue Test Utils                                   | vibe.js                                                      | ما الذي يكشف الصيغة القديمة                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `mount(C, { global: { plugins: [router] } })`    | `mount(C, { plugins: [router] })`                            | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                        |
| `global.provide`                                 | `provide`                                                    | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                        |
| `global.stubs` و`stubs` و`shallow: true`         | الأبناء الحقيقيون، أو `vi.mock('./Child.vibe', ...)` لابن واحد | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                        |
| `shallowMount()`                                 | `mount()`                                                    | غير مُصدَّرة، خطأ ترجمة                                                                                     |
| `wrapper.findComponent(Child)` و`getComponent()` | محدِّد CSS على ما يعرضه الابن                                   | غير موجودة في المُغلِّف، خطأ ترجمة؛ راجع [إيجاد العناصر](https://vibejs.org/v0/ui/testing#finding-elements) |
| `wrapper.vm.count` و`setData()`                  | تحقق من DOM؛ وابدأ من `props`                                | غير موجودة في المُغلِّف، خطأ ترجمة؛ و`data` هو [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)            |
| `trigger('keydown.enter')`                       | `trigger('keydown', { key: 'Enter' })`                       | [VIBE7203](https://vibejs.org/v0/errors/VIBE7203)                                                        |
| `enableAutoUnmount(afterEach)`                   | لا شيء: كل اختبار يفكّ تركيب ما ركّبه                           | غير مُصدَّرة، خطأ ترجمة                                                                                     |
| `attrs`                                          | السمات في `props`                                            | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                        |
| `findByRole()` وسائر استعلامات Testing Library    | محددات CSS على المُغلِّف، أو أي مكتبة DOM على `wrapper.element` | غير مُصدَّرة، خطأ ترجمة                                                                                     |
| `environment: 'happy-dom'`                       | `environment: 'jsdom'`، البيئة التي يُختبَر فيها API الاختبار   | لا شيء وقت الترجمة؛ راجع [الإعداد](https://vibejs.org/v0/ui/testing#setup)                                 |

## guard جنبًا إلى جنب {#a-guard-side-by-side}

الـ guard في vue-router

```text
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isSignedIn()) next({ name: 'login' });
  else next();
});
```

يُرجع قراره:

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn()) return { name: 'login' };
});
```

## اختبار جنبًا إلى جنب {#a-test-side-by-side}

اختبار Vue Test Utils

```text
const wrapper = mount(App, { global: { plugins: [router], stubs: { Chart: true } } });
expect(wrapper.findComponent(UserCard).props('id')).toBe(1);
```

يشغّل الشجرة الحقيقية ويقرأ DOM:

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

- [التوجيه](https://vibejs.org/v0/ui/routing) و[اختبار المكوّنات](https://vibejs.org/v0/ui/testing) و[تحميل البيانات](https://vibejs.org/v0/ui/data).
