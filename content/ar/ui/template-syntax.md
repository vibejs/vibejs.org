# صيغة القالب

القالب هو HTML مع تعبيرات وتوجيهات (directives). يقرأ التعبير ارتباطات واستيرادات `<script setup>` والخصائص، و`$attrs` و`$slots` و`$emit` و`$props`؛ وتُفك تغليفات المراجع. الاسم الذي ليس أيًّا من هذه يُبلَّغ عنه بالرمز [VIBE2007](https://vibejs.org/v0/errors/VIBE2007) عند ترجمة الملف.

## النص {#text}

يعرض `{{ expression }}` نصًا. تُعرض `null` و`undefined` بلا شيء؛ وتُعرض المصفوفات والكائنات العادية بصيغة JSON.

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

يضبط `v-text="value"` المحتوى النصي لعنصر، ويضبط `v-html="value"` شيفرة HTML الداخلية له. يعرض `v-html` السلسلة بوصفها HTML: لا تمرّر إليه إلا محتوى تثق به.

## السمات {#attributes}

يربط `:name="expression"`، اختصار `v-bind:name`، سمةً أو خاصية DOM. تزيل `null` و`undefined` السمة، وتزيل `false` السمة المنطقية مثل `disabled`. وينشر `v-bind="object"` كل مفاتيح كائن.

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

يضبط المُعدِّل `.prop` دائمًا خاصية DOM، ويضبط `.attr` دائمًا سمة؛ ويحوّل `.camel` الاسم إلى camelCase.

## الصنف والنمط {#class-and-style}

يقبل `:class` سلسلة، أو كائنًا تُضاف مفاتيحه عندما تكون قيمها صحيحة (truthy)، أو مصفوفة من هذه. ويقبل `:style` سلسلة، أو كائنًا من خصائص CSS بصيغة camelCase أو kebab-case، أو مصفوفة. تعمل خصائص CSS المخصصة (`--name`) و`!important` في الصيغتين. ويُدمج `class` أو `style` الثابت مع المربوط.

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

يضيف `@event="handler"`، اختصار `v-on:event`، مستمعًا. القيمة دالة، أو عبارة تعمل عند إطلاق الحدث، حيث `$event` هو الحدث.

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

- المُعدِّلات: يستدعي `.stop` و`.prevent` الدالتين `stopPropagation()` و`preventDefault()`، ويتجاهل `.self` الأحداث القادمة من الأبناء، و`.once` و`.capture` و`.passive` هي خيارات للمستمع، ويشترط `.ctrl` و`.alt` و`.shift` و`.meta` الضغط على المفتاح، ويشترط `.exact` المفاتيح المذكورة بالضبط، ويحدد `.left` و`.middle` و`.right` زر الفأرة.
- على `keydown` و`keyup` و`keypress`، تسمّي المُعدِّلات الأخرى المفاتيح بصيغة kebab case: `.enter` و`.esc` و`.page-down`.
- يُرفق كل مستمع بعنصره نفسه عبر `addEventListener`؛ ولا تُفوَّض الأحداث إلى سلف مشترك. `event.currentTarget` هو العنصر، ويمنع `.stop` في معالج وصولَ الحدث إلى مستمعات الأسلاف.
- اسم الحدث ثابت ([VIBE2303](https://vibejs.org/v0/errors/VIBE2303))، وهناك سمة واحدة لكل حدث ([VIBE2302](https://vibejs.org/v0/errors/VIBE2302)).

## الشروط {#conditions}

تعرض `v-if` و`v-else-if` و`v-else` أحد عدة فروع. الفرع الذي يُزال يُلغى تركيبه: تشغّل مكوّناته خطافات إلغاء التركيب وتزول حالته. ويجمع `<template v-if>` عدة عناصر دون غلاف.

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

يعرض `v-for` عنصرًا لكل عنصر من مصفوفة، أو من قابل للتكرار (iterable) مثل `Map` أو `Set`، أو الأرقام من 1 إلى `n`، أو قيم كائن. كل عنصر داخل `v-for` يحتاج إلى `:key` فريد وثابت ([VIBE2203](https://vibejs.org/v0/errors/VIBE2203))؛ والنطاق الرقمي وحده لا يحتاج إليه.

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

عندما تتغير القائمة، تحتفظ العناصر ذات المفتاح نفسه بعناصر DOM وحالتها، ويُنقل أقل عدد ممكن من العناصر. ولا يمكن لـ `v-if` و`v-for` أن يشتركا في عنصر واحد ([VIBE2103](https://vibejs.org/v0/errors/VIBE2103)): رشّح القائمة في `computed` بدلًا من ذلك.

## v-show {#v-show}

يضبط `v-show="condition"` الخاصية `display: none` ما دام الشرط خاطئًا ويُبقي العنصر في DOM. استخدمه للمحتوى الذي يتبدّل كثيرًا؛ واستخدم `v-if` للمحتوى الذي نادرًا ما يظهر. وهو ينطبق على العناصر فقط، وليس على المكوّنات أو `<template>`.

## v-model على العناصر {#v-model-on-elements}

يربط `v-model` عنصر نموذج بمرجع (ref) في الاتجاهين.

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

- تتحدّث حقول النص و`<textarea>` عند `input`. بينما يحدّث `.lazy` عند `change`، ويقص `.trim` الفراغات من القيمة، ويحوّلها `.number` إلى رقم (و`<input type="number">` يفعل ذلك دائمًا). وأثناء تركيب نص بطريقة إدخال (IME)، يُحدَّث النموذج عند انتهاء التركيب.
- يربط مربع الاختيار قيمة منطقية، أو يضيف `value` الخاص به إلى مصفوفة أو `Set` ويزيله منها؛ ويستبدل `true-value` و`false-value` القيمتين `true` و`false`.
- يضبط زر الراديو النموذج على `value` الخاص به.
- يربط `<select>` قيمة الخيار المحدد؛ ويربط `<select multiple>` مصفوفة من القيم.

يمكن لـ [المكوّنات](https://vibejs.org/v0/ui/components#v-model) أن تأخذ `v-model` أيضًا.

## المراجع القالبية {#template-refs}

يملأ `ref="name"` على عنصر المرجع القالبي الذي يصرّح به السكربت بـ `useTemplateRef('name')`. قيمته `null` إلى أن يُعرض العنصر، وتعود `null` بعد إزالته؛ وداخل `v-for` تكون مصفوفة من العناصر.

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

المرجع النصي بدون `useTemplateRef()` مطابق يُبلَّغ عنه بالرمز [VIBE2701](https://vibejs.org/v0/errors/VIBE2701). ويستدعي `:ref="(el) => ..."` المربوط الدالةَ بالعنصر، وبـ `null` عند إزالته. والمرجع على مكوّن يعطي القيم التي [يكشفها](https://vibejs.org/v0/ui/components#exposing-values) ذلك المكوّن.

## المكوّنات الديناميكية {#dynamic-components}

يعرض `<component :is="value">` المكوّن الذي تحمله `value`، ولا يعرض شيئًا عندما تكون `null` أو `undefined`. تغيير القيمة يلغي تركيب المكوّن السابق.

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

يقبل `:is` كائن مكوّن، وليس اسمًا أبدًا: فلا يوجد سجل عام ([VIBE2006](https://vibejs.org/v0/errors/VIBE2006)، [VIBE5207](https://vibejs.org/v0/errors/VIBE5207)). احتفظ بالمكوّن في `shallowRef`، الذي لا يجعله تفاعليًا.
