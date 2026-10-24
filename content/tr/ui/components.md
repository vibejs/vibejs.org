# Bileşenler

Her bileşen bir `.vibe` dosyasıdır. Kullanacağın yerde dosyanın default export'unu import edersin ve etiketini PascalCase yazarsın. Global olarak kaydedilen bileşen yoktur.

```vibe
<script setup lang="ts">
import TodoItem from './TodoItem.vibe';
</script>

<template>
  <ul>
    <TodoItem title="Write docs" />
  </ul>
</template>
```

`<todo-item>` gibi kebab-case bir etiket bileşen değil, HTML elemanı sayılır ([VIBE2002](https://vibejs.org/v0/errors/VIBE2002)). Hiçbir import'a karşılık gelmeyen bir etiket yazarsan [VIBE2001](https://vibejs.org/v0/errors/VIBE2001) hatasını alırsın.

Aşağıdaki makrolar bileşenin dışarıya açtığı arayüzü tanımlar. `<script setup lang="ts">` içinde import etmeden kullanırsın. Tanımları tip argümanı olarak alırlar, bu yüzden üst bileşenin şablonu da bunlara göre tip denetiminden geçer.

## Prop'lar {#props}

Prop'ları `defineProps<Props>()` ile tanımlarsın. Sonucu destructure edersen her prop yerel bir isim alır. `=` işaretinden sonra yazdığın varsayılan değer, üst bileşen `undefined` geçtiğinde ya da hiçbir şey geçmediğinde devreye girer.

```vibe [TodoItem.vibe]
<script setup lang="ts">
import { computed } from '@usevibejs/ui';

const { title, done = false, tags = [] } = defineProps<{
  title: string;
  done?: boolean;
  tags?: string[];
}>();

const label = computed(() => `${title} (${tags.length} tags)`);
</script>

<template>
  <li :class="{ done }">{{ label }}</li>
</template>
```

- Prop'lar salt okunurdur: birine değer atarsan [VIBE3106](https://vibejs.org/v0/errors/VIBE3106) hatası alırsın. Üst bileşendeki bir değeri değiştirmek istiyorsan bir [model](#v-model) kullan ya da event yay.
- Opsiyonel bir boolean prop'u üst bileşen geçmezse değeri `undefined` olur. `<TodoItem done />` örneğindeki gibi değersiz bir attribute ise `true` geçer.
- Varsayılan değer ya bir literal olur ya da import'ları okur. Script'teki değişkenleri okuyamaz ([VIBE3105](https://vibejs.org/v0/errors/VIBE3105)). Varsayılanı bir nesne ya da dizi ise her örnek için yenisi oluşur.
- Destructure etmezsen `const props = defineProps<Props>()` sana bir nesne verir ve prop'u `props.title` ile okursun.

### Prop'ları okumak {#reading-props}

Destructure ettiğin prop bir kopya değildir. Her okumada üst bileşene gider ve oradaki bağlı ifadeyi yeniden hesaplar, yani her zaman güncel değeri görür. Pahalı bir türetme yapıyorsan onu yukarıdaki `label` gibi bir `computed` içine koy. Böylece sadece girdileri değişince çalışır. Bir prop'u argümanını takip eden bir fonksiyona, örneğin `watch` ya da `toRef`'e vereceksen getter olarak ver: `watch(() => title, ...)` ([VIBE3107](https://vibejs.org/v0/errors/VIBE3107)).

## Event'ler {#events}

Event'leri `defineEmits<Events>()` ile tanımlarsın. Bu bir kayıt tipidir: anahtarlar event isimleri, değerler de payload tuple'larıdır. Dönen fonksiyonla event'leri yayarsın.

```vibe
<script setup lang="ts">
const { id } = defineProps<{ id: number }>();
const emit = defineEmits<{
  remove: [id: number];
  rename: [id: number, title: string];
}>();
</script>

<template>
  <button type="button" @click="emit('remove', id)">Remove</button>
  <button type="button" @click="emit('rename', id, 'Untitled')">Reset title</button>
</template>
```

Üst bileşen `@remove="handler"` ile dinler. Handler'a DOM event'i değil payload gelir. Bu yüzden event modifier'ları bileşen event'lerinde çalışmaz ([VIBE2305](https://vibejs.org/v0/errors/VIBE2305)). Tanımlamadığın bir event'i yayarsan geliştirme sırasında VIBE5202 uyarısını görürsün.

## Slot'lar {#slots}

Bileşen, `<slot>` koyduğu yere üst bileşenden gelen içeriği basar. İsimli slot'lar bir `name` alır. `<slot>` üzerine yazdığın attribute'lar üst bileşene slot prop'u olarak gider. Slot'ları ve prop'larını `defineSlots<Slots>()` ile tanımlarsın.

```vibe [ItemList.vibe]
<script setup lang="ts">
defineSlots<{
  default?: (props: { item: string; index: number }) => unknown;
  header?: (props: {}) => unknown;
}>();

const { items } = defineProps<{ items: string[] }>();
</script>

<template>
  <section>
    <header><slot name="header">Items</slot></header>
    <ul>
      <li v-for="(item, index) in items" :key="item">
        <slot :item="item" :index="index">{{ item }}</slot>
      </li>
    </ul>
  </section>
</template>
```

Üst bileşen slot içeriğini `<template #name>` ile geçer, slot prop'larını da `#name="props"` ile alır. İsimli şablonların dışında kalan içerik default slot olur.

```vibe
<script setup lang="ts">
import ItemList from './ItemList.vibe';
</script>

<template>
  <ItemList :items="['a', 'b']">
    <template #header>Letters</template>
    <template #default="{ item, index }">{{ index }}: {{ item.toUpperCase() }}</template>
  </ItemList>
</template>
```

Slot isimleri sabittir ([VIBE2605](https://vibejs.org/v0/errors/VIBE2605)). Slot'lar arasında seçim yapmak istiyorsan slot şablonlarına `v-if` koy.

### Yedek içerik {#fallback-content}

Üst bileşen bir slot için içerik geçmezse `<slot>` etiketinin çocukları görünür. Üst bileşen slot'u geçtiyse, o içerik hiçbir şey çizmese bile (örneğin `v-if` false ise) onun içeriği kullanılır. Bu durumda da yedek içeriği göstermek istiyorsan koşulu doğrudan `<template #name>` üzerine yaz. O zaman slot hiç geçilmez.

### Script içinde slot'lar {#slots-in-script}

`useSlots()` bileşene gelen slot'ları döner. Şablonda aynı şeyi `$slots` ile okursun. Bir slot'un geçilip geçilmediğine bakmak için bunları kullan: `v-if="$slots.header"`. Bir slot fonksiyonunu çağırmak içeriğini çizer ve DOM düğümlerini oluşturur. Bu yüzden slot'u sadece `<slot>` çağırır. İçinde ne olduğuna bakmak için slot'u çağırma.

## v-model {#v-model}

İki yönlü bir değeri `defineModel()` ile tanımlarsın. Dönen ref'i okuduğunda prop'u okursun, ona değer atadığında da üst bileşene update event'i gider.

```vibe
<script setup lang="ts">
const text = defineModel<string>({ required: true });
const open = defineModel<boolean>('open', { default: () => false });
</script>

<template>
  <input v-model="text" />
  <button type="button" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</button>
</template>
```

Üst bileşen default model'i `v-model="text"` ile, isimli bir model'i de `v-model:open="visible"` ile bağlar. `v-model` aslında `modelValue` prop'u ile `onUpdate:modelValue` event'inin birleşimidir. `v-model:open` da `open` ile `onUpdate:open` demektir. `required` ya da `default` vermezsen model'in tipi `undefined` içerir. Üst bileşen hiçbir şey bağlamazsa model değeri yerelde tutar.

## Attribute'lar {#attributes}

Üst bileşenin geçtiği ama bileşenin prop ya da event olarak tanımlamadığı attribute ve listener'lar, bileşenin attribute'ları olur. Bileşen tek bir kök eleman çiziyorsa bunlar o elemana eklenir. `class` ve `style` kökün kendi değerleriyle birleşir, listener'lar da kökün kendi listener'larının yanına eklenir. Kök başka bir bileşense attribute'lar o bileşene aktarılır.

```vibe
<script setup lang="ts">
import { useAttrs } from '@usevibejs/ui';

defineOptions({ inheritAttrs: false });
const { label } = defineProps<{ label: string }>();
const attrs = useAttrs();
console.log(Object.keys(attrs));
</script>

<template>
  <label>
    {{ label }}
    <input v-bind="$attrs" />
  </label>
</template>
```

`defineOptions({ inheritAttrs: false })` yazarsan attribute'lar köke eklenmez. Sonra `v-bind="$attrs"` ile onları istediğin elemana koyarsın. Script içinde `useAttrs()` ile alırsın. Birden fazla kök elemanı olan bileşen attribute almaz. Ona attribute geçersen geliştirme sırasında VIBE5201 uyarısını görürsün.

## Değerleri dışarı açmak {#exposing-values}

Bir bileşene bağladığın template ref, o bileşenin `defineExpose()` ile verdiği değerleri tutar. Ref'ler burada açılmış hâlde gelir. Bileşenin geri kalanına erişemezsin: ne prop'larına, ne diğer değişkenlerine, ne de elemanlarına.

```vibe [SearchField.vibe]
<script setup lang="ts">
import { ref, useTemplateRef } from '@usevibejs/ui';

const field = useTemplateRef<HTMLInputElement>('field');
const text = ref('');

defineExpose({
  focus: () => field.value?.focus(),
  clear: () => (text.value = ''),
});
</script>

<template>
  <input ref="field" v-model="text" />
</template>
```

```vibe
<script setup lang="ts">
import { onMounted, useTemplateRef } from '@usevibejs/ui';
import SearchField from './SearchField.vibe';

const search = useTemplateRef('search');
onMounted(() => search.value?.focus());
</script>

<template>
  <SearchField ref="search" />
</template>
```

Ref'in tipi `SearchField` bileşeninin dışarı açtığı nesnedir, yani `search.value?.focus()` da tip denetiminden geçer. `defineExpose()` çağırmayan bir bileşen boş bir nesne açar.
