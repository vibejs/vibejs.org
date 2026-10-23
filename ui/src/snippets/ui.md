```vibe
<script setup lang="ts">
import { computed, inject, useAsync } from '@usevibejs/ui';
import { API } from '../api.ts';

const api = inject(API)!;
const { data } = useAsync((signal) =>
  api.todos.list(undefined, { signal }),
);
const todos = computed(() =>
  data.value?.ok ? data.value.data : [],
);
</script>

<template>
  <h1>Todos</h1>
  <p v-for="todo in todos" :key="todo.id">
    {{ todo.title }}
  </p>
</template>
```
