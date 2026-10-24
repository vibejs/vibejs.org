# Yaşam döngüsü

Bir bileşenin setup'ı bir kere, bileşen oluşurken çalışır. Yaşam döngüsü hook'ları ise daha sonraki anlarda çalışacak fonksiyonları kaydeder. Bu hook'ları setup sırasında ve senkron olarak çağırırsın. Başka bir yerde, örneğin bir `await` sonrasında çağırırsan VIBE5205 uyarısını alırsın.

```vibe
<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from '@usevibejs/ui';

const box = useTemplateRef<HTMLDivElement>('box');
const width = ref(0);
const observer = new ResizeObserver(([entry]) => (width.value = entry?.contentRect.width ?? 0));

onMounted(() => {
  if (box.value) observer.observe(box.value);
});
onUpdated(() => console.log('rendered', width.value));
onBeforeUnmount(() => observer.disconnect());
</script>

<template>
  <div ref="box">{{ width }}px wide</div>
</template>
```

## Hook'lar {#the-hooks}

| Hook              | Ne zaman çalışır                                                   |
| ----------------- | ------------------------------------------------------------------ |
| `onBeforeMount`   | bileşenin DOM'u oluştuktan sonra, belgeye eklenmeden önce          |
| `onMounted`       | DOM belgeye eklendikten sonra; template ref'ler artık dolu         |
| `onBeforeUpdate`  | bir durum değişikliği bileşenin DOM'unu güncellemeden önce         |
| `onUpdated`       | güncellemeden sonra, her değişiklik grubu için bir kere            |
| `onBeforeUnmount` | bileşen kaldırılmadan önce; DOM ve template ref'ler hâlâ yerinde   |
| `onUnmounted`     | bileşen kaldırıldıktan ve watcher'ları durduktan sonra             |
| `onErrorCaptured` | alt bileşenlerden biri hata fırlattığında; bak: [Hatalar](#errors) |

Bileşenin dışında bir şey kuran işleri, örneğin `window` üzerindeki listener'ları, bir timer'ı ya da bir observer'ı `onMounted` içinde başlat. `onBeforeUnmount` ya da `onUnmounted` içinde de durdur. Setup içinde oluşturduğun watcher ve computed değerler kendiliğinden durur. `onScopeDispose()` da unmount anında çalışacak bir temizlik fonksiyonu kaydeder. Üstelik bileşen dışında çağrılan composable'larda da çalışır.

## Hook sırası {#hook-order}

- **Mount:** Her bileşen önce DOM'unu oluşturur, sonra `onBeforeMount` çalışır, ardından DOM'u belgeye ekler. Üst bileşen kendi DOM'unu kurarken çocuklar da kendi DOM'larını oluşturup ekler. Bu yüzden çocuğun `onBeforeMount` ve `onMounted` hook'ları üst bileşeninkilerden önce çalışır. `onMounted` çalıştığında alt ağacın tamamı belgededir.
- **Güncelleme:** Bir durum değişikliği sadece o durumu okuyan bağlamaları yeniden çalıştırır. Bu bağlamaların hepsi, tarayıcı ekranı çizmeden önce tek bir grupta çalışır. `onBeforeUpdate` ve `onUpdated`, o grupta şablon bağlamaları çalışan her bileşen için çalışır.
- **Unmount:** Üst bileşenin `onBeforeUnmount` hook'u çocuklarınkinden önce çalışır. `onUnmounted` hook'ları DOM kaldırıldıktan sonra çalışır.

`onBeforeMount` DOM kurulduktan sonra çalışır. Yani template ref'ler zaten elemanları gösterir, ama elemanlar henüz belgede değildir: layout'ları ve boyutları yoktur.

## Hatalar {#errors}

Setup içinde, bir şablon bağlamasında, bir watcher'da, bir event handler'da ya da bir hook'ta fırlatılan hata bileşen ağacında yukarı doğru çıkar:

1. Her üst bileşenin `onErrorCaptured(err, instance, info)` hook'u, en yakından başlayarak çalışır. `instance` hatanın çıktığı bileşendir. `info` ise kaynağı söyler, örneğin `'render effect'` ya da `'native event handler'`. `false` dönersen hata orada durur.
2. Hiçbir hook durdurmadıysa hatayı `app.config.errorHandler` alır.
3. `errorHandler` yoksa hata [VIBE5102](https://vibejs.org/v0/errors/VIBE5102) olarak loglanır. Geliştirme sırasında bileşen izi de yazılır.

```vibe
<script setup lang="ts">
import { onErrorCaptured, ref } from '@usevibejs/ui';
import Chart from './Chart.vibe';

const failed = ref(false);

onErrorCaptured((err, instance, info) => {
  console.warn(`${instance?.name ?? 'A component'} failed in ${info}`, err);
  failed.value = true;
  return false;
});
</script>

<template>
  <p v-if="failed">The chart is not available.</p>
  <Chart v-else />
</template>
```

Setup'ı ya da render'ı hata fırlatan bir bileşen hiçbir şey çizmez, sayfanın geri kalanı çalışmaya devam eder. Setup `async` olamaz, `<script setup>` da en üst seviyede `await` kullanamaz ([VIBE3002](https://vibejs.org/v0/errors/VIBE3002), [VIBE5204](https://vibejs.org/v0/errors/VIBE5204)). İşi setup içinde başlat, sonuç gelince bir ref'e yaz.
