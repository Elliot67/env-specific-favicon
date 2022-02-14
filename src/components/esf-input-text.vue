<template>
  <label :for="id">
    <span>{{ label }}</span>
    <input :id="id" v-model="rootValue" :placeholder="placeholder" type="text" />
  </label>
</template>

<script lang="ts" setup>
import { getId } from '~/logic';
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: {
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['update:modelValue']);

const id = 'input_text-' + getId();

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
  align-items: baseline;
  gap: 5rem;
}

span {
  flex-basis: 25rem;
}

input {
  background-color: var(--esf-primary-dark);
  padding: 1.5rem 2rem;
  border: 1px solid var(--esf-primary-light);
  color: var(--esf-secondary);
  border-radius: 1rem;
  outline: none !important;
  line-height: 5rem;
  flex-grow: 1;
  min-width: 20rem;

  &::placeholder {
    color: var(--esf-secondary-dark);
  }

  &:focus {
    border-color: var(--esf-accent);
  }
}
</style>
