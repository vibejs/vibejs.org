# الدليل التعليمي

في هذا الدليل تضيف واجهة `users` البرمجية (API) إلى تطبيق جديد، وتكتب صفحة تعرض المستخدمين، وتدع `vibejs check` يكتشف خطأ في الأنواع داخل قالب، ثم تبني التطبيق وتقدّمه. يستغرق نحو عشر دقائق. تحتاج إلى Node.js بالإصدار `^24.15.0 || >=26` وإلى pnpm.

كل أمر وملف في هذه الصفحة تشغّله مجموعة اختبارات vibe.js بهذا الترتيب عند كل تغيير، لذا تعمل الخطوات كما هي مكتوبة.

## 1. إنشاء التطبيق {#1-create-the-app}

```sh
pnpm create vibejs my-app
cd my-app
```

للتطبيق ثلاثة أجزاء: `contracts/` لعقود الـ API، و`server/` للخادم، و`ui/` للواجهة. راجع [البدء](https://vibejs.org/v0/guides/getting-started) لمعرفة البنية وإعداد المحرر.

## 2. فحصه {#2-check-it}

```sh
pnpm vibejs check
```

يشغّل `vibejs check` مدقّق الأنواع على TypeScript وقوالب `.vibe`، والمدقّق (linter)، وفحص التنسيق، والاختبارات مع التغطية. ينجح التطبيق الجديد مع تغطية كاملة لكل ملف.

## 3. توليد مورد وصفحة ومكوّن {#3-generate-a-resource-a-page-and-a-component}

```sh
pnpm vibejs g resource users
pnpm vibejs g page Users
pnpm vibejs g component UserCard
pnpm vibejs check
```

يكتب كل مولّد ملفاته مع اختباراتها، ويسجّلها حيث يجب:

- يكتب `g resource users` العقد `contracts/src/users.contract.ts` بمسارات لعرض المستخدمين وجلبهم وإنشائهم وتحديثهم وحذفهم، ووحدة خادم فيها متحكم وخدمة في الذاكرة واختبار. ويضيف الوحدة إلى `server/src/app.module.ts` والعقد إلى عميل الـ API في الواجهة داخل `ui/src/api.ts`.
- يكتب `g page Users` الملف `ui/src/pages/UsersPage.vibe` مع اختبار، ويضيف المسار `/users` إلى `ui/src/routes.ts`.
- يكتب `g component UserCard` الملف `ui/src/components/UserCard.vibe`، وهو مكوّن له prop باسم `title`، مع اختباره.

يعلن العقد عن كل مسار مرة واحدة، مع معاملاته وجسمه واستجابته وأخطائه، ويُنمَّط الطرفان منه. يبدو عقد تطبيق المهام التجريبي (todo) على النحو نفسه:

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

يعالج الخادم كل مسار في العقد بمعالج (handler) مُنمَّط ([المتحكمات والمعالجات](https://vibejs.org/v0/server/handlers))، وتستدعيه الواجهة عبر عميل مُنمَّط دون توليد شيفرة ([العقود](https://vibejs.org/v0/server/contracts)). لا تكتب المولّدات فوق تعديلاتك أبدًا: شغّل أحدها مرة أخرى وسيتخطى الملفات الموجودة.

## 4. عرض المستخدمين {#4-list-the-users}

اجعل الصفحة تحمّل المستخدمين من الـ API وتعرض `UserCard` واحدًا لكل مستخدم، مرقّمًا. أولًا، اختبار الصفحة: يركّب التطبيق على `/users` مع عميل API تجيب `fetch` الخاصة به بمستخدم واحد.

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

ثم الصفحة. تحمّل `useAsync` القائمة عند تركيب الصفحة، ونتيجة العميل إما `{ ok: true, data }` أو `{ ok: false, error }` ([تحميل البيانات](https://vibejs.org/v0/ui/data)). في هذه النسخة الأولى خطأ:

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

## 5. دع check يجد الخطأ {#5-let-check-find-the-mistake}

```sh exit=1
pnpm vibejs check
```

يفشل الفحص. تُفحَص أنواع القوالب كما تُفحَص أنواع TypeScript، فيُبلَّغ عن خطأ النوع عند سطره وعموده في ملف `.vibe`. ويفشل اختبار الصفحة أيضًا لأن البطاقة تعرض `1`:

```txt
ui/src/pages/UsersPage.vibe:14:60  error  TS2322  Type 'number' is not assignable to type 'string'.
ui/src/pages/UsersPage.test.ts:8:1  error  test-failed  AssertionError: expected [ '1' ] to deeply equal [ '1. Ada' ]
```

الـ prop المسمّى `title` من النوع `string` أما `index + 1` فرقم. يعرض محررك الخطأ نفسه أثناء الكتابة. مرّر نصًا:

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

## 6. البناء والتقديم {#6-build-and-serve}

```sh
pnpm vibejs build
pnpm start
```

يكتب `vibejs build` الواجهة في `ui/dist` والخادم في `server/dist/main.js`. يشغّل `pnpm start` الخادم المبني على المنفذ 3000، أو على المنفذ المحدد في `PORT`: يجيب `/api/health` بـ `{"status":"ok"}` ويجيب `/api/users` بقائمة المستخدمين، وهي فارغة الآن. أوقفه بـ Ctrl+C. يُنشَر الناتجان بشكل منفصل: الواجهة كملفات ثابتة، والخادم كعملية Node.js ([النشر](https://vibejs.org/v0/server/#deploying)).

## 7. التطوير {#7-develop}

```sh
pnpm dev
```

يخدم `pnpm dev` الواجهة والـ API على منفذ واحد ويطبع عنوانه؛ افتح `/users` عليه. أبقِه يعمل أثناء عملك:

- عدّل `ui/src/components/UserCard.vibe`، مثلًا ترميزه: تتحدّث الصفحة في مكانها وتحتفظ بحالتها.
- عدّل ملفًا تحت `server/`، مثلًا الخدمة: يعاد تشغيل الخادم في أقل بكثير من ثانية، ويصل الطلب التالي إلى الشيفرة الجديدة.
- تذهب أخطاء البناء والمتصفح والخادم إلى `.vibejs/dev.log`؛ ويسردها `pnpm vibejs errors`.

يُبلغ أمر `pnpm dev` ثانٍ في التطبيق نفسه عن الخادم العامل بدلًا من تشغيل خادم آخر.

## التالي {#next}

- [التوجيه](https://vibejs.org/v0/ui/routing) و[اختبار المكوّنات](https://vibejs.org/v0/ui/testing) للواجهة.
- [الخادم](https://vibejs.org/v0/server/) و[الوحدات والمزوّدات](https://vibejs.org/v0/server/modules) للخادم.
- [سطر الأوامر ووكلاء الذكاء الاصطناعي](https://vibejs.org/v0/guides/ai-agents) لتدع وكيل برمجة يعمل على التطبيق بالأوامر نفسها.
