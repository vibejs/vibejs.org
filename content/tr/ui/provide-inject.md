# Provide ve inject

`provide(key, value)` bir değeri bileşenin bütün alt bileşenlerine açar. `inject(key)` ise `key` için değer veren en yakın üst bileşenin değerini okur. Aradaki bileşenlerin bu değeri prop olarak taşıması gerekmez.

## Tipli anahtarlar {#typed-keys}

`InjectionKey<T>`, değerinin tipini taşıyan bir symbol'dür. Böylece `provide()` değeri denetler, `inject()` de `T` döner. Anahtarı, iki tarafın da import ettiği bir `.ts` modülünden export et:

```ts [theme.ts]
import { inject, type InjectionKey, type Ref } from '@usevibejs/ui';

export interface Theme {
  mode: Ref<'light' | 'dark'>;
  toggle: () => void;
}

export const ThemeKey: InjectionKey<Theme> = Symbol('theme');

/** The nearest provided theme; `undefined` without a provider. */
export const useTheme = (): Theme | undefined => inject(ThemeKey);
```

Değeri veren bileşen onu kendi setup'ında oluşturur:

```vibe
<script setup lang="ts">
import { provide, ref } from '@usevibejs/ui';
import Toolbar from './Toolbar.vibe';
import { ThemeKey } from './theme.ts';

const mode = ref<'light' | 'dark'>('light');
provide(ThemeKey, {
  mode,
  toggle: () => (mode.value = mode.value === 'light' ? 'dark' : 'light'),
});
</script>

<template>
  <main :class="mode">
    <Toolbar />
  </main>
</template>
```

Herhangi bir alt bileşen bu değeri inject edebilir. Burada `theme.ts` içindeki `useTheme()` composable'ı üzerinden yapıyoruz:

```vibe
<script setup lang="ts">
import { useTheme } from './theme.ts';

const theme = useTheme();
</script>

<template>
  <button v-if="theme" type="button" @click="theme.toggle()">{{ theme.mode.value }}</button>
</template>
```

Alt bileşenlerin değişiklikleri görmesini istiyorsan, yukarıdaki `mode` gibi bir ref ya da reaktif nesne ver. String anahtar da çalışır, ama o zaman değerin tipi olmaz.

## Varsayılan değerler {#defaults}

Değer veren bir üst bileşen yoksa `inject(key)` `undefined` döner ve geliştirme sırasında VIBE5206 uyarısı verir. Bir varsayılan verirsen değer kesinleşir:

```ts
// A default value.
const locale = inject(LocaleKey, ref('en'));

// A factory, called only when nothing is provided.
const fallback = inject(LocaleKey, () => ref(navigator.language), true);
console.log(locale.value, fallback.value);
```

Üçüncü argüman olan `true`, `inject()` fonksiyonuna varsayılanı olduğu gibi dönmek yerine çağırmasını söyler.

## Uygulama seviyesindeki değerler {#app-level-values}

`app.provide(key, value)` bir değeri uygulamadaki her bileşene açar. Bir bileşen aynı anahtar için `provide()` çağırırsa, kendi alt bileşenleri için onun değeri geçerli olur.

```ts
const app = createApp(App);
app.provide(LocaleKey, ref('en'));
app.mount('#app');
```

## Setup dışında {#outside-setup}

`provide()` ve `inject()` bir bileşenin setup'ı sırasında çalışır. `hasInjectionContext()` o anda `inject()` çağırıp çağıramayacağını söyler. Bir composable bunu kullanarak anlaşılır bir mesajla hata verebilir ya da başka bir yola geçebilir. `app.runWithContext(fn)` ise `fn` fonksiyonunu injection bağlamı olarak uygulamayla çalıştırır. Böylece bir router guard'ı ya da bir test gibi hiçbir bileşenin içinde olmayan kod da uygulamanın değerlerini okuyabilir:

```ts
const app = createApp(App).provide(LocaleKey, ref('de'));

const locale = app.runWithContext(() => {
  console.log(hasInjectionContext()); // true
  return inject(LocaleKey);
});
console.log(locale?.value); // 'de'
```

## UI ve sunucu {#ui-and-server}

Bir bileşendeki `inject(key)` bileşen ağacında verilen değerleri okur. `@usevibejs/server` paketindeki field `inject(Token)` ile bir ilgisi yoktur. O, provider'ları bir modülün dependency injection container'ından çözer. İkisi hiçbir zaman değer paylaşmaz.
