# اختبار المكوّنات

تعمل اختبارات المكوّنات في Vitest مع jsdom. تركّب `@usevibejs/ui/testing` المكوّن في تطبيق حقيقي، وتعيد غلافًا (wrapper) للاستعلام عن DOM المعروض والتحكم فيه، وتنظّف بعد كل اختبار.

## الإعداد {#setup}

يترجم الملحق `vibe()` ملفات `.vibe` للاختبارات كما يفعل للتطبيق:

```ts
import { vibe } from '@usevibejs/compiler/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vibe()],
  test: {
    environment: 'jsdom',
    include: ['ui/src/**/*.test.ts'],
  },
});
```

قالب التطبيق يحتوي هذا الإعداد بالفعل. توضع الاختبارات بجانب المكوّن: `Counter.test.ts` بجانب `Counter.vibe`.

## التركيب {#mounting}

```ts
import { mount } from '@usevibejs/ui/testing';
import { expect, it } from 'vitest';
import Counter from './Counter.vibe';

it('counts clicks', async () => {
  const wrapper = mount(Counter, { props: { start: 1 } });
  await wrapper.get('button').trigger('click');
  expect(wrapper.get('button').text()).toBe('Count: 2');
});
```

تأخذ `mount(component, options)`:

- `props`: الخصائص، بما فيها مستمعات `on*`. وهي مطلوبة عندما يكون للمكوّن خصائص مطلوبة.
- `slots`: محتوى الفتحات بحسب الاسم، كنص أو مكوّن أو دالة من خصائص الفتحة تعيد نصًا أو عُقدًا.
- `provide`: القيم التي يوفّرها التطبيق بحسب المفتاح، مثل `{ [API]: api }` لـ `InjectionKey`.
- `plugins`: الملحقات التي يثبّتها التطبيق بالترتيب، مثل الموجِّه.
- `attachTo`: المكان الذي يُلحَق به عنصر المضيف، عنصر أو محدِّد؛ والافتراضي `document.body`.

الخيارات الأخرى تفشل بالرمز [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)، الذي يسمّي البديل.

المكوّن المركَّب في متن اختبار أو في `beforeEach` يُلغى تركيبه عند انتهاء الاختبار. وعندما يفشل اختبار، ينتهي خطؤه بشيفرة HTML المعروضة لكل مكوّن مركَّب. أما المكوّن المركَّب في `beforeAll` فيبقى إلى أن تستدعي `wrapper.unmount()`.

## البحث عن العناصر {#finding-elements}

تستعلم الأغلفة عن DOM المعروض بمحدِّدات CSS:

