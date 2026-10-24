# Yaşam döngüsü

Bir bileşenin setup'ı, bileşen oluşturulduğunda bir kez çalışır. Lifecycle hook'ları, daha sonraki noktalarda çalışacak fonksiyonları kaydeder. Setup sırasında, eşzamanlı olarak çağrılırlar: başka bir yerde, örneğin bir `await` sonrasında çağrılan hook VIBE5205 uyarısı verir.

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

| Hook              | Ne zaman çalışır                                                     |
| ----------------- | -------------------------------------------------------------------- |
| `onBeforeMount`   | bileşenin DOM'u oluşturulduktan sonra, dokümana eklenmeden önce      |
| `onMounted`       | DOM eklendikten sonra; template ref'leri atanmıştır                  |
| `onBeforeUpdate`  | bir durum değişikliği bileşenin DOM'unu güncellemeden önce           |
| `onUpdated`       | güncellemeden sonra, değişiklik grubu başına bir kez                 |
| `onBeforeUnmount` | bileşen kaldırılmadan önce; DOM ve template ref'leri hâlâ yerindedir |
| `onUnmounted`     | bileşen kaldırıldıktan ve watcher'ları durdurulduktan sonra          |
| `onErrorCaptured` | bir alt bileşen hata fırlattığında; bkz. [Hatalar](#errors)          |

Bileşenin dışında bir şey kuran effect'ler (örneğin `window` üzerindeki dinleyiciler, bir zamanlayıcı ya da bir observer) `onMounted` içinde başlar ve `onBeforeUnmount` ya da `onUnmounted` içinde durur. Setup'ta oluşturulan watcher'lar ve computed değerler kendiliğinden durur. `onScopeDispose()`, unmount sırasında da çalışan bir temizlik fonksiyonu kaydeder ve bileşen dışında çağrılan composable'larda da çalışır.

## Hook sırası {#hook-order}

- **Mount etme:** her bileşen önce DOM'unu oluşturur, sonra `onBeforeMount` çalıştırır, sonra DOM'u ekler. Bir alt bileşen, üst bileşeni kendi DOM'unu kurarken DOM'unu oluşturur ve ekler; bu yüzden alt bileşenin `onBeforeMount` ve `onMounted` hook'ları üst bileşeninkilerden önce çalışır. `onMounted` çalıştığında alt ağacın tamamı dokümandadır.
- **Güncelleme:** bir durum değişikliği yalnızca onu okuyan bağlamaları, tarayıcı boyamadan önce bir grup halinde yeniden çalıştırır. `onBeforeUpdate` ve `onUpdated`, template bağlamaları o grupta çalışan her bileşen için çalışır.
- **Unmount etme:** üst bileşenin `onBeforeUnmount` hook'u alt bileşenlerinkinden önce çalışır; `onUnmounted` hook'ları ise DOM kaldırıldıktan sonra çalışır.

`onBeforeMount` DOM kurulduktan sonra çalışır; bu yüzden template ref'leri, henüz dokümanda olmayan elemanları zaten gösterir: bu elemanların yerleşimi (layout) ve boyutu yoktur.

## Hatalar {#errors}

Setup'ta, bir template bağlamasında, bir watcher'da, bir olay handler'ında ya da bir hook'ta fırlatılan hata bileşen ağacında yukarı doğru ilerler:

1. Her ata bileşenin `onErrorCaptured(err, instance, info)` hook'u, en yakından başlayarak çalışır. `instance` hatanın oluştuğu bileşendir; `info` kaynağı adlandırır, örneğin `'render effect'` ya da `'native event handler'`. `false` döndürmek hatayı orada durdurur.
2. Hiçbir hook durdurmadıysa `app.config.errorHandler` hatayı alır.
3. `errorHandler` yoksa hata [VIBE5102](https://vibejs.org/v0/errors/VIBE5102) olarak loglanır; geliştirme sırasında bileşen izi de eklenir.

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

Setup'ı ya da render'ı hata fırlatan bir bileşen hiçbir şey render etmez ve sayfanın geri kalanı çalışmaya devam eder. Setup `async` olamaz ve `<script setup>` üst düzeyde `await` kullanamaz ([VIBE3002](https://vibejs.org/v0/errors/VIBE3002), [VIBE5204](https://vibejs.org/v0/errors/VIBE5204)): işi setup'ta başlatın ve sonuç geldiğinde bir ref'te saklayın.
