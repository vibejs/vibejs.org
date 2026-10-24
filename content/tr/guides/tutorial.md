# Adım adım eğitim

Bu eğitimde yeni bir uygulamaya `users` API'si ekleyeceksin, kullanıcıları listeleyen bir sayfa yazacaksın, şablondaki bir tip hatasını `vibejs check` ile yakalayacaksın ve sonunda uygulamanın build'ini alıp sunacaksın. Yaklaşık on dakika sürer. Node.js `^24.15.0 || >=26` ve pnpm gerekiyor.

Bu sayfadaki her komutu ve dosyayı vibe.js test paketi her değişiklikte aynı sırayla çalıştırıyor. Yani adımlar yazıldığı gibi çalışır.

## 1. Uygulamayı oluştur {#1-create-the-app}

```sh
pnpm create vibejs my-app
cd my-app
```

Uygulamanın üç parçası var: API sözleşmeleri (contract) için `contracts/`, sunucu için `server/` ve UI için `ui/`. Dosya yapısı ve editör kurulumu için [Başlarken](https://vibejs.org/v0/guides/getting-started) sayfasına bak.

## 2. Denetle {#2-check-it}

```sh
pnpm vibejs check
```

`vibejs check`, TypeScript'in ve `.vibe` şablonlarının tip denetimini, linter'ı, format kontrolünü ve coverage'lı testleri çalıştırır. Yeni bir uygulama bu denetimden geçer ve her dosyanın coverage'ı tamdır.

## 3. Bir kaynak, bir sayfa ve bir bileşen üret {#3-generate-a-resource-a-page-and-a-component}

```sh
pnpm vibejs g resource users
pnpm vibejs g page Users
pnpm vibejs g component UserCard
pnpm vibejs check
```

Her generator dosyalarını testleriyle yazar ve gereken yerlere kaydeder:

- `g resource users`, `contracts/src/users.contract.ts` sözleşmesini yazar. İçinde kullanıcıları listeleme, getirme, oluşturma, güncelleme ve silme rotaları var. Ayrıca bir controller, bellekte çalışan bir servis ve bir test içeren bir sunucu modülü yazar. Modülü `server/src/app.module.ts` dosyasına, sözleşmeyi de UI'ın `ui/src/api.ts` içindeki API istemcisine ekler.
- `g page Users`, `ui/src/pages/UsersPage.vibe` dosyasını testiyle yazar ve `ui/src/routes.ts` dosyasına `/users` rotasını ekler.
- `g component UserCard`, `ui/src/components/UserCard.vibe` dosyasını testiyle yazar. Bu, `title` prop'u olan bir bileşen.

Sözleşmede her rotayı parametreleri, gövdesi, yanıtı ve hatalarıyla bir kez tanımlarsın. İki taraf da tiplerini oradan alır. Örnek todo uygulamasının sözleşmesi de aynı görünüyor:

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

Sunucu, sözleşmedeki her rotayı tipli bir handler ile karşılar ([Controller'lar ve handler'lar](https://vibejs.org/v0/server/handlers)). UI ise onu kod üretmeden, tipli bir istemciyle çağırır ([Sözleşmeler](https://vibejs.org/v0/server/contracts)). Generator'lar senin değişikliklerinin üstüne asla yazmaz: birini tekrar çalıştırırsan var olan dosyaları atlar.

## 4. Kullanıcıları listele {#4-list-the-users}

Sayfa kullanıcıları API'den çeksin ve her kullanıcı için numaralı bir `UserCard` göstersin. Önce sayfanın testi: uygulamayı `/users` adresinde mount ediyor. API istemcisinin `fetch`'i de tek bir kullanıcıyla yanıt veriyor.

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

Sonra sayfanın kendisi. `useAsync` listeyi sayfa mount olunca yükler. İstemcinin sonucu ya `{ ok: true, data }` ya da `{ ok: false, error }` olur ([Veri yükleme](https://vibejs.org/v0/ui/data)). Bu ilk sürümde bir hata var:

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

## 5. Hatayı check bulsun {#5-let-check-find-the-mistake}

```sh exit=1
pnpm vibejs check
```

Denetim başarısız olur. Şablonlar da TypeScript gibi tip denetiminden geçer, o yüzden tip hatası `.vibe` dosyasında satırı ve sütunuyla gelir. Kart `1` gösterdiği için sayfanın testi de patlar:

```txt
ui/src/pages/UsersPage.vibe:14:60  error  TS2322  Type 'number' is not assignable to type 'string'.
ui/src/pages/UsersPage.test.ts:8:1  error  test-failed  AssertionError: expected [ '1' ] to deeply equal [ '1. Ada' ]
```

`title` bir `string` prop'u, `index + 1` ise bir sayı. Editörün de aynı hatayı sen yazarken gösterir. Bir string ver:

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

Denetim yine geçer; testler ve tam coverage dahil.

## 6. Build al ve sun {#6-build-and-serve}

```sh
pnpm vibejs build
pnpm start
```

`vibejs build`, UI'ı `ui/dist` altına, sunucuyu `server/dist/main.js` dosyasına yazar. `pnpm start` derlenmiş sunucuyu 3000 portunda ya da `PORT` içindeki portta çalıştırır. `/api/health` adresi `{"status":"ok"}` döner, `/api/users` ise kullanıcı listesini. Liste şimdilik boş. Ctrl+C ile durdur. İki çıktıyı ayrı ayrı deploy edersin: UI'ı statik dosya olarak, sunucuyu bir Node.js süreci olarak ([Deploy](https://vibejs.org/v0/server/#deploying)).

## 7. Geliştir {#7-develop}

```sh
pnpm dev
```

`pnpm dev`, UI'ı ve API'yi aynı portta sunar ve adresini yazdırır; o adreste `/users` sayfasını aç. Çalışırken açık bırak:

- `ui/src/components/UserCard.vibe` dosyasını, mesela işaretlemesini değiştir: sayfa yerinde güncellenir ve durumunu korur.
- `server/` altındaki bir dosyayı, mesela servisi değiştir: sunucu bir saniyeden çok daha kısa sürede yeniden başlar ve sonraki istek yeni koda gider.
- Build'in, tarayıcının ve sunucunun hataları `.vibejs/dev.log` dosyasına düşer; `pnpm vibejs errors` onları listeler.

Aynı uygulamada ikinci bir `pnpm dev` çalıştırırsan yeni bir sunucu başlatmaz, çalışan sunucuyu bildirir.

## Sonraki adım {#next}

- UI için [Yönlendirme](https://vibejs.org/v0/ui/routing) ve [Bileşenleri test etmek](https://vibejs.org/v0/ui/testing).
- Sunucu için [Sunucu](https://vibejs.org/v0/server/) ve [Modüller ve provider'lar](https://vibejs.org/v0/server/modules).
- Bir kodlama ajanının uygulamada aynı komutlarla çalışması için [CLI ve yapay zekâ ajanları](https://vibejs.org/v0/guides/ai-agents).
