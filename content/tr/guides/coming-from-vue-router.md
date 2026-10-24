# vue-router ve Vue Test Utils'ten geliyorsanız

`createRouter`, `RouterView`, `RouterLink`, `useRoute`, iç içe rotalar, bir konum döndüren guard'lar, `mount` ve wrapper'lar beklediğiniz gibi çalışır. Farklılıklar dört tercihten doğar:

- **Tek dosyadan tipli rotalar.** Rotalar `defineRoutes()` ile bir kez tanımlanır ve `Register` ile kaydedilir; böylece adlar, parametreler ve her `to` template'lerde de denetlenir. Rotalar statiktir: `addRoute()` yoktur.
- **Açık import'lar.** Template'lerde global bileşen ve örnek özelliği (instance property) yoktur: `RouterLink` ve `RouterView` import edilir, rota ise `useRoute()` ile alınır.
- **Guard'lar kararlarını döndürür.** Bir guard `false`, bir konum veya hiçbir şey döndürür; `next()` yoktur.
- **Testler gerçek ağacı çalıştırır.** `mount()` gerçek alt bileşenleri gerçek app ile render eder; stub, yüzeysel mount (shallow mounting) ve içine uzanılacak bir bileşen örneği yoktur. Testler DOM'u CSS seçicileriyle sorgular.

## Router {#router}

