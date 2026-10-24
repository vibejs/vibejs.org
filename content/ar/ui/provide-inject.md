# Provide وinject

تجعل `provide(key, value)` القيمة متاحة لكل مكوّن تابع لمكوّن ما، وتقرأ `inject(key)` قيمة أقرب سلف وفّر `key`. ولا تمرّرها المكوّنات الواقعة بينهما كخصائص (props).

## المفاتيح المُنمَّطة {#typed-keys}

`InjectionKey<T>` هو رمز (symbol) يحمل نوع قيمته، ولذلك تفحص `provide()` القيمة وتعيد `inject()` النوع `T`. صدِّر المفتاح من وحدة `.ts` يستوردها الطرفان:

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

ينشئ المزوِّد القيمة في setup الخاص به:

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

يحقنها أي مكوّن تابع، وهنا عبر الـ composable المسمّى `useTheme()` في `theme.ts`:

```vibe
<script setup lang="ts">
import { useTheme } from './theme.ts';

const theme = useTheme();
</script>

<template>
  <button v-if="theme" type="button" @click="theme.toggle()">{{ theme.mode.value }}</button>
</template>
```

وفّر ref أو كائنًا تفاعليًا، كما في `mode` أعلاه، عندما يجب أن ترى المكوّنات التابعة التغييرات. ويصلح مفتاح نصي كذلك، لكن قيمته غير مُنمَّطة.

## القيم الافتراضية {#defaults}

بدون مزوِّد، تعيد `inject(key)` القيمة `undefined` وتُصدر تحذيرًا VIBE5206 أثناء التطوير. تجعل القيمة الافتراضية القيمة مطلوبة:

```ts
// A default value.
const locale = inject(LocaleKey, ref('en'));

// A factory, called only when nothing is provided.
const fallback = inject(LocaleKey, () => ref(navigator.language), true);
console.log(locale.value, fallback.value);
```

الوسيط الثالث، `true`، يخبر `inject()` بأن تستدعي القيمة الافتراضية بدلًا من إعادة الدالة نفسها.

## القيم على مستوى التطبيق {#app-level-values}

توفّر `app.provide(key, value)` قيمة لكل مكوّن في التطبيق. وتكون لاستدعاء `provide()` داخل مكوّن للمفتاح نفسه الأولوية بالنسبة للمكوّنات التابعة له.

```ts
const app = createApp(App);
app.provide(LocaleKey, ref('en'));
app.mount('#app');
```

## خارج setup {#outside-setup}

تعمل `provide()` و`inject()` أثناء setup الخاص بالمكوّن. تعيد `hasInjectionContext()` ما إذا كان يمكن استدعاء `inject()` في تلك النقطة، مما يتيح للـ composable أن يفشل برسالة واضحة أو أن يلجأ إلى بديل. وتشغّل `app.runWithContext(fn)` الدالة `fn` والتطبيق هو سياق الحقن، فتستطيع الشيفرة الواقعة خارج أي مكوّن، مثل حارس مسار أو اختبار، أن تقرأ قيم التطبيق:

```ts
const app = createApp(App).provide(LocaleKey, ref('de'));

const locale = app.runWithContext(() => {
  console.log(hasInjectionContext()); // true
  return inject(LocaleKey);
});
console.log(locale?.value); // 'de'
```

## الواجهة والخادم {#ui-and-server}

تقرأ `inject(key)` في المكوّن القيم الموفَّرة في شجرة المكوّنات. وهي لا علاقة لها بـ `inject(Token)` الخاصة بالحقول في الخادم ضمن `@usevibejs/server`، التي تحلّ المزوِّدين من حاوية حقن الاعتماديات لوحدة ما. ولا يتشارك الاثنان القيم أبدًا.
