<template>
  <label class="radio">
    <input v-model="rootValue" type="radio" :name="name" :value="value" />
    <div class="fake"></div>
    <span>{{ label }}</span>
  </label>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: {
    required: true,
  },
  value: {
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['update:modelValue']);

const rootValue = computed({
  get: () => {
    return props.modelValue;
  },
  set: (newValue) => {
    emits('update:modelValue', newValue);
  },
});
</script>

<style lang="scss" scoped>
label {
  display: flex;
  align-items: center;
}

input {
  opacity: 0;
  height: 0;
  width: 0;
  margin: 0;
  padding: 0;
}

.fake {
  background-color: var(--esf-primary);
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 1px solid var(--esf-secondary);
  display: inline-flex;
  margin-inline-end: 0.5em;
  flex-shrink: 0;
}

input:checked + .fake {
  background-color: var(--esf-accent);
  border-color: var(--esf-accent);
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    height: 0.75em;
    width: 0.75em;
    border-radius: 50%;
    background-color: var(--esf-accent);
    border: 3px solid var(--esf-primary);
  }
}

input:focus-visible + .fake {
  outline-style: solid;
  outline-offset: 2px;
  outline-width: 3px;
  outline-color: var(--esf-accent-opacity);
}
</style>
