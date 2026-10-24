```vibe
<script setup lang="ts">
import { ref } from '@usevibejs/ui';
const count = ref(0);
</script>

<template>
  <button @click="count++">
    نُقر {{ count }} مرة
  </button>
</template>
```
