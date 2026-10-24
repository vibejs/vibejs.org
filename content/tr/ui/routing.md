# Yönlendirme

Router, URL'yi bir route kaydı zincirine eşler ve bunların bileşenlerini render eder. `@usevibejs/ui/router` paketinden gelir ve tipleri route'larınızı izler: route adları, parametreler ve bağlantılar, script'lerde ve template'lerde TypeScript tarafından denetlenir.

## Route'lar {#routes}

Route'lar tek bir dosyada, `ui/src/routes.ts` içinde yaşar. `defineRoutes()` diziyi değiştirmeden döndürür ve router'ı tipleyen sabit adlarını ve yollarını korur.

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

Uygulamada `HomePage` ve diğer bileşenler `.vibe` dosyalarının varsayılan içe aktarımlarıdır.

Bir kayıt `path`, `name`, `component`, `props`, `children`, `redirect`, `meta` ve `beforeEnter` alanlarını alır. Başka herhangi bir anahtar, başlangıçta [VIBE7103](https://vibejs.org/v0/errors/VIBE7103) ile hata verir; yani yanlış yazılmış bir seçenek asla yok sayılmaz. Adlar benzersizdir ([VIBE7102](https://vibejs.org/v0/errors/VIBE7102)).

## Router'ı oluşturmak {#creating-the-router}

`createRouter()` history'yi, route'ları ve isteğe bağlı bir `scrollBehavior` alır. `app.use(router)` onu kurar ve ilk navigasyonu başlatır.

```ts
const router = createRouter({ history: createWebHistory(), routes });

declare module '@usevibejs/ui/router' {
  interface Register {
    router: typeof router;
  }
}

createApp(App).use(router).mount('#app');
```

- `createWebHistory(base?)` tarayıcının URL'sini ve history'sini kullanır. Uygulama `'/app'` gibi bir yol altında sunuluyorsa `base` verin.
- `createMemoryHistory(base?)` history'yi bellekte tutar: testler ve window olmayan ortamlar için ([VIBE7117](https://vibejs.org/v0/errors/VIBE7117)).

`Register` bildirimi, her router API'sini route'larınızla tipler: `useRoute()`, `useRouter()`, `router.push()`, guard'lar ve `RouterLink` bileşeninin `to` değeri. Uygulama başına bir kez, `createRouter()` çağrısının yanında bildirin.

## RouterView ve RouterLink {#routerview-and-routerlink}

`RouterView`, eşleşen kaydın bileşenini render eder; o bileşenin içindeki bir `RouterView` ise eşleşen alt kaydı render eder. `RouterLink`, uygulama içinde gezinen bir `<a>` render eder. İkisi de kullanıldıkları yerde içe aktarılır; global bileşen yoktur.

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

- `to` bir yol ya da bir konum nesnesidir: `{ name, params, query, hash }` veya `{ path, query, hash }`. Var olmayan bir ad, eksik bir parametre ya da yanlış türde bir parametre template'te tür hatasıdır.
- `replace`, history'ye yeni kayıt eklemek yerine geçerli kaydın yerine geçer.
- Bağlantı, route'u geçerli route'un parçası olduğu sürece `router-link-active` sınıfını; geçerli route'un kendisi olduğu sürece `router-link-exact-active` sınıfını ve `aria-current="page"` değerini alır. `activeClass`, `exactActiveClass` ve `ariaCurrentValue` bunları değiştirir.
- Değiştirici tuşla, orta düğmeyle ya da `target="_blank"` olan bir bağlantıya yapılan tıklamalar tarayıcıya bırakılır.
- `to` her zaman uygulama içindeki bir konumdur. Başka siteler için düz bir `<a href>` kullanın ([VIBE7114](https://vibejs.org/v0/errors/VIBE7114)).
- `RouterView` slot içeriği almaz ([VIBE7115](https://vibejs.org/v0/errors/VIBE7115)).

Bir bağlantı başka bir işaretleme gerektiriyorsa `useLink()` ile oluşturun. Bu fonksiyon `href`, `isActive`, `isExactActive`, çözümlenmiş `route` ve aynı tıklama kurallarını uygulayan `navigate(event)` değerlerini döndürür:

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

## Rotayı okumak {#reading-the-route}

`useRoute()` geçerli route'u döndürür; reaktiftir, bu yüzden onu okuyan template'ler ve computed değerler her navigasyonda güncellenir. `useRouter()` router'ı döndürür.

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

`useRoute('user')`, `params` değerlerini `user` route'una göre tipler. O route geçerli route'un parçası değilse [VIBE7113](https://vibejs.org/v0/errors/VIBE7113) hatası fırlatır; bu yüzden onu yalnızca o route'un sayfasında ve alt sayfalarında çağırın. Bir route'un `path`, `fullPath`, `name`, `params`, `query`, `hash`, `matched`, `meta` ve `redirectedFrom` alanları vardır.

Aynı sayfa başka bir parametreyle ekranda kaldığında (örneğin `/users/1` adresinden `/users/2` adresine), bileşen örneği korunur: parametreleri setup'ta bir kez kopyalamak yerine reaktif olarak okuyun.

### Props olarak parametreler {#params-as-props}

Bir kayıtta `props: true` varsa sayfa parametreleri props olarak alır. Bunları `RouteParams` ile tipleyin:

```vibe
<script setup lang="ts">
import type { RouteParams } from '@usevibejs/ui/router';

const { id } = defineProps<RouteParams<'user'>>();
</script>

<template>
  <h1>User {{ id }}</h1>
</template>
```

`props` ayrıca sabit props'lardan oluşan bir nesne ya da route'tan props'a giden bir fonksiyon da alır.

## Yollar ve parametreler {#paths-and-params}

Yol, `/` ile ayrılmış segmentlerin listesidir. Her segment statik metin ya da tam olarak bir parametredir ([VIBE7101](https://vibejs.org/v0/errors/VIBE7101)):

| Segment    | Eşleşir                        | Parametre türü         |
| ---------- | ------------------------------ | ---------------------- |
| `:id`      | bir segment                    | `string`               |
| `:id(\d+)` | regex ile eşleşen bir segment  | `string`               |
| `:id?`     | isteğe bağlı bir segment       | `string`, isteğe bağlı |
| `:parts+`  | bir ya da daha fazla segment   | `string[]`             |
| `:parts*`  | sıfır ya da daha fazla segment | `string[]`             |

Yollar büyük/küçük harfe duyarsız eşleşir, sondaki eğik çizgi isteğe bağlıdır ve kayıtların sırasından bağımsız olarak en özel yol kazanır. Gezinirken parametreler sayı da kabul eder. `/:pathMatch(.*)*`, başka hiçbir route'un eşleşmediği her yolla eşleşir.

## Gezinmek {#navigating}

`router.push(to)` ve `router.replace(to)`, `RouterLink` ile aynı konumları alır. Navigasyon bittiğinde çözülürler: başarılıysa `undefined` ile, bir guard iptal ettiyse, daha yeni bir navigasyon yerini aldıysa ya da hedef geçerli route ise bir navigasyon hatasıyla. Yalnızca bir guard, bir redirect ya da bir lazy loader hata fırlattığında, hata `router.onError()` içine ulaştıktan sonra reddedilirler.

```ts
const failure = await router.push({ path: '/users', query: { page: '2' } });
if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  console.log('A guard kept the current page.');
}
```

`router.back()`, `router.forward()` ve `router.go(delta)` history içinde gezinir. `router.resolve(to)` gezinmeden route'u ve `href` değerini döndürür.

## Guard'lar {#guards}

Bir guard `to` ve `from` alır ve dönüş değeriyle karar verir:

- hiçbir şey ya da `true`: devam et;
- `false`: iptal et ve geçerli route'ta kal;
- bir konum: oraya yönlendir.

Bir guard async olabilir. Asla üçüncü parametre almaz ([VIBE7107](https://vibejs.org/v0/errors/VIBE7107)).

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn())
    return { path: '/login', query: { next: to.fullPath } };
});
```

Tek bir navigasyonun guard'ları, her biri öncekinin bitmesinden sonra olmak üzere şu sırayla çalışır:

1. Ayrılan sayfaların `onBeforeRouteLeave` guard'ı, en içtekinden başlayarak.
2. `router.beforeEach`.
3. Kalan sayfaların `onBeforeRouteUpdate` guard'ı.
4. Giren kayıtların `beforeEnter` guard'ı.
5. Giren kayıtların lazy bileşenleri yüklenir.
6. `router.beforeResolve`.

Ardından route değişir, görünümler render edilir ve `router.afterEach(to, from, failure?)` çalışır. Guard'lar, redirect'ler, loader'lar ve hook'lar uygulamanın enjeksiyon bağlamında çalışır; bu yüzden uygulamanın sağladığı değerler için `inject()` çağırabilirler. Hata fırlatan bir guard navigasyonu iptal eder; hata `router.onError()` içine, kayıtlı handler yoksa konsola ulaşır.

Bir sayfa kendi route'unu, setup'ında `onBeforeRouteLeave` ve `onBeforeRouteUpdate` ile korur. Bunlar sayfa unmount edildiğinde kaldırılır.

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

Yalnızca bir `RouterView` tarafından render edilen bileşende ve onun alt bileşenlerinde çalışırlar ([VIBE7112](https://vibejs.org/v0/errors/VIBE7112)).

## Lazy sayfalar {#lazy-pages}

Fonksiyon olan bir `component`, route'una ilk navigasyonda, route değişmeden önce yüklenir ve sonraki navigasyonlar için saklanır: `() => import('./pages/UserPage.vibe')`. Build her lazy sayfayı kendi chunk'ına koyar.

Bir deploy sonrasında, açık bir sekme artık var olmayan bir chunk isteyebilir. Navigasyon o zaman [VIBE7109](https://vibejs.org/v0/errors/VIBE7109) ile başarısız olur; yeni sürümü almak için hedefi tam sayfa olarak yükleyin:

```ts
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});
```

## Scroll davranışı {#scroll-behavior}

Web history ile router, geri ve ileri gidişte kaydırma konumunu geri yükler, bir hash'in elemanına kaydırır, yalnızca query değiştiğinde konumu korur, diğer durumlarda en üste kaydırır. `scrollBehavior` bunun yerine geçer: bir konum, bir eleman için `{ el }`, kaydırmayı olduğu gibi bırakmak için `false` ya da en üst için hiçbir şey döndürür.

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

Bir eleman, `scroll-margin-top` değeriyle görünüme kaydırılır; bu da sabit bir başlık için boşluk bırakır.

## Route değişikliklerini duyurmak {#announcing-route-changes}

Ekran okuyucu sayfanın değiştiğini fark etmez. Her navigasyondan sonra yeni sayfayı bir live region içinde duyurun ve her sayfaya bir `document.title` verin:

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

## Ayrıca bakın {#see-also}

- [Veri yükleme](https://vibejs.org/v0/ui/data): geçerli route için `useAsync` ile veri yükleyin.
- [Bileşen testleri](https://vibejs.org/v0/ui/testing#testing-with-the-router): sayfaları bir memory history ile test edin.