- تعيد `get(selector)` أول تطابق، أو تفشل بالرمز [VIBE7201](https://vibejs.org/v0/errors/VIBE7201) مع شيفرة HTML المعروضة.
- تعيد `find(selector)` أول تطابق، أو غلافًا تكون `exists()` فيه `false`؛ واستخدامه يفشل بالرمز [VIBE7202](https://vibejs.org/v0/errors/VIBE7202).
- تعيد `findAll(selector)` كل التطابقات بترتيب المستند.

يقرأ الغلاف عنصره بـ `text()` و`html()` و`attributes(name?)` و`classes(name?)` و`isVisible()` و`exists()`، و`element` هو عنصر DOM نفسه. اختر بحسب ما يراه المستخدم وبحسب نقاط ارتكاز ثابتة: أسماء العناصر والأدوار والتسميات كسمات، أو الأصناف، أو سمات `data-test`.

```ts
const wrapper = mount(TodoList);
expect(wrapper.findAll('li')).toHaveLength(3);
expect(wrapper.get('li.done').text()).toBe('Write the tests');
expect(wrapper.get('[aria-label="New todo"]').attributes('placeholder')).toBe('What next?');
expect(wrapper.find('.empty').exists()).toBe(false);
```

`wrapper.element` وكل عنصر من `findAll()` هما عناصر DOM عادية، ولذلك تعمل عليها أي مكتبة لاختبار DOM أيضًا.

## الأحداث والإدخال {#events-and-input}

تُطلق `trigger(event, init?)` حدثًا فقاعيًا (bubbling) قابلًا للإلغاء من الصنف الصحيح، وتضبط `setValue(value)` قيمة حقل إدخال أو textarea أو مربع اختيار أو زر راديو أو select، ثم تُطلق الأحداث التي يستمع إليها `v-model`. وكلتاهما تنتظر تحديث DOM.

```ts
const wrapper = mount(TodoList);
await wrapper.get('input').setValue('Ship it');
await wrapper.get('input').trigger('keydown', { key: 'Enter' });
expect(wrapper.findAll('li').at(-1)?.text()).toBe('Ship it');
```

يوضع المفتاح أو المُعدِّل في تهيئة الحدث (event init)، وليس في اسم الحدث أبدًا: `trigger('keydown.enter')` يفشل بالرمز [VIBE7203](https://vibejs.org/v0/errors/VIBE7203). والعنصر المعطَّل لا يستقبل أي حدث.

## الخصائص والأحداث {#props-and-events}

تسند `setProps(props)` الخصائص وتنتظر التحديث. وتعيد `emitted()` وسائط كل حدث أطلقه المكوّن، بحسب اسم الحدث، مُنمَّطة بواسطة `defineEmits`.

```ts
const wrapper = mount(Picker, { props: { options: ['a', 'b'] } });
await wrapper.setProps({ options: ['a', 'b', 'c'] });
await wrapper.findAll('button')[2].trigger('click');
expect(wrapper.emitted('pick')).toEqual([['c']]);
```

## انتظار العمل غير المتزامن {#waiting-for-async-work}

تُحَلّ `flushPromises()` بعد تشغيل دوال الاستدعاء المعلّقة للوعود (promises)، ومعها تحديثات DOM التي سبّبتها. انتظرها بعد أي شيء يحمّل بيانات. وهي تعمل أيضًا مع `vi.useFakeTimers()`.

```ts
const wrapper = mount(UserCard, { props: { id: 1 } });
await flushPromises();
expect(wrapper.get('h2').text()).toBe('Ada');
```

## الـ Composables {#composables}

تشغّل `mountComposable(fn, options?)` الدالة `fn` بوصفها setup لمكوّن، فيمكنها استخدام `inject()` وخطافات دورة الحياة والمراقبات (watchers)، وتعيد `result` الخاص بها. وهي تأخذ `provide` و`plugins` وتُلغي التركيب كما تفعل `mount()`.

```ts
import { nextTick, ref, watch } from '@usevibejs/ui';
import { mountComposable } from '@usevibejs/ui/testing';
import { expect } from 'vitest';

function useHistory<T>(initial: T) {
  const value = ref(initial);
  const past: T[] = [];
  watch(value, (_, old) => past.push(old));
  return { value, past };
}

const { result } = mountComposable(() => useHistory(1));
result.value.value = 2;
await nextTick();
expect(result.past).toEqual([1]);
```

## الاختبار مع الموجِّه {#testing-with-the-router}

ثبّت موجِّهًا بسجل في الذاكرة عبر `plugins`، ثم انتظر أول عملية تنقّل بـ `router.isReady()`. استخدم مسارات التطبيق نفسه، المستوردة من `routes.ts`، ليغطي الاختبار السجلات الحقيقية:

```ts
import { createMemoryHistory, createRouter } from '@usevibejs/ui/router';
import { flushPromises, mount } from '@usevibejs/ui/testing';
import { expect, it } from 'vitest';
import App from '../App.vibe';

it('opens a user from the list', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes });
  const wrapper = mount(App, { plugins: [router] });
  await router.isReady();

  await wrapper.get('a[href="/users/1"]').trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.fullPath).toBe('/users/1');
  expect(wrapper.get('h1').text()).toBe('User 1');
});
```

للبدء من مسار آخر، استخدم `await router.push('/users/1')` بعد `router.isReady()`. ينتظر `await router.push()` الحراس والصفحة الكسولة؛ وبعد تنقّل يحمّل بيانات، انتظر `flushPromises()` أيضًا.

## استبدال مكوّن ابن {#replacing-a-child-component}

تُعرض المكوّنات الأبناء كما تُعرض في التطبيق. ولإبقاء ابن ثقيل خارج اختبار ما، حاكِ وحدته باستخدام Vitest:

```ts
import { vi } from 'vitest';

vi.mock('./Chart.vibe', () => import('./test/ChartStub.vibe'));
```

`ChartStub.vibe` مكوّن صغير بالخصائص نفسها، مثل `<div class="chart-stub" />`.

## التغطية {#coverage}

يعرض `vibejs check` تغطية كل ملف ويحذّر بالرمز [VIBE8302](https://vibejs.org/v0/errors/VIBE8302) عند ما دون 100%. ولجعل التغطية الكاملة شرطًا، أزل التعليق عن سطر العتبة في `vitest.config.ts`:

```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: { 100: true, perFile: true },
    },
  },
});
```
