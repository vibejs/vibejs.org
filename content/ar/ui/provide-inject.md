# التزويد والحقن

تجعل `provide(key, value)` قيمةً متاحة لكل أحفاد المكوّن. وتقرأ `inject(key)` القيمة من أقرب سلف وفّر `key`. المكوّنات الواقعة بينهما لا تمرّر القيمة خصائصَ (props).

## مفاتيح ذات أنواع {#typed-keys}

`InjectionKey<T>` رمز (symbol) يحمل نوع قيمته، فتتحقق `provide()` من القيمة وتعيد `inject()` النوع `T`. صدّر المفتاح من وحدة `.ts` يستوردها الطرفان:

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

ينشئ المكوّن الموفِّر القيمة في setup الخاص به:

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

ويحقنها أي حفيد، وهنا عبر الدالة المركّبة `useTheme()` في `theme.ts`:

```vibe
<script setup lang="ts">
import { useTheme } from './theme.ts';

const theme = useTheme();
</script>

<template>
  <button v-if="theme" type="button" @click="theme.toggle()">{{ theme.mode.value }}</button>
</template>
```

وفّر ref أو كائنًا تفاعليًا، مثل `mode` أعلاه، إذا أردت أن يرى الأحفاد التغييرات. يصلح المفتاح النصي أيضًا، لكن قيمته بلا نوع.

## القيم الافتراضية {#defaults}

إن لم يوجد موفِّر، تعيد `inject(key)` القيمة `undefined` ويظهر التحذير VIBE5206 أثناء التطوير. والقيمة الافتراضية تجعل القيمة إلزامية:

```ts
// A default value.
const locale = inject(LocaleKey, ref('en'));

// A factory, called only when nothing is provided.
const fallback = inject(LocaleKey, () => ref(navigator.language), true);
console.log(locale.value, fallback.value);
```

الوسيط الثالث، `true`، يطلب من `inject()` أن تستدعي الدالة الافتراضية بدلًا من أن تعيد الدالة نفسها.

## قيم على مستوى التطبيق {#app-level-values}

توفّر `app.provide(key, value)` قيمة لكل مكوّنات التطبيق. وإذا استدعى مكوّن `provide()` بالمفتاح نفسه، تتقدّم قيمته عند أحفاده.

```ts
const app = createApp(App);
app.provide(LocaleKey, ref('en'));
app.mount('#app');
```

## خارج setup {#outside-setup}

تعمل `provide()` و`inject()` أثناء setup المكوّن. تخبرك `hasInjectionContext()` هل يمكن استدعاء `inject()` في هذه النقطة، فتستطيع الدالة المركّبة أن تفشل برسالة واضحة أو أن تلجأ إلى بديل. وتشغّل `app.runWithContext(fn)` الدالة `fn` والتطبيقُ سياقُ الحقن، فيستطيع كود خارج أي مكوّن، مثل guard في الموجِّه أو اختبار، أن يقرأ قيم التطبيق:

```ts
const app = createApp(App).provide(LocaleKey, ref('de'));

const locale = app.runWithContext(() => {
  console.log(hasInjectionContext()); // true
  return inject(LocaleKey);
});
console.log(locale?.value); // 'de'
```

## الواجهة والخادم {#ui-and-server}

تقرأ `inject(key)` داخل المكوّن القيم الموفَّرة في شجرة المكوّنات. ولا علاقة لها بالحقل `inject(Token)` في الخادم من `@usevibejs/server`، الذي يجلب providers من حاوية حقن التبعيات في الوحدة (module). لا يتشارك الاثنان أي قيمة.
