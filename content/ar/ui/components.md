# المكوّنات

المكوّن ملف `.vibe`. تستورد تصديره الافتراضي حيث تحتاج إليه، وتكتب وسمه بصيغة PascalCase. لا توجد مكوّنات مسجّلة على مستوى التطبيق كله.

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

الوسم المكتوب بصيغة kebab-case، مثل `<todo-item>`، عنصر HTML وليس مكوّنًا ([VIBE2002](https://vibejs.org/v0/errors/VIBE2002)). والوسم الذي لا يطابق أي استيراد يُبلَّغ عنه بالرمز [VIBE2001](https://vibejs.org/v0/errors/VIBE2001).

وحدات الماكرو التالية تعرّف واجهة المكوّن. تستخدمها في `<script setup lang="ts">` دون استيراد، وتكتب التعريفات فيها وسائطَ أنواع (type arguments)، فيتحقق المترجم من قالب المكوّن الأب على أساسها.

## الخصائص (props) {#props}

تعرّف `defineProps<Props>()` الخصائص. إذا فككت النتيجة، صار لكل خاصية اسم محلي. والقيمة الافتراضية بعد `=` تُستخدم حين يمرّر الأب `undefined` أو لا يمرّر شيئًا.

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

- الخصائص للقراءة فقط، والإسناد إليها يُبلَّغ عنه بالرمز [VIBE3106](https://vibejs.org/v0/errors/VIBE3106). لتغيير قيمة عند الأب، استخدم [نموذجًا](#v-model) أو أطلق حدثًا.
- الخاصية المنطقية الاختيارية التي لا يمرّرها الأب قيمتها `undefined`. والسمة التي بلا قيمة، كما في `<TodoItem done />`، تمرّر `true`.
- القيمة الافتراضية قيمة حرفية أو تقرأ من الاستيرادات، ولا تستطيع قراءة متغيرات السكربت ([VIBE3105](https://vibejs.org/v0/errors/VIBE3105)). وإذا كانت كائنًا أو مصفوفة، تُنشأ نسخة منها لكل نسخة من المكوّن.
- دون التفكيك، تعطيك `const props = defineProps<Props>()` كائنًا، وتقرأ الخاصية بـ `props.title`.

### قراءة الخصائص {#reading-props}

الخاصية المفكوكة ليست نسخة من القيمة. كل قراءة لها تعود إلى الأب وتحسب التعبير الذي ربطه، فترى دائمًا القيمة الحالية. ضع الاشتقاق المكلف في `computed`، مثل `label` في المثال أعلاه، حتى لا يعمل إلا عند تغيّر مدخلاته. وإذا أردت تمرير خاصية إلى دالة تتتبّع وسيطها، مثل `watch` أو `toRef`، فمرّر دالة جلب: `watch(() => title, ...)` ([VIBE3107](https://vibejs.org/v0/errors/VIBE3107)).

## الأحداث {#events}

تعرّف `defineEmits<Events>()` الأحداث في سجلّ: مفاتيحه أسماء الأحداث، وقيمه صفوف (tuples) بالبيانات المرسلة. والدالة التي تعيدها تطلق هذه الأحداث.

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

يستمع الأب بـ `@remove="handler"`. يستقبل المعالج البيانات المرسلة، لا حدث DOM، لذلك لا تنطبق معدِّلات الأحداث على أحداث المكوّنات ([VIBE2305](https://vibejs.org/v0/errors/VIBE2305)). وإذا أطلقت حدثًا غير معرَّف، يظهر التحذير VIBE5202 أثناء التطوير.

## Slots {#slots}

يعرض المكوّن محتوى من أبيه في المكان الذي يضع فيه `<slot>`. للـ slot المسمّى سمة `name`، والسمات الموضوعة على `<slot>` تصل إلى الأب خصائصَ للـ slot. وتعرّف `defineSlots<Slots>()` الـ slots وخصائصها.

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

يمرّر الأب محتوى الـ slot بـ `<template #name>`، ويستقبل خصائصه بـ `#name="props"`. وكل محتوى خارج القوالب المسمّاة يذهب إلى الـ slot الافتراضي.

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

أسماء الـ slots ثابتة ([VIBE2605](https://vibejs.org/v0/errors/VIBE2605)). للاختيار بين slots، ضع `v-if` على قوالبها.

### المحتوى الاحتياطي {#fallback-content}

يُعرض ما بداخل `<slot>` حين لا يمرّر الأب محتوى لهذا الـ slot. أما إذا مرّره، فيُعرض محتوى الأب حتى لو لم يعرض شيئًا، كمحتوى عليه `v-if` قيمته false. لإظهار المحتوى الاحتياطي في هذه الحالة، ضع الشرط على `<template #name>` نفسه، فلا يُمرَّر الـ slot أصلًا.

### الـ slots في السكربت {#slots-in-script}

تعيد `useSlots()` الـ slots التي استقبلها المكوّن، وتقرؤها في القالب بـ `$slots`. استخدمها لتعرف هل مُرّر slot ما، كما في `v-if="$slots.header"`. استدعاء دالة الـ slot يعرض محتواه وينشئ عُقد DOM الخاصة به، لذلك اترك استدعاءها لـ `<slot>`، ولا تستدعها لتفحص ما فيها.

## v-model {#v-model}

تعرّف `defineModel()` قيمة ثنائية الاتجاه. قراءة الـ ref المعاد تقرأ الخاصية، والإسناد إليه يرسل حدث التحديث إلى الأب.

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

يربط الأب النموذج الافتراضي بـ `v-model="text"`، والنموذج المسمّى بـ `v-model:open="visible"`. `v-model` هو الخاصية `modelValue` مع الحدث `onUpdate:modelValue`، و`v-model:open` هو `open` مع `onUpdate:open`. إن لم تحدّد `required` أو `default`، يشمل نوع النموذج `undefined`. وإذا لم يربط الأب شيئًا، يحتفظ النموذج بقيمة محلية.

## السمات {#attributes}

إذا مرّر الأب سمات أو مستمعين لم يعرّفها المكوّن خصائصَ أو أحداثًا، فهذه هي سمات المكوّن. إذا كان المكوّن يعرض عنصرًا جذرًا واحدًا، تُضاف إليه: يُدمج `class` و`style` مع ما في الجذر، ويُضاف المستمعون إلى جانب مستمعيه. وإذا كان الجذر مكوّنًا آخر، تنتقل إليه.

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

يمنع `defineOptions({ inheritAttrs: false })` وضع السمات على الجذر، فتستطيع أن تضعها على عنصر آخر بـ `v-bind="$attrs"`. وتعيدها `useAttrs()` في السكربت. المكوّن ذو العناصر الجذرية المتعددة لا يستقبل سمات، وإذا مُرّرت إليه يظهر التحذير VIBE5201 أثناء التطوير.

## كشف القيم {#exposing-values}

إذا وضعت مرجع قالب على مكوّن، فإنه يحمل القيم التي يمرّرها المكوّن إلى `defineExpose()`، مع فكّ الـ refs. لا تصل إلى أي شيء آخر في المكوّن: لا خصائصه، ولا متغيراته الأخرى، ولا عناصره.

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

نوع الـ ref هو الكائن الذي يكشفه `SearchField`، لذلك يُتحقق من `search.value?.focus()`. والمكوّن الذي لا يستدعي `defineExpose()` يكشف كائنًا فارغًا.