| vue-router                                                                        | vibe.js                                                                                                             | Eski biçimi ne yakalar                                                                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bir guard'da `next()`, `next(false)`, `next('/login')`                            | `return`, `return false`, `return '/login'`                                                                         | Üçüncü parametreli bir guard için [VIBE7107](https://vibejs.org/v0/errors/VIBE7107)                                                                         |
| `createWebHashHistory()`                                                          | `createWebHistory()`; sunucu `index.html` dosyasına geri düşer                                                      | Export edilmez, derleme hatası                                                                                                                              |
| `alias`, `sensitive`, `strict`, `parseQuery` ve ertelenen diğer seçenekler        | Alias yerine yönlendiren bir rota; sabit eşleştirme kuralları                                                       | Alternatifi söyleyen [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)                                                                                      |
| `router.addRoute()`, `router.removeRoute()`                                       | Her rota `routes.ts` içinde; kullanıcıya bağlı rotalar için guard'lar ve `meta`                                     | `Router` üzerinde yok, derleme hatası; bkz. [Rotalar](https://vibejs.org/v0/ui/routing#routes)                                                              |
| Adlandırılmış view'lar: `components: { default, sidebar }`                        | Her biri tek bileşenli iç içe alt rotalar                                                                           | [VIBE7103](https://vibejs.org/v0/errors/VIBE7103)                                                                                                           |
| `KeepAlive` veya `Transition` ile `<RouterView v-slot="{ Component }">`           | İçeriksiz `<RouterView />`                                                                                          | [VIBE7115](https://vibejs.org/v0/errors/VIBE7115)                                                                                                           |
| `<RouterLink custom v-slot="{ href, navigate }">`                                 | Kendi link bileşeninizde `useLink({ to })`                                                                          | `custom` bir prop değil, template tip hatası; bkz. [useLink](https://vibejs.org/v0/ui/routing#routerview-and-routerlink)                                    |
| `<RouterLink to="https://example.com">`                                           | Düz bir `<a href>`                                                                                                  | [VIBE7114](https://vibejs.org/v0/errors/VIBE7114)                                                                                                           |
| `<router-link>` ve `<router-view>`                                                | `<RouterLink>` ve `<RouterView>`                                                                                    | Bileşen import edildikten sonra [VIBE2002](https://vibejs.org/v0/errors/VIBE2002)                                                                           |
| Import olmadan kullanılan `RouterLink` (global kayıt)                             | `import { RouterLink, RouterView } from '@usevibejs/ui/router'`                                                     | [VIBE2001](https://vibejs.org/v0/errors/VIBE2001)                                                                                                           |
| Bir template'te `$route` ve `$router`                                             | `<script setup lang="ts">` içinde `const route = useRoute()` ve `const router = useRouter()`                        | [VIBE2008](https://vibejs.org/v0/errors/VIBE2008)                                                                                                           |
| `beforeRouteEnter`, `beforeRouteLeave` ve `beforeRouteUpdate` bileşen seçenekleri | Kayıt üzerinde `beforeEnter` veya `router.beforeEach()`; setup'ta `onBeforeRouteLeave()` ve `onBeforeRouteUpdate()` | Seçenekli bir `<script>` için [VIBE1004](https://vibejs.org/v0/errors/VIBE1004), `defineOptions()` içinde [VIBE3331](https://vibejs.org/v0/errors/VIBE3331) |
| Üretilmiş bir dosyadan veya `RouteNamedMap` ile tipli rotalar                     | `defineRoutes([...])` ve `interface Register { router: typeof router }`                                             | Yanlış bir ad veya parametre tip hatasıdır; bkz. [Tipli rotalar](https://vibejs.org/v0/ui/routing#creating-the-router)                                      |
| `route.params.id as string` ile `useRoute()`                                      | Parametreleri tipli olan `useRoute('user')`                                                                         | O rota gösterilmiyorsa [VIBE7113](https://vibejs.org/v0/errors/VIBE7113)                                                                                    |
| Pinia `defineStore()` ve `storeToRefs()`                                          | Ref'ler ve fonksiyonlar döndüren, modül kapsamlı bir composable                                                     | Export edilmez, derleme hatası; bkz. [Paylaşılan durum](https://vibejs.org/v0/ui/data#shared-state)                                                         |

## Bileşen testi {#component-testing}

| Vue Test Utils                                    | vibe.js                                                                                     | Eski biçimi ne yakalar                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `mount(C, { global: { plugins: [router] } })`     | `mount(C, { plugins: [router] })`                                                           | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                             |
| `global.provide`                                  | `provide`                                                                                   | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                             |
| `global.stubs`, `stubs`, `shallow: true`          | Gerçek alt bileşenler veya tek bir alt bileşen için `vi.mock('./Child.vibe', ...)`          | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                             |
| `shallowMount()`                                  | `mount()`                                                                                   | Export edilmez, derleme hatası                                                                                |
| `wrapper.findComponent(Child)`, `getComponent()`  | Alt bileşenin render ettiği şey üzerinde bir CSS seçici                                     | Wrapper üzerinde yok, derleme hatası; bkz. [Öğeleri bulma](https://vibejs.org/v0/ui/testing#finding-elements) |
| `wrapper.vm.count`, `setData()`                   | DOM'u doğrulayın; `props` ile başlayın                                                      | Wrapper üzerinde yok, derleme hatası; `data` için [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)           |
| `trigger('keydown.enter')`                        | `trigger('keydown', { key: 'Enter' })`                                                      | [VIBE7203](https://vibejs.org/v0/errors/VIBE7203)                                                             |
| `enableAutoUnmount(afterEach)`                    | Gerek yok: her test mount ettiğini unmount eder                                             | Export edilmez, derleme hatası                                                                                |
| `attrs`                                           | `props` içindeki öznitelikler                                                               | [VIBE7206](https://vibejs.org/v0/errors/VIBE7206)                                                             |
| `findByRole()` ve diğer Testing Library sorguları | Wrapper üzerinde CSS seçiciler veya `wrapper.element` üzerinde herhangi bir DOM kütüphanesi | Export edilmez, derleme hatası                                                                                |
| `environment: 'happy-dom'`                        | `environment: 'jsdom'`, test API'sinin test edildiği ortam                                  | Derleme zamanında hiçbir şey; bkz. [Kurulum](https://vibejs.org/v0/ui/testing#setup)                          |

## Yan yana bir guard {#a-guard-side-by-side}

vue-router guard'ı

```text
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isSignedIn()) next({ name: 'login' });
  else next();
});
```

kararını döndürür:

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn()) return { name: 'login' };
});
```

## Yan yana bir test {#a-test-side-by-side}

Vue Test Utils testi

```text
const wrapper = mount(App, { global: { plugins: [router], stubs: { Chart: true } } });
expect(wrapper.findComponent(UserCard).props('id')).toBe(1);
```

gerçek ağacı çalıştırır ve DOM'u okur:

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

## Sonra nereye gitmeli {#where-to-go-next}

- [Yönlendirme](https://vibejs.org/v0/ui/routing), [Bileşenleri test etme](https://vibejs.org/v0/ui/testing) ve [Veri yükleme](https://vibejs.org/v0/ui/data).
