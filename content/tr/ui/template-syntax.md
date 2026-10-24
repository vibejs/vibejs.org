# Şablon sözdizimi

Şablon, içinde ifadeler ve direktifler olan bir HTML'dir. Bir ifade `<script setup>` içindeki değişkenleri ve import'ları, prop'ları, ayrıca `$attrs`, `$slots`, `$emit` ve `$props` değerlerini okuyabilir. Ref'ler burada açılmış hâlde gelir. Bunlardan hiçbiri olmayan bir isim yazarsan dosya derlenirken [VIBE2007](https://vibejs.org/v0/errors/VIBE2007) hatası alırsın.

## Metin {#text}

`{{ expression }}` metin basar. `null` ve `undefined` hiçbir şey basmaz. Diziler ve düz nesneler JSON olarak görünür.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const user = ref({ name: 'Ada', unread: 3 });
const html = '<em>Welcome back</em>';
</script>

<template>
  <p>{{ user.name }} has {{ user.unread }} unread {{ user.unread === 1 ? 'message' : 'messages' }}.</p>
  <p v-html="html"></p>
</template>
```

`v-text="value"` bir elemanın metin içeriğini, `v-html="value"` ise iç HTML'ini ayarlar. `v-html` string'i HTML olarak çizer. Ona sadece güvendiğin içeriği ver.

## Attribute'lar {#attributes}

`v-bind:name` ifadesinin kısaltması olan `:name="expression"`, bir attribute'u ya da bir DOM property'sini bağlar. `null` ve `undefined` attribute'u kaldırır. `false` ise `disabled` gibi boolean bir attribute'u kaldırır. `v-bind="object"` bir nesnenin bütün anahtarlarını tek seferde yayar.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const busy = ref(false);
const link = { href: 'https://vibejs.org', target: '_blank', rel: 'noopener' };
</script>

<template>
  <button type="submit" :disabled="busy" :aria-busy="busy">Save</button>
  <a v-bind="link">Docs</a>
</template>
```

`.prop` modifier'ı her zaman bir DOM property'si, `.attr` ise her zaman bir attribute ayarlar. `.camel` ismi camelCase'e çevirir.

## Class ve style {#class-and-style}

`:class` bir string, değeri truthy olan anahtarları eklenen bir nesne ya da bunlardan oluşan bir dizi alır. `:style` bir string, camelCase ya da kebab-case CSS property'lerinden oluşan bir nesne veya bir dizi alır. CSS custom property'leri (`--name`) ve `!important` iki biçimde de çalışır. Sabit bir `class` ya da `style` ile bağlanan değer birleştirilir.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const active = ref(true);
const size = ref(16);
</script>

<template>
  <div class="card" :class="{ active, large: size > 20 }" :style="{ fontSize: `${size}px`, '--accent': 'teal' }">
    <span :class="['badge', active && 'badge-on']">On</span>
  </div>
</template>
```

## Event'ler {#events}

`v-on:event` ifadesinin kısaltması olan `@event="handler"` bir listener ekler. Değer bir fonksiyon ya da event tetiklendiğinde çalışan bir ifade olabilir. Bu ifadenin içinde event'e `$event` ile erişirsin.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const count = ref(0);
const text = ref('');
function add(step: number) {
  count.value += step;
}
function submit() {
  text.value = '';
}
function type(event: Event) {
  text.value = (event.target as HTMLInputElement).value;
}
</script>

<template>
  <button type="button" @click="add(1)">Add</button>
  <button type="button" @click.shift="add(10)">Add 10 with Shift</button>
  <form @submit.prevent="submit">
    <input :value="text" @input="type" @keydown.enter.exact="submit" />
  </form>
</template>
```

- Modifier'lar: `.stop` ve `.prevent`, `stopPropagation()` ile `preventDefault()` çağırır. `.self` çocuklardan gelen event'leri yok sayar. `.once`, `.capture` ve `.passive` listener seçenekleridir. `.ctrl`, `.alt`, `.shift` ve `.meta` o tuşun basılı olmasını ister. `.exact` sadece listelenen tuşların basılı olmasını ister. `.left`, `.middle` ve `.right` de fare tuşunu seçer.
- `keydown`, `keyup` ve `keypress` üzerinde diğer modifier'lar kebab-case yazılmış tuş isimleridir: `.enter`, `.esc`, `.page-down`.
- Her listener `addEventListener` ile kendi elemanına bağlanır. Event'ler ortak bir üst elemana delege edilmez. `event.currentTarget` elemanın kendisidir. Bir handler içindeki `.stop` da event'in üst elemanların listener'larına ulaşmasını engeller.
- Event ismi sabittir ([VIBE2303](https://vibejs.org/v0/errors/VIBE2303)). Her event için tek bir attribute yazarsın ([VIBE2302](https://vibejs.org/v0/errors/VIBE2302)).

## Koşullar {#conditions}

`v-if`, `v-else-if` ve `v-else` birkaç daldan birini çizer. Kaldırılan dal unmount olur: içindeki bileşenler unmount hook'larını çalıştırır ve durumları kaybolur. `<template v-if>` birden fazla elemanı bir sarmalayıcı eleman olmadan gruplar.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const status = ref<'loading' | 'error' | 'ready'>('loading');
</script>

<template>
  <p v-if="status === 'loading'">Loading…</p>
  <template v-else-if="status === 'error'">
    <h2>Something went wrong</h2>
    <button type="button" @click="status = 'loading'">Retry</button>
  </template>
  <p v-else>Ready</p>
</template>
```

## Listeler {#lists}

`v-for` her öğe için bir eleman çizer. Öğeler bir diziden, `Map` ya da `Set` gibi bir iterable'dan, 1'den `n` değerine kadar sayılardan ya da bir nesnenin değerlerinden gelebilir. `v-for` içindeki her elemana benzersiz ve sabit bir `:key` vermen gerekir ([VIBE2203](https://vibejs.org/v0/errors/VIBE2203)). Sadece sayı aralığında gerekmez.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const todos = ref([
  { id: 1, title: 'Write docs', done: false },
  { id: 2, title: 'Ship', done: true },
]);
const scores = { ada: 3, grace: 5 };
</script>

<template>
  <ul>
    <li v-for="(todo, index) in todos" :key="todo.id" :class="{ done: todo.done }">{{ index + 1 }}. {{ todo.title }}</li>
  </ul>
  <dl>
    <template v-for="(score, name) in scores" :key="name">
      <dt>{{ name }}</dt>
      <dd>{{ score }}</dd>
    </template>
  </dl>
  <span v-for="n in 3">{{ n }}</span>
</template>
```

Liste değişince aynı key'e sahip öğeler elemanlarını ve durumlarını korur. Mümkün olan en az eleman yer değiştirir. `v-if` ile `v-for` aynı elemanda duramaz ([VIBE2103](https://vibejs.org/v0/errors/VIBE2103)). Bunun yerine listeyi bir `computed` içinde filtrele.

## v-show {#v-show}

`v-show="condition"`, koşul false olduğu sürece `display: none` uygular ve elemanı DOM'da tutar. Sık açılıp kapanan içerik için bunu kullan. Nadiren görünen içerik için `v-if` kullan. Sadece elemanlarda çalışır, bileşenlerde ya da `<template>` üzerinde çalışmaz.

## Elemanlarda v-model {#v-model-on-elements}

`v-model` bir form elemanını bir ref'e iki yönlü bağlar.

```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';

const name = ref('');
const age = ref(0);
const agree = ref(false);
const tags = ref<string[]>([]);
const plan = ref('free');
const color = ref('red');
</script>

<template>
  <input v-model.trim="name" />
  <input v-model.number="age" type="number" />
  <input v-model="agree" type="checkbox" />
  <input v-model="tags" type="checkbox" value="news" />
  <input v-model="tags" type="checkbox" value="offers" />
  <input v-model="plan" type="radio" value="free" />
  <input v-model="plan" type="radio" value="pro" />
  <select v-model="color">
    <option value="red">Red</option>
    <option value="blue">Blue</option>
  </select>
</template>
```

- Metin input'ları ve `<textarea>`, `input` event'inde güncellenir. `.lazy` yazarsan onun yerine `change` event'inde güncellenir. `.trim` değerin başındaki ve sonundaki boşlukları siler, `.number` da değeri sayıya çevirir (`<input type="number">` bunu zaten her zaman yapar). Bir giriş yöntemi metin oluştururken model, kompozisyon bitince güncellenir.
- Checkbox bir boolean bağlar ya da kendi `value` değerini bir diziye veya `Set` yapısına ekler ve çıkarır. `true-value` ve `false-value`, `true` ile `false` yerine geçer.
- Radio button model'i kendi `value` değerine ayarlar.
- `<select>` seçili seçeneğin değerini bağlar. `<select multiple>` ise değerlerden oluşan bir dizi bağlar.

[Bileşenler](https://vibejs.org/v0/ui/components#v-model) de `v-model` alabilir.

## Template ref'ler {#template-refs}

Bir elemana `ref="name"` yazarsan, script'te `useTemplateRef('name')` ile tanımladığın template ref dolar. Değeri eleman çizilene kadar `null` olur, eleman kaldırıldıktan sonra da yine `null` olur. `v-for` içinde ise elemanlardan oluşan bir dizidir.

```vibe
<script setup lang="ts">
import { onMounted, useTemplateRef } from '@usevibejs/ui';

const input = useTemplateRef<HTMLInputElement>('search');

onMounted(() => input.value?.focus());
</script>

<template>
  <input ref="search" type="search" />
</template>
```

Karşılığında bir `useTemplateRef()` olmayan string bir ref yazarsan [VIBE2701](https://vibejs.org/v0/errors/VIBE2701) hatası alırsın. Bağlanmış bir `:ref="(el) => ..."` fonksiyonu elemanla çağırır, eleman kaldırılınca da `null` ile çağırır. Bir bileşene koyduğun ref, o bileşenin [dışarı açtığı](https://vibejs.org/v0/ui/components#exposing-values) değerleri verir.

## Dinamik bileşenler {#dynamic-components}

`<component :is="value">`, `value` içinde duran bileşeni çizer. `null` ya da `undefined` için hiçbir şey çizmez. Değeri değiştirirsen önceki bileşen unmount olur.

```vibe
<script setup lang="ts">
import { shallowRef, type Component } from '@usevibejs/ui';

const props = defineProps<{ views: Record<string, Component> }>();
const current = shallowRef<Component | null>(null);

function open(name: string) {
  current.value = props.views[name] ?? null;
}
</script>

<template>
  <nav>
    <button v-for="(view, name) in views" :key="name" type="button" @click="open(name)">{{ name }}</button>
  </nav>
  <component :is="current" />
</template>
```

`:is` bir bileşen nesnesi alır, asla isim almaz. Çünkü global bir kayıt yoktur ([VIBE2006](https://vibejs.org/v0/errors/VIBE2006), [VIBE5207](https://vibejs.org/v0/errors/VIBE5207)). Bileşeni bir `shallowRef` içinde tut. `shallowRef` onu reaktif yapmaz.
