# التوجيه

يربط الموجِّه (router) عنوان URL بسلسلة من سجلات المسارات ويعرض مكوّناتها. يأتي من `@usevibejs/ui/router`، وتتبع أنواعه مساراتك: أسماء المسارات ومعاملاتها وروابطها يفحصها TypeScript، في السكربتات وفي القوالب.

## المسارات {#routes}

تعيش المسارات في ملف واحد هو `ui/src/routes.ts`. تعيد `defineRoutes()` المصفوفة دون تغيير وتحتفظ بأسمائها ومساراتها الحرفية، وهي التي تُنمِّط الموجِّه.

```ts
export const routes = defineRoutes([
  { path: '/', name: 'home', component: HomePage },
  {
    path: '/users',
    component: UsersLayout,
    children: [
      { path: '', name: 'users', component: UserList },
      { path: ':id(\\d+)', name: 'user', component: () => import('./pages/UserPage.vibe') },
    ],
  },
  { path: '/people', redirect: { name: 'users' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
]);
```

في التطبيق، يكون `HomePage` وبقية المكوّنات استيرادات افتراضية من ملفات `.vibe`.

يقبل السجل `path` و`name` و`component` و`props` و`children` و`redirect` و`meta` و`beforeEnter`. أي مفتاح آخر يفشل عند بدء التشغيل بالرمز [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)، فلا يُتجاهل أي خيار مكتوب بشكل خاطئ. الأسماء فريدة ([VIBE7102](https://vibejs.org/v0/errors/VIBE7102)).

## إنشاء الموجِّه {#creating-the-router}

تأخذ `createRouter()` السجل التاريخي (history) والمسارات و`scrollBehavior` اختياريًا. يثبّته `app.use(router)` ويبدأ أول عملية تنقّل.

```ts
const router = createRouter({ history: createWebHistory(), routes });

declare module '@usevibejs/ui/router' {
  interface Register {
    router: typeof router;
  }
}

createApp(App).use(router).mount('#app');
```

- تستخدم `createWebHistory(base?)` عنوان URL وسجل التصفح في المتصفح. مرّر `base` عندما يُقدَّم التطبيق تحت مسار فرعي، مثل `'/app'`.
- تحتفظ `createMemoryHistory(base?)` بالسجل في الذاكرة: للاختبارات وللبيئات التي لا تملك نافذة ([VIBE7117](https://vibejs.org/v0/errors/VIBE7117)).

يُنمِّط التصريح `Register` كل واجهات الموجِّه بمساراتك: `useRoute()` و`useRouter()` و`router.push()` والحراس والخاصية `to` في `RouterLink`. صرّح به مرة واحدة لكل تطبيق، بجانب `createRouter()`.

## RouterView وRouterLink {#routerview-and-routerlink}

يعرض `RouterView` مكوّن السجل المطابق، ويعرض `RouterView` داخل ذلك المكوّن الابن المطابق. ويعرض `RouterLink` عنصر `<a>` يتنقّل داخل التطبيق. يُستورد كلاهما حيث يُستخدم؛ فلا توجد مكوّنات عامة.

```vibe
<script setup lang="ts">
import { RouterLink, RouterView } from '@usevibejs/ui/router';
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink :to="{ name: 'user', params: { id: 42 } }">User 42</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
```

- `to` هو مسار أو كائن موقع: `{ name, params, query, hash }` أو `{ path, query, hash }`. الاسم غير الموجود، أو المعامل المفقود، أو المعامل ذو النوع الخاطئ هو خطأ نوعي في القالب.
- يستبدل `replace` مدخل السجل الحالي بدلًا من إضافة مدخل جديد.
- يحصل الرابط على الصنف `router-link-active` ما دام مساره جزءًا من المسار الحالي، وعلى `router-link-exact-active` و`aria-current="page"` ما دام هو المسار الحالي. وتغيّرها `activeClass` و`exactActiveClass` و`ariaCurrentValue`.
- النقرات مع مفتاح مُعدِّل، أو بالزر الأوسط، أو على رابط ذي `target="_blank"` تُترك للمتصفح.
- `to` دائمًا موقع داخل التطبيق. استخدم `<a href>` عاديًا للمواقع الأخرى ([VIBE7114](https://vibejs.org/v0/errors/VIBE7114)).
- لا يقبل `RouterView` محتوى فتحة ([VIBE7115](https://vibejs.org/v0/errors/VIBE7115)).

عندما يحتاج الرابط إلى ترميز مختلف، ابنِه بـ `useLink()`. تعيد `href` و`isActive` و`isExactActive` و`route` المحلول، و`navigate(event)` التي تطبّق قواعد النقر نفسها:

```vibe
<script setup lang="ts">
import { useLink, type RouteLocationRaw } from '@usevibejs/ui/router';

const props = defineProps<{ to: RouteLocationRaw; label: string }>();
const { href, isActive, navigate } = useLink({ to: () => props.to });
</script>

<template>
  <li :class="{ selected: isActive }">
    <a :href="href" @click="navigate">{{ label }}</a>
  </li>
</template>
```

## قراءة المسار {#reading-the-route}

تعيد `useRoute()` المسار الحالي؛ وهو تفاعلي، فتتحدث القوالب والقيم المحسوبة التي تقرؤه مع كل عملية تنقّل. وتعيد `useRouter()` الموجِّه.

```vibe
<script setup lang="ts">
import { computed } from '@usevibejs/ui';
import { useRoute, useRouter } from '@usevibejs/ui/router';

const route = useRoute('user');
const router = useRouter();
const id = computed(() => Number(route.params.id));
</script>

<template>
  <h1>User {{ id }}</h1>
  <button type="button" @click="router.push({ name: 'user', params: { id: id + 1 } })">
    Next
  </button>
</template>
```

تُنمِّط `useRoute('user')` المعاملات `params` بحسب المسار `user`. وترمي [VIBE7113](https://vibejs.org/v0/errors/VIBE7113) عندما لا يكون ذلك المسار جزءًا من المسار الحالي، ولذلك استدعها فقط في صفحة ذلك المسار وأبنائه. للمسار الحقول `path` و`fullPath` و`name` و`params` و`query` و`hash` و`matched` و`meta` و`redirectedFrom`.

عندما تبقى الصفحة نفسها معروضة مع معامل آخر، كالانتقال من `/users/1` إلى `/users/2`، تُحفظ نسخة المكوّن: اقرأ المعاملات بشكل تفاعلي بدلًا من نسخها مرة واحدة في setup.

### المعاملات كخصائص {#params-as-props}

مع `props: true` على سجل، تستقبل الصفحة المعاملات كخصائص. نمِّطها بـ `RouteParams`:

```vibe
<script setup lang="ts">
import type { RouteParams } from '@usevibejs/ui/router';

const { id } = defineProps<RouteParams<'user'>>();
</script>

<template>
  <h1>User {{ id }}</h1>
</template>
```

تقبل `props` أيضًا كائنًا من خصائص ثابتة، أو دالة من المسار إلى الخصائص.

## المسارات والمعاملات {#paths-and-params}

المسار قائمة مقاطع تفصل بينها `/`. كل مقطع إما نص ثابت أو معامل واحد بالضبط ([VIBE7101](https://vibejs.org/v0/errors/VIBE7101)):

| المقطع     | يطابق                            | نوع المعامل       |
| ---------- | -------------------------------- | ----------------- |
| `:id`      | مقطعًا واحدًا                      | `string`          |
| `:id(\d+)` | مقطعًا واحدًا يطابق التعبير النمطي | `string`          |
| `:id?`     | مقطعًا اختياريًا                   | `string`، اختياري |
| `:parts+`  | مقطعًا واحدًا أو أكثر              | `string[]`        |
| `:parts*`  | صفر مقطع أو أكثر                 | `string[]`        |

تتطابق المسارات دون اعتبار لحالة الأحرف، والشرطة المائلة الأخيرة اختيارية، ويفوز المسار الأكثر تحديدًا بغض النظر عن ترتيب السجلات. وعند التنقّل تقبل المعاملات أرقامًا أيضًا. يطابق `/:pathMatch(.*)*` كل مسار لا يطابقه أي مسار آخر.

## التنقّل {#navigating}

تأخذ `router.push(to)` و`router.replace(to)` المواقع نفسها التي يأخذها `RouterLink`. وتُحَلّان عند انتهاء التنقّل: بالقيمة `undefined` عند نجاحه، أو بفشل تنقّل عندما ألغاه حارس، أو حلّ محله تنقّل أحدث، أو كان الهدف هو المسار الحالي. ولا تُرفضان إلا عندما يرمي حارس أو إعادة توجيه أو محمِّل كسول خطأ، بعد أن يصل الخطأ إلى `router.onError()`.

```ts
const failure = await router.push({ path: '/users', query: { page: '2' } });
if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  console.log('A guard kept the current page.');
}
```

تتحرك `router.back()` و`router.forward()` و`router.go(delta)` عبر السجل. وتعيد `router.resolve(to)` المسار و`href` الخاص به دون تنقّل.

## الحراس {#guards}

يستقبل الحارس `to` و`from` ويقرر بقيمة إعادته:

- لا شيء أو `true`: المتابعة؛
- `false`: الإلغاء، والبقاء في المسار الحالي؛
- موقع: إعادة التوجيه إليه.

قد يكون الحارس غير متزامن. ولا يأخذ أبدًا معاملًا ثالثًا ([VIBE7107](https://vibejs.org/v0/errors/VIBE7107)).

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn())
    return { path: '/login', query: { next: to.fullPath } };
});
```

تعمل حراس عملية تنقّل واحدة بهذا الترتيب، كلٌّ بعد انتهاء سابقه:

1. `onBeforeRouteLeave` للصفحات المغادَرة، من الأعمق إلى الأقرب.
2. `router.beforeEach`.
3. `onBeforeRouteUpdate` للصفحات التي تبقى.
4. `beforeEnter` للسجلات الداخلة.
5. تحميل المكوّنات الكسولة للسجلات الداخلة.
6. `router.beforeResolve`.

ثم يتغير المسار، وتُعرض العروض، ويعمل `router.afterEach(to, from, failure?)`. تعمل الحراس وإعادات التوجيه والمحمِّلات والخطافات في سياق الحقن الخاص بالتطبيق، فيمكنها استدعاء `inject()` للقيم التي يوفّرها التطبيق. الحارس الذي يرمي خطأ يلغي التنقّل؛ ويصل الخطأ إلى `router.onError()`، أو إلى وحدة التحكم عندما لا يُسجَّل معالج.

تحرس الصفحةُ مسارَها بنفسها عبر `onBeforeRouteLeave` و`onBeforeRouteUpdate` في setup الخاص بها. وتُزال عند إلغاء تركيب الصفحة.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';
import { onBeforeRouteLeave } from '@usevibejs/ui/router';

const draft = ref('');
onBeforeRouteLeave(() => draft.value === '' || window.confirm('Discard the draft?'));
</script>

<template>
  <textarea v-model="draft"></textarea>
</template>
```

وهي تعمل فقط في مكوّن يعرضه `RouterView` وفي أبنائه ([VIBE7112](https://vibejs.org/v0/errors/VIBE7112)).

## الصفحات الكسولة {#lazy-pages}

الـ `component` الذي هو دالة يُحمَّل عند أول تنقّل إلى مساره، قبل أن يتغير المسار، ويُحتفظ به للتنقلات اللاحقة: `() => import('./pages/UserPage.vibe')`. يضع البناء كل صفحة كسولة في جزء (chunk) خاص بها.

بعد النشر، قد يطلب تبويب مفتوح جزءًا لم يعد موجودًا. يفشل التنقّل عندئذ بالرمز [VIBE7109](https://vibejs.org/v0/errors/VIBE7109)؛ حمِّل الهدف كصفحة كاملة للحصول على الإصدار الجديد:

```ts
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});
```

## سلوك التمرير {#scroll-behavior}

مع سجل الويب، يستعيد الموجِّه موضع التمرير عند الرجوع والتقدّم، ويمرّر إلى عنصر الـ hash، ويحتفظ بالموضع عندما يتغير الاستعلام فقط، ويمرّر إلى الأعلى فيما عدا ذلك. يستبدل `scrollBehavior` هذا السلوك: يعيد موضعًا، أو `{ el }` لعنصر، أو `false` لترك التمرير كما هو، أو لا شيء للتمرير إلى الأعلى.

```ts
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});
```

يتمرّر العنصر إلى مجال الرؤية مع `scroll-margin-top` الخاص به، الذي يترك مساحة لترويسة ثابتة.

## الإعلان عن تغيّر المسار {#announcing-route-changes}

لا يلاحظ قارئ الشاشة أن الصفحة تغيّرت. أعلِن عن الصفحة الجديدة في منطقة حيّة (live region) بعد كل تنقّل، وأعطِ كل صفحة `document.title`:

```ts
const status = document.createElement('p');
status.setAttribute('aria-live', 'polite');
status.className = 'visually-hidden';
document.body.append(status);

router.afterEach((to, from, failure) => {
  if (failure) return;
  status.textContent = `${document.title}, page loaded`;
});
```

## انظر أيضًا {#see-also}

- [تحميل البيانات](https://vibejs.org/v0/ui/data): حمّل بيانات المسار الحالي باستخدام `useAsync`.
- [اختبار المكوّنات](https://vibejs.org/v0/ui/testing#testing-with-the-router): اختبر الصفحات بسجل في الذاكرة.
