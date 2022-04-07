<template>
  <label :for="id" :class="{ invalid: !isValid }">
    <span>{{ label }}</span>
    <div>
      <input v-model="rootValue" type="color" />
      <input :id="id" v-model="rootValue" type="text" :placeholder="placeholder" />
    </div>
  </label>
</template>

<script lang="ts" setup>
import { getId } from '~/logic';
import { computed } from 'vue';
import { isColorHexValid } from '~/utils';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['update:modelValue']);

const id = 'input_text-' + getId();

const rootValue = computed({
  get: (): string => {
    return props.modelValue;
  },
  set: (newValue: string) => {
    emits('update:modelValue', newValue.toUpperCase());
  },
});

const isValid = computed(() => {
  return isColorHexValid(rootValue.value);
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

div {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
}

input[type='color'] {
  border: none;
  outline: none;
  appearance: none;
  background-color: transparent;
  padding: 0;
  width: 8rem;
  height: 8rem;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  margin: 1px;
  border-end-end-radius: 0;
  border-start-end-radius: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
  }

  &:focus {
    border-inline-end: solid var(--esf-accent) 1px;
  }

  &:focus + input {
    border-color: var(--esf-accent);
  }
}

input[type='text'] {
  background-color: var(--esf-primary-dark);
  padding: 1.5rem 2rem;
  border: 1px solid var(--esf-primary-light);
  color: var(--esf-secondary);
  border-radius: 1rem;
  outline: none !important;
  line-height: 5rem;
  min-width: 20rem;
  padding-inline-start: calc(8rem + 2rem);
  width: 100%;

  &::placeholder {
    color: var(--esf-secondary-dark);
  }

  &:focus {
    border-color: var(--esf-accent);
  }
}

.invalid {
  span {
    color: var(--esf-error);
  }

  input {
    border-color: var(--esf-error);
  }
}
</style>
