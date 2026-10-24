# Arayüz temelleri

Bir vibe.js uygulamasının arayüzü iki şeyden oluşur: `.vibe` dosyalarında yazdığın bileşenler ve bu bileşenlerin okuduğu reaktif durum. Bir bileşenin import ettiği her şey `@usevibejs/ui` paketinden gelir. Derleyici ve dil araçları script ile şablonun tipini birlikte denetler.

## Bir bileşen {#a-component}

Bir `.vibe` dosyasında en fazla üç blok olur: setup script'i, şablon ve scoped stiller.

```vibe
<script setup lang="ts">
import { computed, ref } from '@usevibejs/ui';

const { label = 'Count' } = defineProps<{ label?: string }>();

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<template>
  <button type="button" @click="count++">{{ label }}: {{ count }} (twice: {{ doubled }})</button>
</template>

<style scoped>
button {
  font-weight: 600;
}
</style>
```

- `<script setup lang="ts">` bileşenin her örneği için bir kere çalışır. En üst seviyedeki değişkenlerine ve import'larına şablondan erişirsin. Ref'ler orada otomatik açılır: şablonda `count`, script'te `count.value` yazarsın.
- `<template>` DOM'u tarif eder. Elemanları bir kere oluşturan, sonra sadece değişen durumu okuyan metinleri, attribute'ları ve listeleri güncelleyen koda derlenir.
- `<style scoped>` sadece bu bileşenin elemanlarına uygulanır.

`defineProps` ve diğer `define*` çağrıları derleyici makrolarıdır, import etmeden kullanırsın. Hepsinin listesi [Bileşenler](https://vibejs.org/v0/ui/components) sayfasında.

## Uygulamayı mount etmek {#mounting-the-app}

`createApp()` kök bileşeni alır. `mount()` onu bir elemanın ya da bir seçicinin bulduğu elemanın içine çizer ve elemanın içeriğini değiştirir.

```ts
const app = createApp(App);

app.config.errorHandler = (err, instance, info) => {
  console.error(`Error in ${instance?.name ?? 'the app'} (${info})`, err);
};
app.config.warnHandler = (message, instance, trace) => {
  console.warn(message, trace);
};

app.mount('#app');
```

Gerçek bir uygulamada `App`, `./App.vibe` dosyasının default import'udur.

- `errorHandler`, hiçbir `onErrorCaptured` hook'unun durdurmadığı her hatayı alır: setup içinde, bir render sırasında, bir watcher'da, bir event handler'da ya da bir yaşam döngüsü hook'unda fırlatılan hatalar. `info` kaynağı söyler, örneğin `'setup function'` ya da `'native event handler'`. Handler yoksa hata [VIBE5102](https://vibejs.org/v0/errors/VIBE5102) olarak loglanır.
- `warnHandler` geliştirme uyarılarını console yerine kendisi alır. Uyarıyla beraber bileşen isimlerinden oluşan izi de gelir. Production build'lerinde uyarı çıkmaz.
- `app.unmount()` kök bileşeni unmount eder ve düğümlerini kaldırır.

## Sıcak güncellemeler {#hot-updates}

Geliştirme sırasında bir `.vibe` dosyasını kaydettiğinde çalışan sayfa yenilenmeden güncellenir:

- Şablonu değiştirirsen bileşenin her örneği yeniden çizilir ve setup durumu korunur. O şablonun çizdiği çocuk bileşenler ise baştan oluşur, yani kendi durumları sıfırlanır.
- Script'i değiştirirsen bileşen yeni bir durumla baştan mount olur.

## Sırada ne var {#where-to-go-next}

- [Reaktivite](https://vibejs.org/v0/ui/reactivity): `ref`, `reactive`, `computed`, `watch` ve diğer temel yapılar.
- [Şablon sözdizimi](https://vibejs.org/v0/ui/template-syntax): interpolation, bağlamalar, event'ler, koşullar, listeler, `v-model` ve template ref'ler.
- [Bileşenler](https://vibejs.org/v0/ui/components): prop'lar, event'ler, slot'lar, model'ler, attribute'lar ve dışarı açılan değerler.
- [Yaşam döngüsü](https://vibejs.org/v0/ui/lifecycle): yaşam döngüsü hook'ları, sıraları ve hata yönetimi.
- [Provide ve inject](https://vibejs.org/v0/ui/provide-inject): değerleri bileşen ağacında aşağı aktarmak.
- [vibe.js'i genişletmek](https://vibejs.org/v0/guides/extending): plugin'ler ve composable'lar.
