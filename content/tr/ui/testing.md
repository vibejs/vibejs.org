# Bileşen testleri

Bileşen testleri Vitest içinde jsdom ile çalışır. `@usevibejs/ui/testing`, bir bileşeni gerçek bir uygulamada mount eder, render edilen DOM'u sorgulamak ve yönlendirmek için bir wrapper döndürür ve her testten sonra temizlik yapar.

## Kurulum {#setup}

`vibe()` plugin'i, `.vibe` dosyalarını testler için uygulamadakiyle aynı şekilde derler:

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

Uygulama template'inde bu yapılandırma zaten vardır. Testler bileşenin yanında durur: `Counter.vibe` dosyasının yanında `Counter.test.ts`.

## Mount etmek {#mounting}

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

`mount(component, options)` şunları alır:

- `props`: `on*` dinleyicileri dahil props'lar. Bileşenin zorunlu props'ları varsa gereklidir.
- `slots`: ada göre slot içeriği; metin, bir bileşen ya da slot props'larını alıp metin veya düğüm döndüren bir fonksiyon olarak.
- `provide`: uygulamanın anahtara göre sağladığı değerler; bir `InjectionKey` için `{ [API]: api }` gibi.
- `plugins`: uygulamanın sırayla kurduğu plugin'ler; router gibi.
- `attachTo`: host elemanın ekleneceği yer, bir eleman ya da bir seçici; varsayılan olarak `document.body`.

Diğer seçenekler, yerine geçecek olanı adlandıran [VIBE7206](https://vibejs.org/v0/errors/VIBE7206) ile başarısız olur.

Bir test gövdesinde ya da `beforeEach` içinde mount edilen bileşen, test bittiğinde unmount edilir. Bir test başarısız olduğunda hatası, mount edilmiş her bileşenin render edilmiş HTML'iyle biter. `beforeAll` içinde mount edilen bileşen, `wrapper.unmount()` çağırana kadar kalır.

## Eleman bulmak {#finding-elements}

Wrapper'lar render edilen DOM'u CSS seçicileriyle sorgular:

- `get(selector)` ilk eşleşmeyi döndürür; yoksa [VIBE7201](https://vibejs.org/v0/errors/VIBE7201) ve render edilmiş HTML ile başarısız olur.
- `find(selector)` ilk eşleşmeyi, yoksa `exists()` değeri `false` olan bir wrapper döndürür; onu kullanmak [VIBE7202](https://vibejs.org/v0/errors/VIBE7202) ile başarısız olur.
- `findAll(selector)` her eşleşmeyi doküman sırasıyla döndürür.

Bir wrapper elemanını `text()`, `html()`, `attributes(name?)`, `classes(name?)`, `isVisible()` ve `exists()` ile okur; `element` ise DOM elemanının kendisidir. Kullanıcının gördüğü şeye ve kararlı kancalara göre seçin: eleman adları, öznitelik olarak roller ve etiketler, sınıflar ya da `data-test` öznitelikleri.

```ts
const wrapper = mount(TodoList);
expect(wrapper.findAll('li')).toHaveLength(3);
expect(wrapper.get('li.done').text()).toBe('Write the tests');
expect(wrapper.get('[aria-label="New todo"]').attributes('placeholder')).toBe('What next?');
expect(wrapper.find('.empty').exists()).toBe(false);
```

`wrapper.element` ve `findAll()` sonucundaki her eleman düz DOM elemanlarıdır; bu yüzden herhangi bir DOM test kütüphanesi bunlarla da çalışır.

## Olaylar ve girdi {#events-and-input}

`trigger(event, init?)`, doğru sınıftan, kabarcıklanan (bubbling) ve iptal edilebilir bir olay gönderir; `setValue(value)` ise bir input, textarea, checkbox, radio düğmesi ya da select değerini ayarlar, ardından `v-model` tarafından dinlenen olayları tetikler. İkisi de DOM güncellemesini bekler.

```ts
const wrapper = mount(TodoList);
await wrapper.get('input').setValue('Ship it');
await wrapper.get('input').trigger('keydown', { key: 'Enter' });
expect(wrapper.findAll('li').at(-1)?.text()).toBe('Ship it');
```

Bir tuş ya da değiştirici olay adına değil, olay init nesnesine yazılır: `trigger('keydown.enter')` [VIBE7203](https://vibejs.org/v0/errors/VIBE7203) ile başarısız olur. Devre dışı bir eleman hiçbir olay almaz.

## Props ve olaylar {#props-and-events}

`setProps(props)` props'ları atar ve güncellemeyi bekler. `emitted()`, bileşenin yayınladığı her olayın argümanlarını olay adına göre, `defineEmits` ile tiplenmiş olarak döndürür.

```ts
const wrapper = mount(Picker, { props: { options: ['a', 'b'] } });
await wrapper.setProps({ options: ['a', 'b', 'c'] });
await wrapper.findAll('button')[2].trigger('click');
expect(wrapper.emitted('pick')).toEqual([['c']]);
```

## Asenkron işi beklemek {#waiting-for-async-work}

`flushPromises()`, bekleyen promise callback'leri ve bunların neden olduğu DOM güncellemeleri çalıştıktan sonra çözülür. Veri yükleyen her şeyden sonra onu await edin. `vi.useFakeTimers()` ile de çalışır.

```ts
const wrapper = mount(UserCard, { props: { id: 1 } });
await flushPromises();
expect(wrapper.get('h2').text()).toBe('Ada');
```

## Composable'lar {#composables}

`mountComposable(fn, options?)`, `fn` fonksiyonunu bir bileşenin setup'ı olarak çalıştırır; böylece `inject()`, lifecycle hook'ları ve watcher'ları kullanabilir ve `result` değerini döndürür. `provide` ve `plugins` alır ve `mount()` gibi unmount edilir.

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

## Router ile test etmek {#testing-with-the-router}

`plugins` üzerinden memory history'li bir router kurun, ardından ilk navigasyonu `router.isReady()` ile bekleyin. Testin gerçek kayıtları kapsaması için uygulamanın kendi route'larını, `routes.ts` dosyasından içe aktararak kullanın:

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

Başka bir route'ta başlamak için `router.isReady()` sonrasında `await router.push('/users/1')` yapın. `await router.push()` guard'ları ve lazy sayfayı bekler; veri yükleyen bir navigasyondan sonra ayrıca `flushPromises()` de await edin.

## Alt bileşeni değiştirmek {#replacing-a-child-component}

Alt bileşenler uygulamadaki gibi render edilir. Ağır bir alt bileşeni testin dışında tutmak için modülünü Vitest ile mock'layın:

```ts
import { vi } from 'vitest';

vi.mock('./Chart.vibe', () => import('./test/ChartStub.vibe'));
```

`ChartStub.vibe`, aynı props'lara sahip küçük bir bileşendir; örneğin `<div class="chart-stub" />`.

## Coverage {#coverage}

`vibejs check` her dosyanın coverage değerini raporlar ve %100'ün altında [VIBE8302](https://vibejs.org/v0/errors/VIBE8302) uyarısı verir. Tam coverage'ı zorunlu kılmak için `vitest.config.ts` içindeki eşik satırının yorumunu kaldırın:

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
