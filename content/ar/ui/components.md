# المكوّنات

المكوّن هو ملف `.vibe`. يُستورد تصديره الافتراضي في المكان الذي يُستخدم فيه، وتُكتب علامته بنمط PascalCase. لا توجد مكوّنات مسجّلة بشكل عام.

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

العلامة بنمط kebab-case مثل `<todo-item>` تُعدّ عنصرًا وليست مكوّنًا ([VIBE2002](https://vibejs.org/v0/errors/VIBE2002))، والعلامة التي لا تطابق أي استيراد يُبلَّغ عنها بالرمز [VIBE2001](https://vibejs.org/v0/errors/VIBE2001).

الماكرو التالية تصرّح بواجهة المكوّن. وهي متاحة داخل `<script setup lang="ts">` دون استيراد، وتأخذ تصريحاتها كوسائط نوعية، ولذلك يُفحص قالب المكوّن الأب مقابلها.

## الخصائص (Props) {#props}

يصرّح `defineProps<Props>()` بالخصائص. يمنح تفكيك النتيجة كل خاصية اسمًا محليًا، وتُطبَّق القيمة الافتراضية بعد `=` عندما يمرّر المكوّن الأب القيمة `undefined` أو لا يمرّر شيئًا.

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

- الخصائص للقراءة فقط: إسناد قيمة إلى إحداها يُبلَّغ عنه بالرمز [VIBE3106](https://vibejs.org/v0/errors/VIBE3106). استخدم [نموذجًا (model)](#v-model) أو أطلق حدثًا لتغيير قيمة في المكوّن الأب.
- الخاصية المنطقية الاختيارية التي لا يمرّرها المكوّن الأب قيمتها `undefined`، والسمة بلا قيمة كما في `<TodoItem done />` تمرّر `true`.
- القيمة الافتراضية إما قيمة حرفية أو تقرأ من الاستيرادات؛ ولا يمكنها قراءة ارتباطات السكربت ([VIBE3105](https://vibejs.org/v0/errors/VIBE3105)). تُنشأ القيمة الافتراضية من نوع كائن أو مصفوفة لكل نسخة على حدة.
- بدون التفكيك، يعطي `const props = defineProps<Props>()` كائنًا، ويقرأ `props.title` خاصية منه.

### قراءة الخصائص {#reading-props}

الخاصية المفكَّكة ليست نسخة: كل قراءة تستدعي المكوّن الأب وتقيّم التعبير الذي ربطه، ولذلك ترى دائمًا القيمة الحالية. ضع أي اشتقاق مكلف داخل `computed`، كما في `label` أعلاه، ليعمل فقط عندما تتغير مدخلاته. ولتمرير خاصية إلى دالة تتتبّع وسيطها، مثل `watch` أو `toRef`، مرّر دالة getter: `watch(() => title, ...)` ([VIBE3107](https://vibejs.org/v0/errors/VIBE3107)).

## الأحداث {#events}

يصرّح `defineEmits<Events>()` بالأحداث على شكل سجل مفاتيحه أسماء الأحداث وقيمه صفوف (tuples) الحمولة. وتطلقها الدالة المُعادة.

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

يستمع المكوّن الأب بالصيغة `@remove="handler"`. يتلقى المعالج الحمولة وليس حدث DOM، ولذلك لا تنطبق مُعدِّلات الأحداث على أحداث المكوّنات ([VIBE2305](https://vibejs.org/v0/errors/VIBE2305)). إطلاق حدث غير مصرَّح به يُصدر تحذيرًا VIBE5202 أثناء التطوير.

## الفتحات (Slots) {#slots}

يعرض المكوّن محتوى قادمًا من المكوّن الأب في المكان الذي يضع فيه `<slot>`. الفتحات المسمّاة تأخذ `name`، وتُمرَّر السمات الموضوعة على `<slot>` إلى المكوّن الأب بوصفها slot props. يصرّح `defineSlots<Slots>()` بالفتحات وخصائصها.

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

يمرّر المكوّن الأب محتوى الفتحة عبر `<template #name>` ويستقبل خصائص الفتحة عبر `#name="props"`. المحتوى الواقع خارج القوالب المسمّاة هو الفتحة الافتراضية.

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

أسماء الفتحات ثابتة ([VIBE2605](https://vibejs.org/v0/errors/VIBE2605))؛ وللاختيار بين الفتحات ضع `v-if` على قوالب الفتحات.

### المحتوى الاحتياطي {#fallback-content}

تُعرض العناصر الأبناء داخل `<slot>` عندما لا يمرّر المكوّن الأب أي محتوى لتلك الفتحة. أما الفتحة التي يمرّرها المكوّن الأب فتعرض محتواه، حتى لو لم يعرض هذا المحتوى شيئًا، كأن يكون `v-if` خاطئًا. وللحصول على المحتوى الاحتياطي في هذه الحالة، ضع الشرط على `<template #name>` نفسه، فلا تُمرَّر الفتحة.

### الفتحات في السكربت {#slots-in-script}

تعيد `useSlots()` الفتحات التي استقبلها المكوّن، ويقرؤها `$slots` في القالب. استخدمهما لمعرفة ما إذا مُرّرت فتحة، كما في `v-if="$slots.header"`. استدعاء دالة الفتحة يعرض محتواها وينشئ عُقد DOM الخاصة بها، ولذلك تُستدعى الفتحة بواسطة `<slot>` فقط، وليس لفحص ما تحتويه.

## v-model {#v-model}

يصرّح `defineModel()` بقيمة ثنائية الاتجاه. قراءة المرجع المُعاد تقرأ الخاصية، وإسناد قيمة إليه يطلق حدث التحديث إلى المكوّن الأب.

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

يربط المكوّن الأب النموذج الافتراضي بالصيغة `v-model="text"` والنموذج المسمّى بالصيغة `v-model:open="visible"`. `v-model` هو الخاصية `modelValue` مضافًا إليها الحدث `onUpdate:modelValue`، و`v-model:open` هو `open` مضافًا إليه `onUpdate:open`. وبدون `required` أو `default`، يتضمن نوع النموذج القيمة `undefined`. والنموذج الذي لا يربط به المكوّن الأب شيئًا يحتفظ بقيمة محلية.

## السمات {#attributes}

السمات والمستمعات التي يمرّرها المكوّن الأب ولا يصرّح بها المكوّن كخصائص أو أحداث هي سماته (attributes). عندما يعرض المكوّن عنصرًا جذريًا واحدًا، تُضاف إليه: يُدمج `class` و`style` مع ما للجذر، وتُضاف المستمعات بجانب مستمعات الجذر. وعندما يكون الجذر مكوّنًا آخر، تنتقل إلى ذلك المكوّن.

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

يُبقي `defineOptions({ inheritAttrs: false })` السمات بعيدًا عن الجذر، ليتمكّن `v-bind="$attrs"` من وضعها على عنصر آخر. وتعيدها `useAttrs()` في السكربت. المكوّن ذو الجذور المتعددة لا يستقبل السمات، ويُصدر تحذيرًا VIBE5201 أثناء التطوير عند تمرير سمات إليه.

## كشف القيم {#exposing-values}

المرجع القالبي (template ref) على مكوّن يحمل القيم التي يمرّرها المكوّن إلى `defineExpose()`، مع فك تغليف المراجع. لا يمكن الوصول إلى أي شيء آخر من المكوّن: لا خصائصه ولا ارتباطاته الأخرى ولا عناصره.

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

نوع المرجع هو الكائن المكشوف لـ `SearchField`، ولذلك يُفحص `search.value?.focus()`. والمكوّن الذي لا يستدعي `defineExpose()` يكشف كائنًا فارغًا.
