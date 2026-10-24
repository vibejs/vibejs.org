# صياغة القوالب

القالب HTML فيه تعبيرات وتوجيهات (directives). يقرأ التعبير متغيرات `<script setup>` واستيراداته، والخصائص (props)، و`$attrs` و`$slots` و`$emit` و`$props`، وتُفك فيه قيم refs. وأي اسم ليس واحدًا من هذه يُبلَّغ عنه بالرمز [VIBE2007](https://vibejs.org/v0/errors/VIBE2007) عند ترجمة الملف.

## النص {#text}

يعرض `{{ expression }}` نصًا. لا يُعرض شيء للقيمتين `null` و`undefined`، وتُعرض المصفوفات والكائنات العادية بصيغة JSON.

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

يضبط `v-text="value"` المحتوى النصي للعنصر، ويضبط `v-html="value"` محتوى HTML الداخلي. يعرض `v-html` النص على أنه HTML، فلا تمرّر إليه إلا محتوى تثق به.

## السمات {#attributes}

يربط `:name="expression"`، وهو اختصار `v-bind:name`، سمةً أو خاصية DOM. القيمتان `null` و`undefined` تحذفان السمة، و`false` تحذف السمة المنطقية مثل `disabled`. ويوزّع `v-bind="object"` كل مفاتيح الكائن.

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

المعدِّل `.prop` يضبط دائمًا خاصية DOM، و`.attr` يضبط دائمًا سمة، و`.camel` يحوّل الاسم إلى camelCase.

## الأصناف والأنماط {#class-and-style}

يقبل `:class` نصًا، أو كائنًا تُضاف مفاتيحه حين تكون قيمها truthy، أو مصفوفة منهما. ويقبل `:style` نصًا، أو كائنًا من خصائص CSS بصيغة camelCase أو kebab-case، أو مصفوفة. تعمل خصائص CSS المخصّصة (`--name`) و`!important` في الصيغتين. ويُدمج `class` أو `style` الثابت مع المربوط.

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

## الأحداث {#events}

يضيف `@event="handler"`، وهو اختصار `v-on:event`، مستمعًا. القيمة دالة، أو تعليمة تعمل عند وقوع الحدث، و`$event` فيها هو الحدث.

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

- المعدِّلات: `.stop` و`.prevent` تستدعيان `stopPropagation()` و`preventDefault()`. و`.self` يتجاهل الأحداث القادمة من الأبناء. و`.once` و`.capture` و`.passive` خيارات للمستمع. و`.ctrl` و`.alt` و`.shift` و`.meta` تشترط ضغط المفتاح. و`.exact` يشترط المفاتيح المذكورة بالضبط. و`.left` و`.middle` و`.right` تحدّد زر الفأرة.
- في `keydown` و`keyup` و`keypress`، تسمّي المعدِّلات الأخرى المفاتيح بصيغة kebab-case: `.enter` و`.esc` و`.page-down`.
- يُربط كل مستمع بعنصره هو عبر `addEventListener`، ولا تُفوَّض الأحداث إلى سلف مشترك. `event.currentTarget` هو العنصر نفسه، و`.stop` في المعالج يمنع الحدث من الوصول إلى مستمعي الأسلاف.
- اسم الحدث ثابت ([VIBE2303](https://vibejs.org/v0/errors/VIBE2303))، ولكل حدث سمة واحدة ([VIBE2302](https://vibejs.org/v0/errors/VIBE2302)).

## الشروط {#conditions}

تعرض `v-if` و`v-else-if` و`v-else` فرعًا واحدًا من عدة فروع. الفرع الذي يُحذف يُفك: تشغّل مكوّناته خطّافات الفك، وتضيع حالته. ويجمع `<template v-if>` عدة عناصر دون عنصر مغلِّف.

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

## القوائم {#lists}

يعرض `v-for` عنصرًا لكل عنصر في مصفوفة، أو في كائن قابل للتكرار مثل `Map` أو `Set`، أو لكل رقم من 1 إلى `n`، أو لكل قيمة في كائن. كل عنصر داخل `v-for` يحتاج إلى `:key` فريد وثابت ([VIBE2203](https://vibejs.org/v0/errors/VIBE2203))، إلا النطاق الرقمي فلا يحتاج إليه.

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

حين تتغيّر القائمة، تحتفظ العناصر ذات المفتاح نفسه بعقدها وحالتها، ويُنقل أقل عدد ممكن من العقد. ولا يجتمع `v-if` و`v-for` على عنصر واحد ([VIBE2103](https://vibejs.org/v0/errors/VIBE2103)). صفِّ القائمة في `computed` بدلًا من ذلك.

## v-show {#v-show}

يضبط `v-show="condition"` القيمة `display: none` ما دام الشرط false، ويبقي العنصر في DOM. استخدمه للمحتوى الذي يظهر ويختفي كثيرًا، واستخدم `v-if` للمحتوى الذي نادرًا ما يظهر. لا يُطبَّق إلا على العناصر، لا على المكوّنات ولا على `<template>`.

## v-model على العناصر {#v-model-on-elements}

يربط `v-model` عنصر نموذج بـ ref في الاتجاهين.

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

- حقول النص و`<textarea>` تتحدّث عند `input`. و`.lazy` يجعلها تتحدّث عند `change` بدلًا من ذلك، و`.trim` يقصّ المسافات من القيمة، و`.number` يحوّلها إلى رقم (و`<input type="number">` يفعل ذلك دائمًا). وأثناء تركيب النص بمحرّر إدخال (input method)، يتحدّث النموذج عند انتهاء التركيب.
- مربع الاختيار يربط قيمة منطقية، أو يضيف `value` الخاص به إلى مصفوفة أو `Set` ويحذفه منها. وتحلّ `true-value` و`false-value` محلّ `true` و`false`.
- زر الراديو يضبط النموذج على `value` الخاص به.
- يربط `<select>` قيمة الخيار المحدّد، ويربط `<select multiple>` مصفوفة من القيم.

و[المكوّنات](https://vibejs.org/v0/ui/components#v-model) تقبل `v-model` أيضًا.

## مراجع القالب {#template-refs}

السمة `ref="name"` على عنصر تملأ مرجع القالب الذي يعرّفه السكربت بـ `useTemplateRef('name')`. قيمته `null` قبل أن يُعرض العنصر، وبعد حذفه أيضًا. وداخل `v-for` تكون قيمته مصفوفة من العناصر.

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

المرجع النصي الذي لا يقابله `useTemplateRef()` يُبلَّغ عنه بالرمز [VIBE2701](https://vibejs.org/v0/errors/VIBE2701). والمرجع المربوط `:ref="(el) => ..."` يستدعي الدالة مع العنصر، ثم مع `null` عند حذفه. والمرجع على مكوّن يعطيك القيم التي [يكشفها](https://vibejs.org/v0/ui/components#exposing-values) ذلك المكوّن.

## المكوّنات الديناميكية {#dynamic-components}

يعرض `<component :is="value">` المكوّن الموجود في `value`، ولا يعرض شيئًا مع `null` أو `undefined`. وتغيير القيمة يفك المكوّن السابق.

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

يقبل `:is` كائن مكوّن، لا اسمًا أبدًا، فلا يوجد سجلّ عام للمكوّنات ([VIBE2006](https://vibejs.org/v0/errors/VIBE2006)، [VIBE5207](https://vibejs.org/v0/errors/VIBE5207)). احفظ المكوّن في `shallowRef`، فهو لا يجعله تفاعليًا.
