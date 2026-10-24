# Provide ve inject

`provide(key, value)` bir değeri bileşenin tüm alt soyları için kullanılabilir kılar; `inject(key)` ise `key` değerini sağlayan en yakın atanın değerini okur. Aradaki bileşenlerin değeri props olarak aktarması gerekmez.

## Tipli anahtarlar {#typed-keys}

`InjectionKey<T>`, değerinin türünü taşıyan bir symbol'dür; böylece `provide()` değeri denetler ve `inject()` `T` döndürür. Anahtarı, her iki tarafın içe aktardığı bir `.ts` modülünden dışa aktarın:

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

Sağlayan bileşen değeri kendi setup'ında oluşturur:

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

Herhangi bir alt soy bileşen bunu enjekte eder; burada `theme.ts` içindeki `useTheme()` composable'ı üzerinden:

```vibe
<script setup lang="ts">
import { useTheme } from './theme.ts';

const theme = useTheme();
</script>

<template>
  <button v-if="theme" type="button" @click="theme.toggle()">{{ theme.mode.value }}</button>
</template>
```

Alt soyların değişiklikleri görmesini istiyorsanız, yukarıdaki `mode` gibi bir ref ya da reaktif nesne sağlayın. Bir string anahtar da çalışır, ancak değeri tipli değildir.

## Varsayılan değerler {#defaults}

Sağlayan yoksa `inject(key)` `undefined` döndürür ve geliştirme sırasında VIBE5206 uyarısı verir. Bir varsayılan değer, değeri zorunlu kılar:

```ts
// A default value.
const locale = inject(LocaleKey, ref('en'));

// A factory, called only when nothing is provided.
const fallback = inject(LocaleKey, () => ref(navigator.language), true);
console.log(locale.value, fallback.value);
```

Üçüncü argüman olan `true`, `inject()` fonksiyonuna fonksiyonun kendisini döndürmek yerine varsayılanı çağırmasını söyler.

## Uygulama düzeyinde değerler {#app-level-values}

`app.provide(key, value)` bir değeri uygulamanın tüm bileşenlerine sağlar. Bir bileşenin aynı anahtar için yaptığı `provide()`, kendi alt soyları için önceliklidir.

```ts
const app = createApp(App);
app.provide(LocaleKey, ref('en'));
app.mount('#app');
```

## Setup dışında {#outside-setup}

`provide()` ve `inject()` bir bileşenin setup'ı sırasında çalışır. `hasInjectionContext()`, o noktada `inject()` çağrılıp çağrılamayacağını döndürür; böylece bir composable açık bir mesajla hata verebilir ya da yedek davranışa geçebilir. `app.runWithContext(fn)`, `fn` fonksiyonunu uygulamayı enjeksiyon bağlamı yaparak çalıştırır; böylece bir router guard'ı ya da test gibi herhangi bir bileşenin dışındaki kod uygulamanın değerlerini okuyabilir:

```ts
const app = createApp(App).provide(LocaleKey, ref('de'));

const locale = app.runWithContext(() => {
  console.log(hasInjectionContext()); // true
  return inject(LocaleKey);
});
console.log(locale?.value); // 'de'
```

## UI ve sunucu {#ui-and-server}

Bir bileşendeki `inject(key)`, bileşen ağacında sağlanan değerleri okur. `@usevibejs/server` paketinin alan (field) `inject(Token)` çağrısıyla ilgisi yoktur; o, provider'ları bir modülün dependency injection container'ından çözer. İkisi hiçbir zaman değer paylaşmaz.
