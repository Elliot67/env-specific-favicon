<template>
  <label class="radio" :for="id">
    <input :id="id" v-model="rootValue" type="radio" :name="name" :value="value" />
    <div class="fake"></div>
    <span>{{ label }}</span>
  </label>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue';
import { getId } from '~/logic/counter';

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

const id = 'radio-' + getId();

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
  cursor: pointer;
}

input {
  opacity: 0;
  height: 0;
  width: 0;
  margin: 0;
  padding: 0;
}

.fake {
  background-color: transparent;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 2px solid var(--esf-secondary-dark);
  display: inline-flex;
  margin-inline-end: 5rem;
  flex-shrink: 0;
}

input:checked + .fake {
  background-color: var(--esf-accent);
  border-color: var(--esf-accent);
  justify-content: center;
  align-items: center;

  &::before {
    flex-shrink: 0;
    content: '';
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    background-color: var(--esf-accent);
    border: 2px solid var(--esf-primary);
  }
}

input:focus-visible + .fake {
  outline-style: solid;
  outline-offset: 2px;
  outline-width: 3px;
  outline-color: var(--esf-accent-opacity);
}

span {
  padding-block: 2rem;
}
</style>
