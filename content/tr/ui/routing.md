# Yönlendirme

Router, URL'yi bir rota kaydı zincirine eşler ve bu kayıtların bileşenlerini çizer. `@usevibejs/ui/router` paketinden gelir ve tipleri senin rotalarını izler. Rota isimlerini, parametreleri ve linkleri hem script'lerde hem de şablonlarda TypeScript denetler.

## Rotalar {#routes}

Rotalar tek bir dosyada durur: `ui/src/routes.ts`. `defineRoutes()` diziyi olduğu gibi döner ve literal isimlerle path'leri korur. Router'ın tipleri de bunlardan çıkar.

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

Uygulamada `HomePage` ve diğer bileşenler `.vibe` dosyalarının default import'larıdır.

Bir kayıt `path`, `name`, `component`, `props`, `children`, `redirect`, `meta` ve `beforeEnter` alır. Başka bir anahtar yazarsan uygulama açılırken [VIBE7103](https://vibejs.org/v0/errors/VIBE7103) hatası verir. Yani yanlış yazdığın bir seçenek sessizce görmezden gelinmez. İsimler benzersiz olmalı ([VIBE7102](https://vibejs.org/v0/errors/VIBE7102)).

## Router'ı oluşturmak {#creating-the-router}

`createRouter()` history'yi, rotaları ve isteğe bağlı bir `scrollBehavior` alır. `app.use(router)` router'ı kurar ve ilk navigasyonu başlatır.

```ts
const router = createRouter({ history: createWebHistory(), routes });

declare module '@usevibejs/ui/router' {
  interface Register {
    router: typeof router;
  }
}

createApp(App).use(router).mount('#app');
```

- `createWebHistory(base?)` tarayıcının URL'sini ve history'sini kullanır. Uygulama `'/app'` gibi bir path altında sunuluyorsa `base` ver.
- `createMemoryHistory(base?)` history'yi bellekte tutar. Testler ve window olmayan ortamlar için kullanırsın ([VIBE7117](https://vibejs.org/v0/errors/VIBE7117)).

`Register` tanımı, router'ın bütün API'lerini senin rotalarınla tipler: `useRoute()`, `useRouter()`, `router.push()`, guard'lar ve `RouterLink` bileşeninin `to` değeri. Bunu uygulama başına bir kere, `createRouter()` çağrısının yanında tanımla.

## RouterView ve RouterLink {#routerview-and-routerlink}

`RouterView` eşleşen kaydın bileşenini çizer. O bileşenin içindeki bir `RouterView` de eşleşen çocuk rotayı çizer. `RouterLink` ise uygulamanın içinde gezinen bir `<a>` çizer. İkisini de kullandığın yerde import edersin. Global bileşen yoktur.

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

- `to` bir path ya da bir konum nesnesidir: `{ name, params, query, hash }` veya `{ path, query, hash }`. Var olmayan bir isim, eksik bir parametre ya da tipi yanlış bir parametre şablonda tip hatası verir.
- `replace` yeni bir history kaydı eklemek yerine o ankini değiştirir.
- Link, rotası o anki rotanın bir parçasıyken `router-link-active` class'ını alır. O anki rotanın kendisiyken de `router-link-exact-active` ve `aria-current="page"` alır. Bunları `activeClass`, `exactActiveClass` ve `ariaCurrentValue` ile değiştirirsin.
- Bir modifier tuşuyla, orta tuşla ya da `target="_blank"` olan bir linke yapılan tıklamaları tarayıcıya bırakır.
- `to` her zaman uygulamanın içinde bir konumdur. Başka siteler için düz bir `<a href>` kullan ([VIBE7114](https://vibejs.org/v0/errors/VIBE7114)).
- `RouterView` slot içeriği almaz ([VIBE7115](https://vibejs.org/v0/errors/VIBE7115)).

Link için farklı bir markup gerekiyorsa onu `useLink()` ile kur. Bu sana `href`, `isActive`, `isExactActive`, çözülmüş `route` ve `navigate(event)` döner. `navigate(event)` da aynı tıklama kurallarını uygular:

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

`useRoute()` o anki rotayı döner. Rota reaktiftir, yani onu okuyan şablonlar ve computed değerler her navigasyonda güncellenir. `useRouter()` ise router'ı döner.

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

`useRoute('user')`, `params` değerini `user` rotasına göre tipler. O rota o anki rotanın parçası değilse [VIBE7113](https://vibejs.org/v0/errors/VIBE7113) fırlatır. Bu yüzden onu sadece o rotanın sayfasında ve çocuklarında çağır. Bir rotada `path`, `fullPath`, `name`, `params`, `query`, `hash`, `matched`, `meta` ve `redirectedFrom` bulunur.

Aynı sayfa başka bir parametreyle ekranda kalırsa, örneğin `/users/1` adresinden `/users/2` adresine geçersen, bileşen örneği korunur. Bu yüzden parametreleri setup'ta bir kere kopyalamak yerine reaktif olarak oku.

### Prop olarak parametreler {#params-as-props}

Bir kayıtta `props: true` yazarsan sayfa parametreleri prop olarak alır. Tiplerini `RouteParams` ile ver:

```vibe
<script setup lang="ts">
import type { RouteParams } from '@usevibejs/ui/router';

const { id } = defineProps<RouteParams<'user'>>();
</script>

<template>
  <h1>User {{ id }}</h1>
</template>
```

`props` sabit prop'lardan oluşan bir nesne ya da rotadan prop'ları üreten bir fonksiyon da alabilir.

## Path'ler ve parametreler {#paths-and-params}

Path, `/` ile ayrılmış segmentlerden oluşan bir listedir. Her segment ya sabit bir metindir ya da tam olarak bir parametredir ([VIBE7101](https://vibejs.org/v0/errors/VIBE7101)):

| Segment    | Neyle eşleşir                  | Parametre tipi      |
| ---------- | ------------------------------ | ------------------- |
| `:id`      | tek bir segment                | `string`            |
| `:id(\d+)` | regex'e uyan tek bir segment   | `string`            |
| `:id?`     | opsiyonel bir segment          | `string`, opsiyonel |
| `:parts+`  | bir ya da daha fazla segment   | `string[]`          |
| `:parts*`  | sıfır ya da daha fazla segment | `string[]`          |

Path'ler büyük/küçük harfe duyarsız eşleşir ve sondaki eğik çizgi opsiyoneldir. Kayıtların sırası ne olursa olsun en belirgin path kazanır. Navigasyon yaparken parametrelere sayı da verebilirsin. `/:pathMatch(.*)*` başka hiçbir rotanın eşleşmediği her path ile eşleşir.

## Navigasyon {#navigating}

`router.push(to)` ve `router.replace(to)`, `RouterLink` ile aynı konumları alır. Navigasyon bitince resolve olurlar. Başarılıysa `undefined` ile resolve olurlar. Bir guard iptal ettiyse, daha yeni bir navigasyon onun yerini aldıysa ya da hedef zaten o anki rotaysa bir navigasyon hatasıyla resolve olurlar. Sadece bir guard, bir redirect ya da bir lazy yükleyici hata fırlatırsa, hata `router.onError()` noktasına ulaştıktan sonra reject ederler.

```ts
const failure = await router.push({ path: '/users', query: { page: '2' } });
if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  console.log('A guard kept the current page.');
}
```

`router.back()`, `router.forward()` ve `router.go(delta)` history içinde ileri geri gider. `router.resolve(to)` navigasyon yapmadan rotayı ve onun `href` değerini döner.

## Guard'lar {#guards}

Guard `to` ve `from` alır, kararını da dönüş değeriyle verir:

- hiçbir şey ya da `true`: devam et;
- `false`: iptal et ve o anki rotada kal;
- bir konum: oraya yönlendir.

Guard async olabilir. Hiçbir zaman üçüncü bir parametre almaz ([VIBE7107](https://vibejs.org/v0/errors/VIBE7107)).

```ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isSignedIn())
    return { path: '/login', query: { next: to.fullPath } };
});
```

Bir navigasyonun guard'ları şu sırayla, her biri öncekinin bitmesini bekleyerek çalışır:

1. Ayrılan sayfaların `onBeforeRouteLeave` hook'ları, en içtekinden başlayarak.
2. `router.beforeEach`.
3. Ekranda kalan sayfaların `onBeforeRouteUpdate` hook'ları.
4. Girilen kayıtların `beforeEnter` guard'ları.
5. Girilen kayıtların lazy bileşenleri yüklenir.
6. `router.beforeResolve`.

Sonra rota değişir, view'lar çizilir ve `router.afterEach(to, from, failure?)` çalışır. Guard'lar, redirect'ler, yükleyiciler ve hook'lar uygulamanın injection bağlamında çalışır. Yani uygulamanın provide ettiği değerler için `inject()` çağırabilirler. Hata fırlatan bir guard navigasyonu iptal eder. Hata `router.onError()` noktasına gider, kayıtlı bir handler yoksa da console'a düşer.

Bir sayfa kendi rotasını setup'ında `onBeforeRouteLeave` ve `onBeforeRouteUpdate` ile korur. Sayfa unmount olunca bunlar kaldırılır.

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

Bunlar sadece bir `RouterView` bileşeninin çizdiği bileşende ve onun çocuklarında çalışır ([VIBE7112](https://vibejs.org/v0/errors/VIBE7112)).

## Lazy sayfalar {#lazy-pages}

Fonksiyon olan bir `component`, rotasına ilk navigasyonda, rota değişmeden önce yüklenir ve sonraki navigasyonlar için saklanır: `() => import('./pages/UserPage.vibe')`. Build her lazy sayfayı kendi chunk'ına koyar.

Bir deploy sonrasında açık kalmış bir sekme artık var olmayan bir chunk isteyebilir. O zaman navigasyon [VIBE7109](https://vibejs.org/v0/errors/VIBE7109) ile başarısız olur. Yeni sürümü almak için hedefi tam sayfa olarak yükle:

```ts
router.onError((error, to) => {
  if (isVibeError(error, 'VIBE7109')) window.location.assign(to.fullPath);
});
```

## Scroll davranışı {#scroll-behavior}

Web history kullanıyorsan router geri ve ileri giderken scroll konumunu geri yükler. Hash varsa o elemana kaydırır, sadece query değişiyorsa konumu korur, diğer durumlarda en üste çıkar. `scrollBehavior` bu davranışın yerini alır. Bir konum, bir eleman için `{ el }`, scroll'u olduğu gibi bırakmak için `false` ya da en üste çıkmak için hiçbir şey döner.

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

Bir eleman kendi `scroll-margin-top` değeriyle görünüme kayar. Sabit bir header için yer bırakmak istediğinde bunu kullanırsın.

## Rota değişikliklerini duyurmak {#announcing-route-changes}

Ekran okuyucu sayfanın değiştiğini fark etmez. Her navigasyondan sonra yeni sayfayı bir live region içinde duyur ve her sayfaya bir `document.title` ver:

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

## Ayrıca bak {#see-also}

- [Veri yükleme](https://vibejs.org/v0/ui/data): o anki rota için `useAsync` ile veri yükle.
- [Bileşenleri test etmek](https://vibejs.org/v0/ui/testing#testing-with-the-router): sayfaları memory history ile test et.
