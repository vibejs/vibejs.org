# Veri yükleme

`@usevibejs/ui` içindeki `useAsync()`, bir bileşende veriyi yükler ve güncel tutar. Tipli API istemcisiyle birlikte, gereksiz kalan her istek iptal edilir ve her sonuç, hatalar dahil, tipli bir değerdir.

## useAsync {#useasync}

`useAsync(fn)`, `fn(signal)` fonksiyonunu hemen çağırır ve dört değer döndürür:

- `data`: son çalıştırmanın çözümlendiği değeri tutan bir ref; ilk çalıştırma bitmeden önce `undefined` olur.
- `error`: son çalıştırmanın fırlattığı şeyi tutan bir ref, yoksa `undefined`.
- `loading`: bir çalıştırma sürerken `true` olan bir ref.
- `refresh()`: `fn` fonksiyonunu yeniden çalıştırır; o çalıştırma bitince promise çözülür ve asla reddedilmez.

Örnek uygulamanın todo sayfası, URL'deki id ile tek bir todo yükler:

```vibe
<script setup lang="ts">
import { inject, useAsync } from '@usevibejs/ui';
import { useRoute } from '@usevibejs/ui/router';
import { API } from '../api.ts';

const api = inject(API)!;
const route = useRoute('todo');
const { data: todo } = useAsync((signal) =>
  api.todos.get({ params: { id: route.params.id } }, { signal }),
);
</script>

<template>
  <section>
    <h1 v-if="todo?.ok">{{ todo.data.title }}</h1>
    <p v-else-if="todo" class="error">{{ todo.error.code }}</p>
  </section>
</template>
```

`API`, uygulamanın istemcisini sağladığı enjeksiyon anahtarıdır.

`loading` ve `refresh()` ilerlemeyi gösterir ve istek üzerine yeniden yükler:

```vibe
<script setup lang="ts">
import { useAsync } from '@usevibejs/ui';

const { data, loading, refresh } = useAsync(async (signal) => {
  const res = await fetch('/api/health', { signal });
  return (await res.json()) as { status: string };
});
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else>Status: {{ data?.status ?? 'unknown' }}</p>
  <button type="button" :disabled="loading" @click="refresh()">Reload</button>
</template>
```

## İzleme ve yeniden çalıştırma {#tracking-and-reruns}

`fn`, **ilk `await` öncesinde** okuduğu bir reaktif değer değiştiğinde yeniden çalışır. Yukarıda `route.params.id` eşzamanlı okunur; bu yüzden `/todos/1` adresinden `/todos/2` adresine geçildiğinde sayfa ekranda kalırken yeni todo yüklenir. Bir `await` sonrasında okunan değer izlenmez: önce tüm girdileri okuyun, sonra await edin.

```ts
const query = ref('');
const page = ref(1);

const results = useAsync(async (signal) => {
  const q = query.value; // tracked
  const p = page.value; // tracked
  return search(q, p, signal);
});
```

## İptal etmek {#aborting}

Her çalıştırma kendi `AbortSignal` nesnesini alır. Yeni bir çalıştırma başladığında önceki signal iptal edilir; bileşen unmount edildiğinde de güncel olan iptal edilir. İsteğin durması için signal'i istemci çağrısına, `{ signal }` olarak, ya da `fetch` fonksiyonuna geçirin. İptal edilmiş bir çalıştırma `data`, `error` ya da `loading` alanlarına asla yazmaz; böylece yavaş gelen bir yanıt daha yeni bir yanıtın üzerine yazamaz.

`useAsync()` setup içinde ya da setup'ın çağırdığı bir composable içinde kullanılmalıdır; onu sahiplenecek bir bileşene ya da effect scope'a ihtiyaç duyar ([VIBE7301](https://vibejs.org/v0/errors/VIBE7301)).

## Tipli sonuçlar {#typed-results}

API istemcisi bir HTTP ya da ağ hatası için asla reddetmez: her çağrı, `{ ok: true, data }` veya `{ ok: false, error }` biçiminde bir sonuca çözülür. Yani istemciyle birlikte hatalar `data` içinde gelir; `error` yalnızca `fn` içindeki bir istisna gibi gerçek hataları tutar.

Payload'ı okumadan önce `ok` üzerinden daraltın: template'te `v-if="data?.ok"` ile, script'te `data.value?.ok` ile.

```ts
const { data } = useAsync((signal) => health({ signal }));

const status = computed(() =>
  data.value?.ok ? data.value.data.status : (data.value?.error.code ?? 'checking'),
);
```

`error.code`, route'un contract'ında bildirdiği kodlardan biri ya da `NETWORK_ERROR` gibi bir istemci kodudur; bu yüzden üzerindeki bir `switch` TypeScript tarafından denetlenir.

## Paylaşılan durum {#shared-state}

Birden çok bileşenin okuduğu durum (oturum açmış kullanıcı ya da bir sepet gibi) bir modülde yaşar: modül kapsamında bir kez oluşturun ve bir composable ile dışarı açın.

```ts
import { computed, readonly, ref } from '@usevibejs/ui';

interface Item {
  id: number;
  price: number;
}

const items = ref<Item[]>([]);
const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0));

export function useCart() {
  return {
    items: readonly(items),
    total,
    add(item: Item) {
      items.value.push(item);
    },
    clear() {
      items.value = [];
    },
  };
}
```

`useCart()` çağıran her bileşen aynı durumu okur ve değiştirir; template ref'leri her zamanki gibi açar. Yazma işlemlerini composable'ın fonksiyonlarında tutun; böylece her değişiklik tek bir yerden geçer. Testlerde, modül aynı dosyanın testleri arasında yüklü kaldığı için durumu bir `beforeEach` içinde `clear()` ile sıfırlayın.

Ağacın tek bir bölümüne ait olan ya da bir testin değiştirmesi gereken durum için bunun yerine `provide()` ile sağlayın ve `inject()` ile okuyun.

## Ayrıca bakın {#see-also}

- [Routing](https://vibejs.org/v0/ui/routing): parametreler, guard'lar ve lazy sayfalar.
- [Bileşen testleri](https://vibejs.org/v0/ui/testing#waiting-for-async-work): veri yüklendikten sonra `flushPromises()`.
