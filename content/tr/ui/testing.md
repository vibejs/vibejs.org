# Bileşenleri test etmek

Bileşen testleri Vitest içinde jsdom ile çalışır. `@usevibejs/ui/testing` bir bileşeni gerçek bir uygulamanın içinde mount eder. Sana çizilen DOM'u sorgulamak ve yönetmek için bir wrapper döner, her testten sonra da ortalığı temizler.

## Kurulum {#setup}

`vibe()` plugin'i `.vibe` dosyalarını testler için de uygulamada olduğu gibi derler:

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

Uygulama şablonunda bu config zaten var. Testler bileşenin yanında durur: `Counter.vibe` dosyasının yanında `Counter.test.ts`.

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

- `props`: `on*` listener'ları dahil prop'lar. Bileşenin zorunlu prop'ları varsa bunu vermen gerekir.
- `slots`: isme göre slot içerikleri. Metin, bir bileşen ya da slot prop'larını alıp metin veya düğüm dönen bir fonksiyon olabilir.
- `provide`: uygulamanın anahtara göre provide ettiği değerler. Örneğin bir `InjectionKey` için `{ [API]: api }`.
- `plugins`: uygulamanın sırayla kurduğu plugin'ler, örneğin router.
- `attachTo`: host elemanın ekleneceği yer, bir eleman ya da bir seçici. Varsayılanı `document.body`.

Başka bir seçenek verirsen [VIBE7206](https://vibejs.org/v0/errors/VIBE7206) hatası alırsın. Hata mesajı onun yerine ne kullanacağını da söyler.

Test gövdesinde ya da bir `beforeEach` içinde mount ettiğin bileşen, test bitince unmount olur. Bir test başarısız olursa hata mesajının sonunda mount edilmiş her bileşenin çizilen HTML'i yer alır. `beforeAll` içinde mount ettiğin bileşen ise sen `wrapper.unmount()` çağırana kadar kalır.

## Eleman bulmak {#finding-elements}

Wrapper'lar çizilen DOM'u CSS seçicileriyle sorgular:

- `get(selector)` ilk eşleşmeyi döner. Bulamazsa [VIBE7201](https://vibejs.org/v0/errors/VIBE7201) ile ve çizilen HTML'i göstererek başarısız olur.
- `find(selector)` ilk eşleşmeyi ya da `exists()` değeri `false` olan bir wrapper döner. O wrapper'ı kullanırsan [VIBE7202](https://vibejs.org/v0/errors/VIBE7202) hatası alırsın.
- `findAll(selector)` bütün eşleşmeleri belgedeki sırasıyla döner.

Wrapper, elemanını `text()`, `html()`, `attributes(name?)`, `classes(name?)`, `isVisible()` ve `exists()` ile okur. `element` ise DOM elemanının kendisidir. Elemanları kullanıcının gördüğü şeye ve sabit tutamaklara göre seç: eleman isimleri, attribute olarak verilmiş rol ve etiketler, class'lar ya da `data-test` attribute'ları.

```ts
const wrapper = mount(TodoList);
expect(wrapper.findAll('li')).toHaveLength(3);
expect(wrapper.get('li.done').text()).toBe('Write the tests');
expect(wrapper.get('[aria-label="New todo"]').attributes('placeholder')).toBe('What next?');
expect(wrapper.find('.empty').exists()).toBe(false);
```

`wrapper.element` ve `findAll()` sonucundaki her eleman düz birer DOM elemanıdır. Yani herhangi bir DOM test kütüphanesini de bunlar üzerinde kullanabilirsin.

## Event'ler ve girdi {#events-and-input}

`trigger(event, init?)` doğru sınıfta, yukarı kabaran (bubbling) ve iptal edilebilen bir event gönderir. `setValue(value)` ise bir input'a, textarea'ya, checkbox'a, radio button'a ya da select'e değer verir, sonra `v-model` için dinlenen event'leri tetikler. İkisi de DOM güncellemesini bekler.

```ts
const wrapper = mount(TodoList);
await wrapper.get('input').setValue('Ship it');
await wrapper.get('input').trigger('keydown', { key: 'Enter' });
expect(wrapper.findAll('li').at(-1)?.text()).toBe('Ship it');
```

Tuş ya da modifier event ismine değil, event init'ine yazılır. `trigger('keydown.enter')` yazarsan [VIBE7203](https://vibejs.org/v0/errors/VIBE7203) hatası alırsın. Disabled bir eleman event almaz.

## Prop'lar ve event'ler {#props-and-events}

`setProps(props)` prop'lara değer atar ve güncellemeyi bekler. `emitted()` bileşenin yaydığı her event'in argümanlarını event ismine göre döner. Tipleri `defineEmits` tanımından gelir.

```ts
const wrapper = mount(Picker, { props: { options: ['a', 'b'] } });
await wrapper.setProps({ options: ['a', 'b', 'c'] });
await wrapper.findAll('button')[2].trigger('click');
expect(wrapper.emitted('pick')).toEqual([['c']]);
```

## Async işleri beklemek {#waiting-for-async-work}

`flushPromises()`, bekleyen promise callback'leri ve onların tetiklediği DOM güncellemeleri bitince resolve olur. Veri yükleyen her şeyden sonra bunu await et. `vi.useFakeTimers()` ile de çalışır.

```ts
const wrapper = mount(UserCard, { props: { id: 1 } });
await flushPromises();
expect(wrapper.get('h2').text()).toBe('Ada');
```

## Composable'lar {#composables}

`mountComposable(fn, options?)`, `fn` fonksiyonunu bir bileşenin setup'ı olarak çalıştırır ve `result` değerini döner. Böylece `fn` içinde `inject()`, yaşam döngüsü hook'ları ve watcher'lar kullanabilirsin. `provide` ve `plugins` alır, `mount()` gibi unmount olur.

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

## Router ile test {#testing-with-the-router}

`plugins` üzerinden memory history kullanan bir router kur, sonra `router.isReady()` ile ilk navigasyonu bekle. Testin gerçek kayıtları kapsaması için uygulamanın kendi rotalarını `routes.ts` dosyasından import et:

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

Başka bir rotada başlamak için `router.isReady()` sonrasında `await router.push('/users/1')` yaz. `await router.push()` guard'ları ve lazy sayfayı bekler. Veri yükleyen bir navigasyondan sonra `flushPromises()` de await et.

## Çocuk bileşeni değiştirmek {#replacing-a-child-component}

Çocuk bileşenler testte de uygulamadaki gibi çizilir. Ağır bir çocuk bileşeni testin dışında tutmak istiyorsan, modülünü Vitest ile mock'la:

```ts
import { vi } from 'vitest';

vi.mock('./Chart.vibe', () => import('./test/ChartStub.vibe'));
```

`ChartStub.vibe`, aynı prop'ları alan küçük bir bileşendir. Örneğin `<div class="chart-stub" />`.

## Coverage {#coverage}

`vibejs check` her dosyanın coverage oranını raporlar ve %100'ün altında [VIBE8302](https://vibejs.org/v0/errors/VIBE8302) uyarısı verir. Tam coverage'ı zorunlu yapmak istiyorsan `vitest.config.ts` içindeki eşik satırının yorumunu kaldır:

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
