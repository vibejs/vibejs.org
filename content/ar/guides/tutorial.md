# الدرس التطبيقي

في هذا الدرس تضيف API باسم `users` إلى تطبيق جديد، وتكتب صفحة تعرض قائمة المستخدمين، وتترك `vibejs check` يكشف خطأ أنواع في قالب، ثم تبني التطبيق وتشغّله. يستغرق الأمر نحو عشر دقائق. تحتاج إلى Node.js `^24.15.0 || >=26` وإلى pnpm.

مجموعة اختبارات vibe.js تشغّل كل أمر وكل ملف في هذه الصفحة، بالترتيب نفسه، مع كل تغيير. لذلك تعمل الخطوات كما هي مكتوبة.

## 1. أنشئ التطبيق {#1-create-the-app}

```sh
pnpm create vibejs my-app
cd my-app
```

للتطبيق ثلاثة أجزاء: `contracts/` لعقود الـ API، و`server/` للخادم، و`ui/` للواجهة. تجد بنية المشروع وإعداد المحرر في [البدء](https://vibejs.org/v0/guides/getting-started).

## 2. افحصه {#2-check-it}

```sh
pnpm vibejs check
```

يتحقق `vibejs check` من الأنواع في TypeScript وفي قوالب `.vibe`، ثم يشغّل الـ linter، ويفحص التنسيق، ويشغّل الاختبارات مع قياس التغطية. التطبيق الجديد ينجح في الفحص، وتغطية كل ملف فيه كاملة.

## 3. ولّد موردًا وصفحة ومكوّنًا {#3-generate-a-resource-a-page-and-a-component}

```sh
pnpm vibejs g resource users
pnpm vibejs g page Users
pnpm vibejs g component UserCard
pnpm vibejs check
```

كل مولّد يكتب ملفاته مع اختباراتها، ويسجّلها في أماكنها:

- `g resource users` يكتب العقد `contracts/src/users.contract.ts`، وفيه مسارات لعرض المستخدمين وجلب مستخدم وإنشائه وتعديله وحذفه. ويكتب وحدة خادم فيها متحكم (controller) وخدمة تحفظ البيانات في الذاكرة واختبار. ثم يضيف الوحدة إلى `server/src/app.module.ts`، والعقد إلى عميل الـ API في الواجهة داخل `ui/src/api.ts`.
- `g page Users` يكتب `ui/src/pages/UsersPage.vibe` مع اختبار، ويضيف المسار `/users` إلى `ui/src/routes.ts`.
- `g component UserCard` يكتب `ui/src/components/UserCard.vibe`، وهو مكوّن له خاصية `title`، ويكتب اختباره.

يعرّف العقد كل مسار مرة واحدة، مع معاملاته وجسم طلبه واستجابته وأخطائه، ومنه يأخذ الطرفان أنواعهما. وهذا عقد مثال تطبيق المهام (todo)، وهو بالشكل نفسه:

```ts
import { defineContract, del, get, patch, post } from '@usevibejs/contract';
import * as v from 'valibot';

export const Todo = v.object({ id: v.string(), title: v.string(), done: v.boolean() });

export const todos = defineContract('/todos', {
  list: get('/', { response: v.array(Todo) }),
  get: get('/:id', { response: Todo, errors: { TODO_NOT_FOUND: 404 } }),
  create: post('/', {
    body: v.object({ title: v.pipe(v.string(), v.trim(), v.minLength(1)) }),
    response: Todo,
  }),
  toggle: patch('/:id', { response: Todo, errors: { TODO_NOT_FOUND: 404 } }),
  remove: del('/:id', { errors: { TODO_NOT_FOUND: 404 } }),
});
```

يعالج الخادم كل مسار في العقد بمعالج ذي أنواع ([المتحكمات والمعالجات](https://vibejs.org/v0/server/handlers))، وتستدعيه الواجهة عبر عميل ذي أنواع دون توليد كود ([العقود](https://vibejs.org/v0/server/contracts)). المولّدات لا تكتب فوق تعديلاتك أبدًا: إن شغّلت أحدها مرة أخرى تخطّى الملفات الموجودة.

## 4. اعرض المستخدمين {#4-list-the-users}

اجعل الصفحة تجلب المستخدمين من الـ API وتعرض `UserCard` مرقّمًا لكل مستخدم. ابدأ باختبار الصفحة: يركّب الاختبار التطبيق على `/users`، ويعطيه عميل API تردّ دالة `fetch` فيه بمستخدم واحد.

```ts [ui/src/pages/UsersPage.test.ts]
import { createMemoryHistory, createRouter } from '@usevibejs/ui/router';
import { flushPromises, mount } from '@usevibejs/ui/testing';
import { expect, it } from 'vitest';
import App from '../App.vibe';
import { API, createApi } from '../api.ts';
import { routes } from '../routes.ts';

it('lists the users from the API at /users', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes });
  const api = createApi(async () => Response.json([{ id: '1', name: 'Ada' }]));
  const wrapper = mount(App, { plugins: [router], provide: { [API]: api } });
  await router.push('/users');
  await flushPromises();
  expect(wrapper.get('h1').text()).toBe('Users');
  expect(wrapper.findAll('.user-card').map((card) => card.text())).toEqual(['1. Ada']);
});
```

ثم الصفحة. تجلب `useAsync` القائمة عند تركيب الصفحة، ونتيجة العميل إما `{ ok: true, data }` وإما `{ ok: false, error }` ([جلب البيانات](https://vibejs.org/v0/ui/data)). في هذه النسخة الأولى خطأ:

```vibe [ui/src/pages/UsersPage.vibe]
<script setup lang="ts">
import { computed, inject, useAsync } from '@usevibejs/ui';
import { API } from '../api.ts';
import UserCard from '../components/UserCard.vibe';

const api = inject(API)!;
// Loads the users on mount; a failed request shows an empty list.
const { data } = useAsync((signal) => api.users.list(undefined, { signal }));
const users = computed(() => (data.value?.ok ? data.value.data : []));
</script>

<template>
  <h1>Users</h1>
  <UserCard v-for="(user, index) in users" :key="user.id" :title="index + 1" />
</template>
```

## 5. دع الفحص يجد الخطأ {#5-let-check-find-the-mistake}

```sh exit=1
pnpm vibejs check
```

يفشل الفحص. القوالب تخضع للتحقق من الأنواع مثل TypeScript تمامًا، فيظهر خطأ الأنواع عند سطره وعموده في ملف `.vibe`. ويفشل اختبار الصفحة أيضًا، لأن البطاقة تعرض `1`:

```txt
ui/src/pages/UsersPage.vibe:14:60  error  TS2322  Type 'number' is not assignable to type 'string'.
ui/src/pages/UsersPage.test.ts:8:1  error  test-failed  AssertionError: expected [ '1' ] to deeply equal [ '1. Ada' ]
```

الخاصية `title` من النوع `string`، أما `index + 1` فرقم. ويعرض محررك الخطأ نفسه أثناء الكتابة. مرّر نصًا:

```vibe [ui/src/pages/UsersPage.vibe]
<script setup lang="ts">
import { computed, inject, useAsync } from '@usevibejs/ui';
import { API } from '../api.ts';
import UserCard from '../components/UserCard.vibe';

const api = inject(API)!;
// Loads the users on mount; a failed request shows an empty list.
const { data } = useAsync((signal) => api.users.list(undefined, { signal }));
const users = computed(() => (data.value?.ok ? data.value.data : []));
</script>

<template>
  <h1>Users</h1>
  <UserCard v-for="(user, index) in users" :key="user.id" :title="`${index + 1}. ${user.name}`" />
</template>
```

```sh
pnpm vibejs check
```

ينجح الفحص من جديد، بما في ذلك الاختبارات والتغطية الكاملة.

## 6. ابنِ التطبيق وشغّله {#6-build-and-serve}

```sh
pnpm vibejs build
pnpm start
```

يكتب `vibejs build` الواجهة في `ui/dist` والخادم في `server/dist/main.js`. ويشغّل `pnpm start` الخادم المبني على المنفذ 3000، أو على المنفذ المحدد في `PORT`. يردّ `/api/health` بـ `{"status":"ok"}`، ويردّ `/api/users` بقائمة المستخدمين، وهي فارغة حتى الآن. أوقفه بـ Ctrl+C. تنشر الناتجين كلًّا على حدة: الواجهة ملفات ثابتة، والخادم عملية Node.js ([النشر](https://vibejs.org/v0/server/#deploying)).

## 7. طوّر {#7-develop}

```sh
pnpm dev
```

يخدم `pnpm dev` الواجهة والـ API على منفذ واحد ويطبع عنوانه، فافتح عليه `/users`. اتركه يعمل أثناء عملك:

- عدّل `ui/src/components/UserCard.vibe`، كأن تغيّر بنيته (markup): تتحدّث الصفحة في مكانها وتحتفظ بحالتها.
- عدّل ملفًا داخل `server/`، كملف الخدمة مثلًا: يعيد الخادم تشغيل نفسه في أقل بكثير من ثانية، ويصل الطلب التالي إلى الكود الجديد.
- أخطاء البناء والمتصفح والخادم تُكتب في `.vibejs/dev.log`، ويعرضها `pnpm vibejs errors`.

إن شغّلت `pnpm dev` مرة ثانية في التطبيق نفسه، أخبرك بالخادم الذي يعمل بدل أن يشغّل خادمًا آخر.

## الخطوة التالية {#next}

- [التوجيه](https://vibejs.org/v0/ui/routing) و[اختبار المكوّنات](https://vibejs.org/v0/ui/testing) للواجهة.
- [الخادم](https://vibejs.org/v0/server/) و[الوحدات والمزوّدات](https://vibejs.org/v0/server/modules) للخادم.
- [سطر الأوامر ووكلاء الذكاء الاصطناعي](https://vibejs.org/v0/guides/ai-agents) ليعمل وكيل برمجة على التطبيق بالأوامر نفسها.
