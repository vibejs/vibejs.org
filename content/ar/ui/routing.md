# التوجيه

يربط الموجِّه عنوان URL بسلسلة من سجلّات المسارات، ويعرض مكوّناتها. تستورده من `@usevibejs/ui/router`، وأنواعه مبنية على مساراتك: يتحقق TypeScript من أسماء المسارات ومعاملاتها والروابط، في السكربتات وفي القوالب.

## المسارات {#routes}

تضع المسارات في ملف واحد هو `ui/src/routes.ts`. تعيد `defineRoutes()` المصفوفة كما هي، لكنها تحتفظ بالأسماء والمسارات حرفيًا، ومنها تُستمد أنواع الموجِّه.

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

في التطبيق، `HomePage` وبقية المكوّنات استيرادات افتراضية من ملفات `.vibe`.

يقبل السجلّ `path` و`name` و`component` و`props` و`children` و`redirect` و`meta` و`beforeEnter`. وأي مفتاح آخر يُفشل التشغيل منذ البداية بالرمز [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)، فلا يمر خيار مكتوب خطأً دون أن تنتبه. ويجب ألا تتكرّر الأسماء ([VIBE7102](https://vibejs.org/v0/errors/VIBE7102)).

## إنشاء الموجِّه {#creating-the-router}

تأخذ `createRouter()` السجلّ التاريخي (history) والمسارات، و`scrollBehavior` اختياريًا. ويثبّته `app.use(router)` ويبدأ التنقّل الأول.

```ts
const router = createRouter({ history: createWebHistory(), routes });

declare module '@usevibejs/ui/router' {
  interface Register {
    router: typeof router;
  }
}

createApp(App).use(router).mount('#app');
```

- تستخدم `createWebHistory(base?)` عنوان URL وسجلّ التاريخ في المتصفح. مرّر `base` إذا كان التطبيق يُقدَّم تحت مسار، مثل `'/app'`.
- تحفظ `createMemoryHistory(base?)` السجلّ في الذاكرة، وهي للاختبارات وللبيئات التي لا نافذة فيها ([VIBE7117](https://vibejs.org/v0/errors/VIBE7117)).

يربط تعريف `Register` كل واجهات الموجِّه بأنواع مساراتك: `useRoute()` و`useRouter()` و`router.push()` وguards والخاصية `to` في `RouterLink`. عرّفه مرة واحدة لكل تطبيق، بجانب `createRouter()`.

## RouterView وRouterLink {#routerview-and-routerlink}

يعرض `RouterView` مكوّن السجلّ المطابق، و`RouterView` داخل ذلك المكوّن يعرض الابن المطابق. ويعرض `RouterLink` عنصر `<a>` ينقلك داخل التطبيق. تستورد الاثنين حيث تستخدمهما، فلا توجد مكوّنات عامة.

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

- `to` مسار أو كائن موقع: `{ name, params, query, hash }` أو `{ path, query, hash }`. الاسم غير الموجود، أو المعامل الناقص، أو المعامل ذو النوع الخطأ، كلها أخطاء أنواع في القالب.
- `replace` يستبدل المدخل الحالي في السجلّ بدل إضافة مدخل جديد.
- يأخذ الرابط الصنف `router-link-active` ما دام مساره جزءًا من المسار الحالي، ويأخذ `router-link-exact-active` و`aria-current="page"` ما دام هو المسار الحالي نفسه. وتغيّرها `activeClass` و`exactActiveClass` و`ariaCurrentValue`.
- النقرات مع مفتاح تعديل، أو بالزر الأوسط، أو على رابط فيه `target="_blank"`، يتركها الموجِّه للمتصفح.
- `to` دائمًا موقع داخل التطبيق. للمواقع الأخرى استخدم `<a href>` عاديًا ([VIBE7114](https://vibejs.org/v0/errors/VIBE7114)).
- لا يقبل `RouterView` محتوى slot ([VIBE7115](https://vibejs.org/v0/errors/VIBE7115)).

إذا احتاج الرابط إلى بنية مختلفة، ابنه بـ `useLink()`. تعيد هذه الدالة `href` و`isActive` و`isExactActive` و`route` بعد حلّه، و`navigate(event)` التي تطبّق قواعد النقر نفسها:

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

تعيد `useRoute()` المسار الحالي. وهو تفاعلي، فتتحدّث القوالب وقيم computed التي تقرؤه مع كل تنقّل. وتعيد `useRouter()` الموجِّه.

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

تعطي `useRoute('user')` المعاملات `params` أنواع المسار `user`. وترمي [VIBE7113](https://vibejs.org/v0/errors/VIBE7113) إذا لم يكن ذلك المسار جزءًا من المسار الحالي، لذلك لا تستدعها إلا في صفحة ذلك المسار وأبنائها. للمسار `path` و`fullPath` و`name` و`params` و`query` و`hash` و`matched` و`meta` و`redirectedFrom`.

إذا بقيت الصفحة نفسها على الشاشة مع معامل آخر، كالانتقال من `/users/1` إلى `/users/2`، تبقى نسخة المكوّن كما هي. لذلك اقرأ المعاملات بشكل تفاعلي، ولا تنسخها مرة واحدة في setup.

### المعاملات خصائصَ {#params-as-props}

إذا وضعت `props: true` على السجلّ، تستقبل الصفحة المعاملات خصائصَ (props). حدّد أنواعها بـ `RouteParams`:

```vibe
<script setup lang="ts">
import type { RouteParams } from '@usevibejs/ui/router';

const { id } = defineProps<RouteParams<'user'>>();
</script>

<template>
  <h1>User {{ id }}</h1>
</template>
```

ويقبل `props` أيضًا كائنًا من الخصائص الثابتة، أو دالة تحوّل المسار إلى خصائص.

## المسارات والمعاملات {#paths-and-params}

المسار قائمة من المقاطع يفصل بينها `/`. كل مقطع نص ثابت أو معامل واحد بالضبط ([VIBE7101](https://vibejs.org/v0/errors/VIBE7101)):

| المقطع     | ما يطابقه                      | نوع المعامل       |
| ---------- | ------------------------------ | ----------------- |
| `:id`      | مقطع واحد                      | `string`          |
| `:id(\d+)` | مقطع واحد يطابق التعبير النمطي | `string`          |
| `:id?`     | مقطع اختياري                   | `string`، اختياري |
| `:parts+`  | مقطع واحد أو أكثر              | `string[]`        |
| `:parts*`  | صفر مقطع أو أكثر               | `string[]`        |

لا تهتم المطابقة بحالة الأحرف، والشرطة المائلة في النهاية اختيارية، والمسار الأكثر تحديدًا هو الذي يفوز مهما كان ترتيب السجلّات. وعند التنقّل تقبل المعاملات الأرقام أيضًا. ويطابق `/:pathMatch(.*)*` كل مسار لا يطابقه أي مسار آخر.

## التنقّل {#navigating}

تقبل `router.push(to)` و`router.replace(to)` المواقع نفسها التي يقبلها `RouterLink`. وتُحسمان بعد انتهاء التنقّل: بـ `undefined` إذا نجح، أو بفشل تنقّل إذا ألغاه guard، أو حلّ محلّه تنقّل أحدث، أو كان الهدف هو المسار الحالي. ولا ترفضان إلا إذا رمى guard أو إعادة توجيه أو محمِّل كسول خطأً، وذلك بعد أن يصل الخطأ إلى `router.onError()`.

```ts
const failure = await router.push({ path: '/users', query: { page: '2' } });
if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  console.log('A guard kept the current page.');
}
```

تتحرّك `router.back()` و`router.forward()` و`router.go(delta)` في السجلّ. وتعيد `router.resolve(to)` المسار و`href` الخاص به دون تنقّل.

## Guards {#guards}

يستقبل الـ guard القيمتين `to` و`from`، ويقرّر بما يعيده:

- لا شيء أو `true`: تابِع؛
- `false`: ألغِ التنقّل وابقَ على المسار الحالي؛
- موقع: أعِد التوجيه إليه.

يمكن أن يكون الـ guard غير متزامن. ولا يأخذ أبدًا معاملًا ثالثًا ([VIBE7107](https://vibejs.org/v0/errors/VIBE7107)).

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn())
    return { path: '/login', query: { next: to.fullPath } };
});
```

تعمل guards التنقّل الواحد بهذا الترتيب، وكل واحد بعد انتهاء سابقه:

1. `onBeforeRouteLeave` في الصفحات التي تغادرها، بدءًا بالأعمق.
2. `router.beforeEach`.
3. `onBeforeRouteUpdate` في الصفحات الباقية.
4. `beforeEnter` في السجلّات الداخلة.
5. تحميل المكوّنات الكسولة في السجلّات الداخلة.
6. `router.beforeResolve`.

بعدها يتغيّر المسار، وتُعرض الواجهات، ويعمل `router.afterEach(to, from, failure?)`. تعمل guards وإعادات التوجيه والمحمِّلات والخطّافات داخل سياق الحقن الخاص بالتطبيق، فتستطيع استدعاء `inject()` للقيم التي يوفّرها التطبيق. والـ guard الذي يرمي خطأً يلغي التنقّل، ويصل الخطأ إلى `router.onError()`، أو إلى الطرفية إن لم يُسجَّل معالج.

تحمي الصفحة مسارها بـ `onBeforeRouteLeave` و`onBeforeRouteUpdate` في setup الخاص بها، وتُزالان عند فك الصفحة.

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

لا تعملان إلا في مكوّن يعرضه `RouterView`، وفي أبنائه ([VIBE7112](https://vibejs.org/v0/errors/VIBE7112)).

## الصفحات الكسولة {#lazy-pages}

إذا كان `component` دالة، يُحمَّل المكوّن عند أول تنقّل إلى مساره، قبل تغيّر المسار، ثم يُحفظ للتنقّلات اللاحقة: `() => import('./pages/UserPage.vibe')`. ويضع البناء كل صفحة كسولة في جزء (chunk) مستقل.

بعد نشر نسخة جديدة، قد يطلب تبويب مفتوح جزءًا لم يعد موجودًا. عندها يفشل التنقّل بالرمز [VIBE7109](https://vibejs.org/v0/errors/VIBE7109). حمّل الهدف صفحةً كاملة لتحصل على النسخة الجديدة:

```ts
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});
```

## سلوك التمرير {#scroll-behavior}

مع سجلّ الويب، يعيد الموجِّه موضع التمرير عند الرجوع والتقدّم، ويمرّر إلى العنصر المذكور في hash، ويبقي الموضع إذا تغيّر query وحده، ويمرّر إلى الأعلى في غير ذلك. ويحلّ `scrollBehavior` محلّ هذا كله: يعيد موضعًا، أو `{ el }` لعنصر، أو `false` ليترك التمرير كما هو، أو لا شيء للانتقال إلى الأعلى.

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

يمرَّر العنصر إلى مجال الرؤية مع مراعاة `scroll-margin-top` الخاص به، فيبقى مكان لترويسة ثابتة.

## الإعلان عن تغيّر المسار {#announcing-route-changes}

قارئ الشاشة لا ينتبه إلى أن الصفحة تغيّرت. أعلن عن الصفحة الجديدة في منطقة حيّة (live region) بعد كل تنقّل، وأعطِ كل صفحة `document.title`:

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

- [تحميل البيانات](https://vibejs.org/v0/ui/data): حمّل بيانات المسار الحالي بـ `useAsync`.
- [اختبار المكوّنات](https://vibejs.org/v0/ui/testing#testing-with-the-router): اختبر الصفحات مع سجلّ في الذاكرة.
