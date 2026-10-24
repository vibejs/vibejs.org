# UI temelleri

Bir vibe.js uygulamasının arayüzü, `.vibe` dosyalarında yazılan bileşenlerden ve bunların okuduğu reaktif durumdan oluşur. Bir bileşenin içe aktardığı her şey `@usevibejs/ui` paketinden gelir; derleyici ve dil araçları script ile template'i birlikte tür denetiminden geçirir.

## Bir bileşen {#a-component}

Bir `.vibe` dosyası en fazla üç bloktan oluşur: setup script'i, template ve kapsamlı (scoped) stiller.

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

- `<script setup lang="ts">` bileşenin her örneği için bir kez çalışır. Üst düzey bağlamaları ve içe aktarımları template içinde kullanılabilir; ref'ler orada açılır: template `count` yazar, script `count.value` yazar.
- `<template>` DOM'u tanımlar. Elemanları bir kez oluşturan ve yalnızca değişen durumu okuyan metni, öznitelikleri ve listeleri güncelleyen koda derlenir.
- `<style scoped>` yalnızca bu bileşenin elemanlarına uygulanır.

`defineProps` ve diğer `define*` çağrıları derleyici makrolarıdır: içe aktarma gerekmeden kullanılabilir. [Bileşenler](https://vibejs.org/v0/ui/components) sayfası bunları listeler.

## Uygulamayı mount etmek {#mounting-the-app}

`createApp()` kök bileşeni alır; `mount()` onu bir elemana ya da bir seçicinin eşleştirdiği elemana render eder ve içeriğinin yerine geçer.

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

Gerçek bir uygulamada `App`, `./App.vibe` dosyasının varsayılan içe aktarımıdır.

- `errorHandler`, hiçbir `onErrorCaptured` hook'unun durdurmadığı her hatayı alır: setup'ta, render sırasında, bir watcher'da, bir olay handler'ında ya da bir lifecycle hook'unda fırlatılan hatalar. `info` kaynağı adlandırır; örneğin `'setup function'` ya da `'native event handler'`. Handler yoksa hata [VIBE5102](https://vibejs.org/v0/errors/VIBE5102) olarak loglanır.
- `warnHandler`, geliştirme uyarılarını konsol yerine bileşen adlarının izleriyle birlikte alır. Production build'lerinde uyarı yayınlanmaz.
- `app.unmount()` kök bileşeni unmount eder ve düğümlerini kaldırır.

## Sıcak güncellemeler {#hot-updates}

Geliştirme sırasında bir `.vibe` dosyasını kaydetmek, çalışan sayfayı yeniden yüklemeden günceller:

- Template'te yapılan bir düzenleme, bileşenin her örneğini yeniden render eder ve setup durumunu korur. O template'in render ettiği alt bileşenler yeniden oluşturulur; bu yüzden kendi durumları sıfırlanır.
- Script'te yapılan bir düzenleme bileşeni yeni durumla yeniden mount eder.

## Sonraki adımlar {#where-to-go-next}

- [Reaktivite](https://vibejs.org/v0/ui/reactivity): `ref`, `reactive`, `computed`, `watch` ve diğer ilkel yapılar.
- [Template sözdizimi](https://vibejs.org/v0/ui/template-syntax): interpolasyon, bağlamalar, olaylar, koşullar, listeler, `v-model` ve template ref'leri.
- [Bileşenler](https://vibejs.org/v0/ui/components): props, olaylar, slotlar, modeller, öznitelikler ve dışa açılan değerler.
- [Lifecycle](https://vibejs.org/v0/ui/lifecycle): lifecycle hook'ları, sıraları ve hata yönetimi.
- [Provide ve inject](https://vibejs.org/v0/ui/provide-inject): değerleri bileşen ağacında aşağı aktarmak.
- [vibe.js'i genişletmek](https://vibejs.org/v0/guides/extending): plugin'ler ve composable'lar.
