# Adım adım eğitim

Bu eğitimde yeni bir uygulamaya `users` API'si eklersiniz, kullanıcıları listeleyen bir sayfa yazarsınız, `vibejs check` komutunun bir template'teki tip hatasını yakalamasını sağlarsınız, ardından uygulamayı derleyip sunarsınız. Yaklaşık on dakika sürer. Node.js `^24.15.0 || >=26` ve pnpm gerekir.

Bu sayfadaki her komut ve dosya, her değişiklikte vibe.js test paketi tarafından bu sırayla çalıştırılır; yani adımlar yazıldığı gibi çalışır.

## 1. Uygulamayı oluşturun {#1-create-the-app}

```sh
pnpm create vibejs my-app
cd my-app
```

Uygulamanın üç parçası vardır: API contract'ları için `contracts/`, sunucu için `server/` ve UI için `ui/`. Yapı ve editör kurulumu için [Başlarken](https://vibejs.org/v0/guides/getting-started) sayfasına bakın.

## 2. Denetleyin {#2-check-it}

```sh
pnpm vibejs check
```

`vibejs check` TypeScript ve `.vibe` template'leri üzerinde tip denetleyicisini, linter'ı, biçim denetimini ve kapsamlı testleri çalıştırır. Yeni bir uygulama, her dosyası tam kapsanmış olarak geçer.

## 3. Bir kaynak, bir sayfa ve bir bileşen üretin {#3-generate-a-resource-a-page-and-a-component}

```sh
pnpm vibejs g resource users
pnpm vibejs g page Users
pnpm vibejs g component UserCard
pnpm vibejs check
```

Her generator dosyalarını testleriyle birlikte yazar ve ait oldukları yerlere kaydeder:

- `g resource users`, kullanıcıları listeleme, getirme, oluşturma, güncelleme ve silme rotalarını içeren `contracts/src/users.contract.ts` contract'ını; ayrıca bir controller, bellek içi bir servis ve bir test içeren bir sunucu modülünü yazar. Modülü `server/src/app.module.ts` dosyasına, contract'ı da `ui/src/api.ts` içindeki UI'ın API istemcisine ekler.
- `g page Users`, testiyle birlikte `ui/src/pages/UsersPage.vibe` dosyasını yazar ve `/users` rotasını `ui/src/routes.ts` dosyasına ekler.
- `g component UserCard`, `title` prop'u olan bir bileşen olan `ui/src/components/UserCard.vibe` dosyasını ve testini yazar.

Bir contract her rotayı parametreleri, gövdesi, yanıtı ve hatalarıyla bir kez tanımlar; iki taraf da tiplerini ondan alır. Örnek todo uygulamasının contract'ı da aynı görünür:

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

Sunucu, contract'ın her rotasını tipli bir handler ile karşılar ([Controller'lar ve handler'lar](https://vibejs.org/v0/server/handlers)); UI ise kod üretimi olmadan tipli bir istemci üzerinden çağırır ([Contract'lar](https://vibejs.org/v0/server/contracts)). Generator'lar yaptığınız değişikliklerin üzerine asla yazmaz: birini yeniden çalıştırırsanız var olan dosyaları atlar.

## 4. Kullanıcıları listeleyin {#4-list-the-users}

Sayfanın kullanıcıları API'den yüklemesini ve her kullanıcı için numaralı bir `UserCard` göstermesini sağlayın. Önce sayfanın testi: uygulamayı `/users` adresinde, `fetch`'i tek bir kullanıcıyla yanıt veren bir API istemcisiyle mount eder.

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

Sonra sayfa. `useAsync` sayfa mount edildiğinde listeyi yükler; istemcinin sonucu ya `{ ok: true, data }` ya da `{ ok: false, error }` olur ([Veri yükleme](https://vibejs.org/v0/ui/data)). Bu ilk sürümde bir hata var:

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

## 5. Hatayı check'in bulmasını sağlayın {#5-let-check-find-the-mistake}

```sh exit=1
pnpm vibejs check
```

Denetim başarısız olur. Template'ler TypeScript gibi tip denetiminden geçer; bu yüzden tip hatası, `.vibe` dosyasında satırı ve sütunuyla bildirilir. Kart `1` gösterdiği için sayfanın testi de başarısız olur:

```txt
ui/src/pages/UsersPage.vibe:14:60  error  TS2322  Type 'number' is not assignable to type 'string'.
ui/src/pages/UsersPage.test.ts:8:1  error  test-failed  AssertionError: expected [ '1' ] to deeply equal [ '1. Ada' ]
```

`title` bir `string` prop'tur, `index + 1` ise bir sayı. Editörünüz aynı hatayı siz yazarken gösterir. Bir string geçin:

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

Denetim yeniden geçer; testler ve tam kapsama dahil.

## 6. Derleyin ve sunun {#6-build-and-serve}

```sh
pnpm vibejs build
pnpm start
```

`vibejs build` UI'ı `ui/dist` içine, sunucuyu `server/dist/main.js` içine yazar. `pnpm start`, derlenmiş sunucuyu 3000 portunda veya `PORT` içindeki portta çalıştırır: `/api/health` `{"status":"ok"}` yanıtını verir, `/api/users` ise kullanıcı listesini verir; şimdilik boştur. Ctrl+C ile durdurun. İki çıktı ayrı ayrı dağıtılır: UI statik dosyalar olarak, sunucu bir Node.js süreci olarak ([Dağıtım](https://vibejs.org/v0/server/#deploying)).

## 7. Geliştirin {#7-develop}

```sh
pnpm dev
```

`pnpm dev` UI'ı ve API'yi tek bir portta sunar ve URL'sini yazdırır; üzerinde `/users` adresini açın. Çalışırken açık bırakın:

- `ui/src/components/UserCard.vibe` dosyasını düzenleyin, örneğin markup'ını: sayfa yerinde güncellenir ve durumunu korur.
- `server/` altındaki bir dosyayı düzenleyin, örneğin servisi: sunucu bir saniyenin çok altında yeniden başlar ve sonraki istek yeni koda ulaşır.
- Build, tarayıcı ve sunucu hataları `.vibejs/dev.log` dosyasına gider; `pnpm vibejs errors` bunları listeler.

Aynı uygulamada ikinci bir `pnpm dev`, yeni bir sunucu başlatmak yerine çalışan sunucuyu bildirir.

## Sonraki adım {#next}

- UI için [Yönlendirme](https://vibejs.org/v0/ui/routing) ve [Bileşenleri test etme](https://vibejs.org/v0/ui/testing).
- Sunucu için [Sunucu](https://vibejs.org/v0/server/) ve [Modüller ve provider'lar](https://vibejs.org/v0/server/modules).
- Bir kodlama ajanının uygulama üzerinde aynı komutlarla çalışması için [CLI ve yapay zekâ ajanları](https://vibejs.org/v0/guides/ai-agents).
