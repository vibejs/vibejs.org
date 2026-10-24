# اختبار المكوّنات

تعمل اختبارات المكوّنات في Vitest مع jsdom. يركّب `@usevibejs/ui/testing` المكوّن داخل تطبيق حقيقي، ويعيد غلافًا (wrapper) تستعلم به عن DOM المعروض وتتحكّم فيه، وينظّف كل شيء بعد كل اختبار.

## الإعداد {#setup}

تترجم الإضافة `vibe()` ملفات `.vibe` للاختبارات كما تترجمها للتطبيق:

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

هذا الإعداد موجود أصلًا في قالب التطبيق. وتضع الاختبار بجانب المكوّن: `Counter.test.ts` بجانب `Counter.vibe`.

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

تقبل `mount(component, options)`:

- `props`: الخصائص، ومنها المستمعون `on*`. إلزامية إذا كان للمكوّن خصائص إلزامية.
- `slots`: محتوى الـ slots بحسب الاسم، نصًا أو مكوّنًا أو دالة تأخذ خصائص الـ slot وتعيد نصًا أو عُقدًا.
- `provide`: القيم التي يوفّرها التطبيق، بحسب المفتاح، مثل `{ [API]: api }` لمفتاح من نوع `InjectionKey`.
- `plugins`: الإضافات التي يثبّتها التطبيق، بالترتيب، مثل الموجِّه.
- `attachTo`: المكان الذي يُلحق به العنصر المضيف، عنصرًا أو محدِّدًا، والافتراضي `document.body`.

أي خيار آخر يفشل بالرمز [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)، وتذكر الرسالة البديل.

المكوّن الذي تركّبه في جسم الاختبار أو في `beforeEach` يُفك عند انتهاء الاختبار. وإذا فشل الاختبار، ينتهي خطؤه بـ HTML المعروض لكل مكوّن مركَّب. أما المكوّن الذي تركّبه في `beforeAll` فيبقى إلى أن تستدعي `wrapper.unmount()`.

## البحث عن العناصر {#finding-elements}

تستعلم الأغلفة عن DOM المعروض بمحدِّدات CSS:

- تعيد `get(selector)` أول تطابق، أو تفشل بالرمز [VIBE7201](https://vibejs.org/v0/errors/VIBE7201) مع HTML المعروض.
- تعيد `find(selector)` أول تطابق، أو غلافًا قيمة `exists()` فيه `false`، واستخدام هذا الغلاف يفشل بالرمز [VIBE7202](https://vibejs.org/v0/errors/VIBE7202).
- تعيد `findAll(selector)` كل التطابقات بترتيب ظهورها في المستند.

يقرأ الغلاف عنصره بـ `text()` و`html()` و`attributes(name?)` و`classes(name?)` و`isVisible()` و`exists()`، و`element` هو عنصر DOM نفسه. اختر العناصر بما يراه المستخدم وبعلامات ثابتة: أسماء العناصر، والأدوار والتسميات في السمات، والأصناف، أو سمات `data-test`.

```ts
const wrapper = mount(TodoList);
expect(wrapper.findAll('li')).toHaveLength(3);
expect(wrapper.get('li.done').text()).toBe('Write the tests');
expect(wrapper.get('[aria-label="New todo"]').attributes('placeholder')).toBe('What next?');
expect(wrapper.find('.empty').exists()).toBe(false);
```

`wrapper.element` وكل عنصر تعيده `findAll()` عناصر DOM عادية، فتعمل عليها أي مكتبة لاختبار DOM.

## الأحداث والإدخال {#events-and-input}

يطلق `trigger(event, init?)` حدثًا من الصنف المناسب، ينتشر صعودًا (bubbling) ويقبل الإلغاء. ويضبط `setValue(value)` قيمة حقل إدخال أو textarea أو مربع اختيار أو زر راديو أو select، ثم يطلق الأحداث التي يستمع إليها `v-model`. وكلاهما ينتظر تحديث DOM.

```ts
const wrapper = mount(TodoList);
await wrapper.get('input').setValue('Ship it');
await wrapper.get('input').trigger('keydown', { key: 'Enter' });
expect(wrapper.findAll('li').at(-1)?.text()).toBe('Ship it');
```

المفتاح أو المعدِّل مكانه في init الحدث، لا في اسمه أبدًا: `trigger('keydown.enter')` يفشل بالرمز [VIBE7203](https://vibejs.org/v0/errors/VIBE7203). والعنصر المعطَّل لا يستقبل أي حدث.

## الخصائص والأحداث {#props-and-events}

يسند `setProps(props)` الخصائص وينتظر التحديث. وتعيد `emitted()` وسائط كل حدث أطلقه المكوّن، بحسب اسم الحدث، بأنواع مأخوذة من `defineEmits`.

```ts
const wrapper = mount(Picker, { props: { options: ['a', 'b'] } });
await wrapper.setProps({ options: ['a', 'b', 'c'] });
await wrapper.findAll('button')[2].trigger('click');
expect(wrapper.emitted('pick')).toEqual([['c']]);
```

## انتظار العمل غير المتزامن {#waiting-for-async-work}

تُحسم `flushPromises()` بعد أن تعمل دوال الـ promises المعلّقة، ومعها تحديثات DOM التي سبّبتها. انتظرها بعد أي شيء يحمّل بيانات. وتعمل أيضًا مع `vi.useFakeTimers()`.

```ts
const wrapper = mount(UserCard, { props: { id: 1 } });
await flushPromises();
expect(wrapper.get('h2').text()).toBe('Ada');
```

## الدوال المركّبة {#composables}

تشغّل `mountComposable(fn, options?)` الدالة `fn` على أنها setup مكوّن، فتستطيع استخدام `inject()` وخطّافات دورة الحياة والمراقِبات، ثم تعيد `result` الخاص بها. وتقبل `provide` و`plugins`، وتُفك كما يُفك `mount()`.

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

ثبّت موجِّهًا بسجلّ في الذاكرة عبر `plugins`، ثم انتظر التنقّل الأول بـ `router.isReady()`. استخدم مسارات التطبيق نفسها، مستوردة من `routes.ts`، حتى يغطي الاختبار السجلّات الحقيقية:

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

للبدء من مسار آخر، استدعِ `await router.push('/users/1')` بعد `router.isReady()`. ينتظر `await router.push()` الـ guards والصفحة الكسولة. وبعد تنقّل يحمّل بيانات، انتظر `flushPromises()` أيضًا.

## استبدال مكوّن ابن {#replacing-a-child-component}

تُعرض المكوّنات الأبناء كما تُعرض في التطبيق. لإبعاد ابن ثقيل عن الاختبار، استبدل وحدته بنسخة وهمية (mock) في Vitest:

```ts
import { vi } from 'vitest';

vi.mock('./Chart.vibe', () => import('./test/ChartStub.vibe'));
```

`ChartStub.vibe` مكوّن صغير له الخصائص نفسها، مثل `<div class="chart-stub" />`.

## التغطية {#coverage}

يعرض `vibejs check` تغطية كل ملف، ويحذّر بالرمز [VIBE8302](https://vibejs.org/v0/errors/VIBE8302) إذا كانت أقل من 100%. لتجعل التغطية الكاملة شرطًا، أزل التعليق عن سطر الحدّ في `vitest.config.ts`:

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
