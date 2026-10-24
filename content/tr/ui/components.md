# Bileşenler

Bileşen, bir `.vibe` dosyasıdır. Varsayılan dışa aktarımı kullanıldığı yerde içe aktarılır ve etiketi PascalCase ile yazılır. Global olarak kaydedilen bileşen yoktur.

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

`<todo-item>` gibi kebab-case bir etiket bileşen değil, elemandır ([VIBE2002](https://vibejs.org/v0/errors/VIBE2002)). Hiçbir içe aktarıma karşılık gelmeyen bir etiket ise [VIBE2001](https://vibejs.org/v0/errors/VIBE2001) olarak bildirilir.

Aşağıdaki makrolar bir bileşenin arayüzünü tanımlar. `<script setup lang="ts">` içinde içe aktarma gerekmeden kullanılabilir ve bildirimlerini tür argümanı olarak alır; böylece üst bileşenin template'i bunlara karşı tür denetiminden geçer.

## Props {#props}

`defineProps<Props>()` props'ları tanımlar. Sonucu destructure etmek her prop'a yerel bir ad verir; `=` sonrasındaki varsayılan değer, üst bileşen `undefined` verdiğinde ya da hiçbir şey vermediğinde geçerli olur.

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

- Props salt okunurdur: birine atama yapmak [VIBE3106](https://vibejs.org/v0/errors/VIBE3106) olarak bildirilir. Üst bileşendeki bir değeri değiştirmek için bir [model](#v-model) kullanın ya da bir olay yayınlayın.
- Üst bileşenin geçmediği isteğe bağlı bir boolean prop `undefined` olur; değersiz bir öznitelik (`<TodoItem done />` gibi) ise `true` geçirir.
- Varsayılan değer bir sabit ya da içe aktarımları okuyan bir ifade olabilir; script'in bağlamalarını (binding) okuyamaz ([VIBE3105](https://vibejs.org/v0/errors/VIBE3105)). Nesne ya da dizi varsayılanı her örnek için ayrı oluşturulur.
- Destructure etmeden `const props = defineProps<Props>()` bir nesne verir ve `props.title` bir prop'u okur.

### Props'ları okumak {#reading-props}

Destructure edilmiş bir prop kopya değildir: her okuma üst bileşene çağrı yapar ve üst bileşenin bağladığı ifadeyi değerlendirir; dolayısıyla her zaman güncel değeri görür. Maliyetli bir türetimi, yukarıdaki `label` gibi bir `computed` içine koyun; böylece yalnızca girdileri değiştiğinde çalışır. Bir prop'u argümanını izleyen bir fonksiyona (`watch` ya da `toRef` gibi) geçirmek için getter verin: `watch(() => title, ...)` ([VIBE3107](https://vibejs.org/v0/errors/VIBE3107)).

## Olaylar {#events}

`defineEmits<Events>()` olayları, anahtarları olay adı, değerleri payload tuple'ı olan bir kayıt olarak tanımlar. Dönen fonksiyon bunları yayınlar.

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

Üst bileşen `@remove="handler"` ile dinler. Handler bir DOM olayı değil, payload'ı alır; bu yüzden olay değiştiricileri (modifier) bileşen olaylarına uygulanmaz ([VIBE2305](https://vibejs.org/v0/errors/VIBE2305)). Tanımlanmamış bir olay yayınlamak geliştirme sırasında VIBE5202 uyarısı verir.

## Slotlar {#slots}

Bir bileşen, `<slot>` yerleştirdiği yerde üst bileşenden gelen içeriği render eder. Adlandırılmış slotlar bir `name` alır ve `<slot>` üzerindeki öznitelikler slot props olarak üst bileşene aktarılır. `defineSlots<Slots>()` slotları ve props'larını tanımlar.

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

Üst bileşen slot içeriğini `<template #name>` ile geçirir ve slot props'larını `#name="props"` ile alır. Adlandırılmış template'lerin dışındaki içerik varsayılan slottur.

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

Slot adları statiktir ([VIBE2605](https://vibejs.org/v0/errors/VIBE2605)); slotlar arasında seçim yapmak için slot template'lerine `v-if` koyun.

### Yedek içerik {#fallback-content}

`<slot>` öğesinin çocukları, üst bileşen o slot için içerik geçmediğinde render edilir. Üst bileşenin geçtiği bir slot, içerik hiçbir şey render etmese bile (örneğin false olan bir `v-if`) üst bileşenin içeriğini render eder. Bu durumda yedek içeriği göstermek için koşulu doğrudan `<template #name>` üzerine koyun; böylece slot hiç geçirilmemiş olur.

### Script içinde slotlar {#slots-in-script}

`useSlots()` bileşenin aldığı slotları döndürür, `$slots` ise bunları template içinde okur. Bir slotun geçirilip geçirilmediğini `v-if="$slots.header"` gibi sınamak için kullanın. Bir slot fonksiyonunu çağırmak içeriğini render eder ve DOM düğümlerini oluşturur; bu yüzden slot yalnızca `<slot>` tarafından çağrılır, içeriğini incelemek için çağrılmaz.

## v-model {#v-model}

`defineModel()` çift yönlü bir değer tanımlar. Dönen ref'i okumak prop'u okur, ona atama yapmak ise güncelleme olayını üst bileşene yayınlar.

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

Üst bileşen varsayılan modeli `v-model="text"` ile, adlandırılmış olanı `v-model:open="visible"` ile bağlar. `v-model`, `modelValue` prop'u ile `onUpdate:modelValue` olayının birleşimidir; `v-model:open` ise `open` ile `onUpdate:open` birleşimidir. `required` ya da `default` olmadan modelin türü `undefined` içerir. Üst bileşenin hiçbir şey bağlamadığı bir model yerel bir değer tutar.

## Öznitelikler {#attributes}

Üst bileşenin geçtiği ancak bileşenin props ya da olay olarak tanımlamadığı öznitelikler ve dinleyiciler, bileşenin öznitelikleridir (attributes). Bileşen tek bir kök eleman render ettiğinde bunlar o elemana eklenir: `class` ve `style` kökün kendi değerleriyle birleştirilir, dinleyiciler de kökünkilerin yanına eklenir. Kök başka bir bileşense bunlar o bileşene aktarılır.

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

`defineOptions({ inheritAttrs: false })` öznitelikleri kökten uzak tutar; böylece `v-bind="$attrs"` onları başka bir elemana yerleştirebilir. `useAttrs()` bunları script içinde döndürür. Birden çok kök elemanı olan bir bileşen öznitelik almaz ve kendisine öznitelik geçirildiğinde geliştirme sırasında VIBE5201 uyarısı verir.

## Değerleri dışarı açmak {#exposing-values}

Bir bileşen üzerindeki template ref, bileşenin `defineExpose()` içine verdiği değerleri tutar; ref'ler açılmış (unwrapped) halde gelir. Bileşenin başka hiçbir şeyine erişilemez: ne props'larına, ne diğer bağlamalarına, ne de elemanlarına.

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

Ref'in türü `SearchField` bileşeninin dışa açılan nesnesidir; bu yüzden `search.value?.focus()` denetlenir. `defineExpose()` çağırmayan bir bileşen boş bir nesne açar.
