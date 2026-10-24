# Template sözdizimi

Template, ifadeler ve direktiflerle zenginleştirilmiş HTML'dir. Bir ifade; `<script setup>` içindeki bağlamaları ve içe aktarımları, props'ları, ayrıca `$attrs`, `$slots`, `$emit` ve `$props` değerlerini okur; ref'ler açılır. Bunlardan hiçbiri olmayan bir ad, dosya derlenirken [VIBE2007](https://vibejs.org/v0/errors/VIBE2007) olarak bildirilir.

## Metin {#text}

`{{ expression }}` metin render eder. `null` ve `undefined` hiçbir şey render etmez; diziler ve düz nesneler JSON olarak render edilir.

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

`v-text="value"` bir elemanın metin içeriğini, `v-html="value"` ise iç HTML'ini ayarlar. `v-html` string'i HTML olarak render eder: ona yalnızca güvendiğiniz içeriği verin.

## Öznitelikler {#attributes}

`v-bind:name` kısaltması olan `:name="expression"`, bir özniteliği ya da DOM özelliğini bağlar. `null` ve `undefined` özniteliği kaldırır; `false` ise `disabled` gibi boolean bir özniteliği kaldırır. `v-bind="object"` bir nesnenin tüm anahtarlarını yayar (spread).

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

`.prop` değiştiricisi her zaman bir DOM özelliği, `.attr` her zaman bir öznitelik ayarlar; `.camel` adı camelCase'e çevirir.

## Class ve style {#class-and-style}

`:class` bir string, değeri doğru (truthy) olduğunda anahtarları eklenen bir nesne ya da bunlardan oluşan bir dizi alır. `:style` bir string, camelCase ya da kebab-case yazılmış CSS özelliklerinden oluşan bir nesne ya da bir dizi alır. CSS özel özellikleri (`--name`) ve `!important` her iki biçimde de çalışır. Statik bir `class` veya `style` ile bağlanmış olan birleştirilir.

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

## Olaylar {#events}

`v-on:event` kısaltması olan `@event="handler"` bir dinleyici ekler. Değer bir fonksiyon ya da olay tetiklendiğinde çalışan bir ifadedir; ifadede `$event` olaydır.

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

- Değiştiriciler (modifier): `.stop` ve `.prevent` sırasıyla `stopPropagation()` ve `preventDefault()` çağırır, `.self` çocuklardan gelen olayları yok sayar, `.once`, `.capture` ve `.passive` dinleyici seçenekleridir, `.ctrl`, `.alt`, `.shift` ve `.meta` ilgili tuşu gerektirir, `.exact` yalnızca listelenen tuşları gerektirir, `.left`, `.middle` ve `.right` fare düğmesini seçer.
- `keydown`, `keyup` ve `keypress` olaylarında diğer değiştiriciler tuşları kebab-case ile adlandırır: `.enter`, `.esc`, `.page-down`.
- Her dinleyici `addEventListener` ile kendi elemanına eklenir; olaylar ortak bir ataya devredilmez (delegate edilmez). `event.currentTarget` o elemandır ve bir handler'daki `.stop`, olayın atalardaki dinleyicilere ulaşmasını engeller.
- Olay adı statiktir ([VIBE2303](https://vibejs.org/v0/errors/VIBE2303)) ve her olay için tek bir öznitelik vardır ([VIBE2302](https://vibejs.org/v0/errors/VIBE2302)).

## Koşullar {#conditions}

`v-if`, `v-else-if` ve `v-else` birkaç daldan birini render eder. Kaldırılan dal unmount edilir: bileşenleri unmount hook'larını çalıştırır ve durumları kaybolur. `<template v-if>` birkaç elemanı sarmalayıcı olmadan gruplar.

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

`v-for`; bir dizinin, `Map` ya da `Set` gibi bir iterable'ın her öğesi, 1'den `n`'e kadar sayılar ya da bir nesnenin değerleri için bir eleman render eder. Bir `v-for` içindeki her eleman benzersiz ve kararlı bir `:key` ister ([VIBE2203](https://vibejs.org/v0/errors/VIBE2203)); yalnızca sayısal aralık buna ihtiyaç duymaz.

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

Liste değiştiğinde aynı anahtara sahip öğeler elemanlarını ve durumlarını korur ve en az sayıda eleman taşınır. `v-if` ve `v-for` aynı elemanı paylaşamaz ([VIBE2103](https://vibejs.org/v0/errors/VIBE2103)): bunun yerine listeyi bir `computed` içinde filtreleyin.

## v-show {#v-show}

`v-show="condition"`, koşul false iken `display: none` ayarlar ve elemanı DOM'da tutar. Sık açılıp kapanan içerik için kullanın; nadiren gösterilen içerik için `v-if` kullanın. Yalnızca elemanlara uygulanır; bileşenlere ya da `<template>` öğesine uygulanmaz.

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

- Metin girdileri ve `<textarea>` `input` olayında güncellenir. `.lazy` bunun yerine `change` olayında günceller, `.trim` değeri kırpar, `.number` değeri sayıya çevirir (`<input type="number">` bunu her zaman yapar). Bir giriş yöntemi (IME) metin oluştururken model, oluşturma bittiğinde güncellenir.
- Bir checkbox bir boolean bağlar ya da `value` değerini bir dizi veya `Set` içine ekler ve çıkarır; `true-value` ve `false-value` `true` ile `false` yerine geçer.
- Bir radio düğmesi modeli kendi `value` değerine ayarlar.
- `<select>` seçili option'ın değerini bağlar; `<select multiple>` değerlerden oluşan bir dizi bağlar.

[Bileşenler](https://vibejs.org/v0/ui/components#v-model) de `v-model` alabilir.

## Template ref'leri {#template-refs}

Bir eleman üzerindeki `ref="name"`, script'in `useTemplateRef('name')` ile tanımladığı template ref'i doldurur. Değeri, eleman render edilene kadar ve kaldırıldıktan sonra tekrar `null` olur; `v-for` içinde elemanlardan oluşan bir dizidir.

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

Eşleşen bir `useTemplateRef()` olmayan string ref, [VIBE2701](https://vibejs.org/v0/errors/VIBE2701) olarak bildirilir. Bağlanmış bir `:ref="(el) => ..."`, fonksiyonu elemanla, eleman kaldırıldığında ise `null` ile çağırır. Bir bileşen üzerindeki ref, o bileşenin [dışa açtığı](https://vibejs.org/v0/ui/components#exposing-values) değerleri verir.

## Dinamik bileşenler {#dynamic-components}

`<component :is="value">`, `value` değerinin tuttuğu bileşeni render eder; `null` ya da `undefined` için hiçbir şey render etmez. Değeri değiştirmek önceki bileşeni unmount eder.

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

`:is` bir bileşen nesnesi alır, asla bir ad almaz: global kayıt defteri yoktur ([VIBE2006](https://vibejs.org/v0/errors/VIBE2006), [VIBE5207](https://vibejs.org/v0/errors/VIBE5207)). Bileşeni, onu reaktif yapmayan bir `shallowRef` içinde tutun.
