# vue-router ve Vue Test Utils'ten geliyorsan

`createRouter`, `RouterView`, `RouterLink`, `useRoute`, iç içe rotalar, konum döndüren guard'lar, `mount` ve wrapper'lar beklediğin gibi çalışır. Farklar dört tercihten geliyor:

- **Tek dosyadan tipli rotalar.** Rotaları bir kez `defineRoutes()` ile tanımlar, `Register` ile kaydedersin. Böylece adlar, parametreler ve her `to` şablonlarda bile denetlenir. Rotalar statik: `addRoute()` yok.
- **Açık import'lar.** Global bileşen de şablonda örnek property'si de yok. `RouterLink` ve `RouterView`'ı import edersin, rotayı da `useRoute()`'tan alırsın.
- **Guard kararını döndürür.** Bir guard `false`, bir konum ya da hiçbir şey döndürür; `next()` yok.
- **Testler gerçek ağacı çalıştırır.** `mount()` gerçek çocukları gerçek uygulamayla render eder. Stub, shallow mount ya da içine girilecek bir bileşen örneği yok. Testlerde DOM'u CSS seçicileriyle sorgularsın.

## Router {#router}

| vue-router                                                                        | vibe.js                                                                                                           | Eski yazımı ne yakalar                                                                                                                                |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| guard içinde `next()`, `next(false)`, `next('/login')`                            | `return`, `return false`, `return '/login'`                                                                       | üçüncü parametresi olan bir guard için [VIBE7107](https://vibejs.org/v0/errors/VIBE7107)                                                              |
| `createWebHashHistory()`                                                          | `createWebHistory()`; sunucu da `index.html`'e geri düşer                                                         | export edilmiyor, derleme hatası                                                                                                                      |
| `alias`, `sensitive`, `strict`, `parseQuery` ve ertelenen diğer seçenekler        | alias yerine yönlendiren bir rota; eşleştirme kuralları sabit                                                     | alternatifi de söyleyen [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)                                                                             |
| `router.addRoute()`, `router.removeRoute()`                                       | her rota `routes.ts` içinde; kullanıcıya göre değişen rotalar için guard'lar ve `meta`                            | `Router` üzerinde yok, derleme hatası; bkz. [Rotalar](https://vibejs.org/v0/ui/routing#routes)                                                        |
| adlandırılmış view'lar: `components: { default, sidebar }`                        | her biri tek bileşenli iç içe çocuk rotalar                                                                       | [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)                                                                                                     |
| `KeepAlive` ya da `Transition` ile `<RouterView v-slot="{ Component }">`          | içeriksiz `<RouterView />`                                                                                        | [VIBE7115](https://vibejs.org/v0/errors/VIBE7115)                                                                                                     |
| `<RouterLink custom v-slot="{ href, navigate }">`                                 | kendi link bileşeninde `useLink({ to })`                                                                          | `custom` bir prop değil, şablonda tip hatası; bkz. [useLink](https://vibejs.org/v0/ui/routing#routerview-and-routerlink)                              |
| `<RouterLink to="https://example.com">`                                           | düz bir `<a href>`                                                                                                | [VIBE7114](https://vibejs.org/v0/errors/VIBE7114)                                                                                                     |
| `<router-link>` ve `<router-view>`                                                | `<RouterLink>` ve `<RouterView>`                                                                                  | bileşen import edildiğinde [VIBE2002](https://vibejs.org/v0/errors/VIBE2002)                                                                          |
| import edilmeden kullanılan `RouterLink` (global kayıt)                           | `import { RouterLink, RouterView } from '@usevibejs/ui/router'`                                                   | [VIBE2001](https://vibejs.org/v0/errors/VIBE2001)                                                                                                     |
| şablonda `$route` ve `$router`                                                    | `<script setup lang="ts">` içinde `const route = useRoute()` ve `const router = useRouter()`                      | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                                                                     |
| `beforeRouteEnter`, `beforeRouteLeave` ve `beforeRouteUpdate` bileşen seçenekleri | kayıtta `beforeEnter` ya da `router.beforeEach()`; setup içinde `onBeforeRouteLeave()` ve `onBeforeRouteUpdate()` | options `<script>` için [VIBE1004](https://vibejs.org/v0/errors/VIBE1004), `defineOptions()` içinde [VIBE3331](https://vibejs.org/v0/errors/VIBE3331) |
| üretilmiş bir dosyadan ya da bir `RouteNamedMap`'ten tipli rotalar                | `defineRoutes([...])` ve `interface Register { router: typeof router }`                                           | yanlış ad ya da parametre tip hatası verir; bkz. [Tipli rotalar](https://vibejs.org/v0/ui/routing#creating-the-router)                                |
| `route.params.id as string` ile `useRoute()`                                      | parametreleri tipli olan `useRoute('user')`                                                                       | o rota gösterilmiyorsa [VIBE7113](https://vibejs.org/v0/errors/VIBE7113)                                                                              |
| Pinia `defineStore()` ve `storeToRefs()`                                          | ref ve fonksiyon döndüren, modül seviyesinde bir composable                                                       | export edilmiyor, derleme hatası; bkz. [Paylaşılan durum](https://vibejs.org/v0/ui/data#shared-state)                                                 |

## Bileşen testi {#component-testing}

| Vue Test Utils                                    | vibe.js                                                                                      | Eski yazımı ne yakalar                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `mount(C, { global: { plugins: [router] } })`     | `mount(C, { plugins: [router] })`                                                            | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                       |
| `global.provide`                                  | `provide`                                                                                    | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                       |
| `global.stubs`, `stubs`, `shallow: true`          | gerçek çocuklar ya da tek bir çocuk için `vi.mock('./Child.vibe', ...)`                      | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                       |
| `shallowMount()`                                  | `mount()`                                                                                    | export edilmiyor, derleme hatası                                                                        |
| `wrapper.findComponent(Child)`, `getComponent()`  | çocuğun render ettiği şey üzerinde bir CSS seçici                                            | wrapper'da yok, derleme hatası; bkz. [Eleman bulmak](https://vibejs.org/v0/ui/testing#finding-elements) |
| `wrapper.vm.count`, `setData()`                   | DOM'u assert et; `props` ile başla                                                           | wrapper'da yok, derleme hatası; `data` için [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)           |
| `trigger('keydown.enter')`                        | `trigger('keydown', { key: 'Enter' })`                                                       | [VIBE7203](https://vibejs.org/v0/errors/VIBE7203)                                                       |
| `enableAutoUnmount(afterEach)`                    | hiçbir şey: her test mount ettiğini kendisi unmount eder                                     | export edilmiyor, derleme hatası                                                                        |
| `attrs`                                           | attribute'lar `props` içinde                                                                 | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                       |
| `findByRole()` ve diğer Testing Library sorguları | wrapper üzerinde CSS seçiciler ya da `wrapper.element` üzerinde herhangi bir DOM kütüphanesi | export edilmiyor, derleme hatası                                                                        |
| `environment: 'happy-dom'`                        | `environment: 'jsdom'`; test API'si bu ortamda test ediliyor                                 | derleme anında hiçbir şey; bkz. [Kurulum](https://vibejs.org/v0/ui/testing#setup)                       |

## Yan yana bir guard {#a-guard-side-by-side}

vue-router'daki şu guard

```text
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isSignedIn()) next({ name: 'login' });
  else next();
});
```

burada kararını döndürür:

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn()) return { name: 'login' };
});
```

## Yan yana bir test {#a-test-side-by-side}

Vue Test Utils'teki şu test

```text
const wrapper = mount(App, { global: { plugins: [router], stubs: { Chart: true } } });
expect(wrapper.findComponent(UserCard).props('id')).toBe(1);
```

burada gerçek ağacı çalıştırır ve DOM'u okur:

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

## Buradan nereye {#where-to-go-next}

- [Yönlendirme](https://vibejs.org/v0/ui/routing), [Bileşenleri test etmek](https://vibejs.org/v0/ui/testing) ve [Veri yükleme](https://vibejs.org/v0/ui/data).
