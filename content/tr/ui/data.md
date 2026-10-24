# Veri yükleme

`@usevibejs/ui` içindeki `useAsync()`, bir bileşende veri yükler ve bu veriyi güncel tutar. Tipli API istemcisiyle kullanınca her istek artık gerekmediği anda iptal olur. Hatalar dahil her sonuç da tipli bir değer olarak gelir.

## useAsync {#useasync}

`useAsync(fn)` hemen `fn(signal)` çağırır ve sana dört değer döner:

- `data`: son çalışmanın döndüğü değeri tutan ref. İlk çalışma bitmeden önce `undefined` olur.
- `error`: son çalışmanın fırlattığı şeyi tutan ref, yoksa `undefined`.
- `loading`: bir çalışma sürerken `true` olan ref.
- `refresh()`: `fn` fonksiyonunu yeniden çalıştırır. Dönen promise o çalışma bitince resolve olur ve hiçbir zaman reject etmez.

Örnek uygulamanın todo sayfası, URL'deki id'ye göre tek bir todo yükler:

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

`API`, uygulamanın kendi istemcisini provide ettiği injection anahtarıdır.

`loading` ile ilerlemeyi gösterirsin, `refresh()` ile de istediğin an yeniden yüklersin:

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

## Takip ve yeniden çalışma {#tracking-and-reruns}

`fn`, **ilk `await` ifadesinden önce** okuduğu reaktif bir değer değişince yeniden çalışır. Yukarıdaki örnekte `route.params.id` senkron okunuyor. Bu yüzden `/todos/1` adresinden `/todos/2` adresine geçtiğinde sayfa ekranda kalır ve yeni todo yüklenir. Bir `await` sonrasında okuduğun değer takip edilmez. Önce tüm girdileri oku, sonra bekle.

```ts
const query = ref('');
const page = ref(1);

const results = useAsync(async (signal) => {
  const q = query.value; // tracked
  const p = page.value; // tracked
  return search(q, p, signal);
});
```

## İptal {#aborting}

Her çalışma kendi `AbortSignal` nesnesini alır. Yeni bir çalışma başlayınca öncekinin sinyali iptal olur. Bileşen unmount olunca da o anki sinyal iptal olur. İsteğin gerçekten durması için sinyali istemci çağrısına `{ signal }` olarak ya da `fetch` fonksiyonuna ver. İptal edilen bir çalışma `data`, `error` ya da `loading` değerlerine hiçbir zaman yazmaz. Yani yavaş gelen bir yanıt, daha yeni bir yanıtın üzerine yazamaz.

`useAsync()` setup içinde ya da setup'ın çağırdığı bir composable içinde durmalı. Onu sahiplenecek bir bileşene ya da effect scope'a ihtiyacı var ([VIBE7301](https://vibejs.org/v0/errors/VIBE7301)).

## Tipli sonuçlar {#typed-results}

API istemcisi HTTP ya da ağ hatası yüzünden asla reject etmez. Her çağrı ya `{ ok: true, data }` ya da `{ ok: false, error }` olan bir sonuçla resolve olur. Yani istemciyi kullanırken hatalar `data` içinde gelir. `error` ise sadece gerçek bug'ları, örneğin `fn` içindeki bir exception'ı tutar.

Payload'u okumadan önce `ok` alanına bakarak tipi daralt. Şablonda bunu `v-if="data?.ok"` ile, script'te de `data.value?.ok` ile yaparsın.

```ts
const { data } = useAsync((signal) => health({ signal }));

const status = computed(() =>
  data.value?.ok ? data.value.data.status : (data.value?.error.code ?? 'checking'),
);
```

`error.code`, rotanın sözleşmesinde (contract) tanımladığı kodlardan biri ya da `NETWORK_ERROR` gibi bir istemci kodudur. Bu yüzden üzerine yazdığın bir `switch` ifadesini TypeScript denetler.

## Paylaşılan durum {#shared-state}

Giriş yapmış kullanıcı ya da sepet gibi birden çok bileşenin okuduğu durumu bir modülde tutarsın. Durumu modül seviyesinde bir kere oluştur ve bir composable üzerinden dışarı aç.

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

`useCart()` çağıran her bileşen aynı durumu okur ve değiştirir. Şablon da ref'leri her zamanki gibi açar. Yazma işlemlerini composable'ın fonksiyonlarında tut ki her değişiklik tek bir yerden geçsin. Testlerde durumu bir `beforeEach` içinde `clear()` ile sıfırla. Çünkü aynı dosyadaki testler arasında modül yüklü kalır.

Durum ağacın sadece bir kısmına aitse ya da bir testin onu değiştirmesi gerekiyorsa, onun yerine `provide()` ile ver ve `inject()` ile oku.

## Ayrıca bak {#see-also}

- [Yönlendirme](https://vibejs.org/v0/ui/routing): parametreler, guard'lar ve lazy sayfalar.
- [Bileşenleri test etmek](https://vibejs.org/v0/ui/testing#waiting-for-async-work): veri yüklendikten sonra `flushPromises()`.
