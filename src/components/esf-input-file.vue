<template>
  <label :for="id" :class="{ isHoveringWithFile }">
    <span>{{ label }}</span>
    <div v-if="rootValue" class="currentActive">
      <p>Currently selected :</p>
      <img v-if="rootValue" :src="rootValue" />
    </div>
    <input
      :id="id"
      type="file"
      accept="image/jpeg,image/png,image/svg+xml,image/bmp,image/vnd.microsoft.icon,image/gif,image/tiff,image/webp"
      @change="onChange"
      @dragenter="isHoveringWithFile = true"
      @dragleave="isHoveringWithFile = false"
      @drop="isHoveringWithFile = false"
    />
    <div class="fakeFocus"></div>
  </label>
</template>

<script lang="ts" setup>
import { getId } from '~/logic';
import { computed, ref } from 'vue';
import { isDef } from '~/utils';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['update:modelValue']);

const id = 'input_file-' + getId();

const isHoveringWithFile = ref(false);

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!isDef(file)) {
    rootValue.value = '';
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    // @ts-ignore
    rootValue.value = e.target.result;
  };
}

const rootValue = computed({
  get: (): string => {
    return props.modelValue;
  },
  set: (newValue): void => {
    emits('update:modelValue', newValue);
  },
});
</script>

<style lang="scss" scoped>
label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--esf-secondary-dark);
  border-radius: 1rem;
  min-height: 20rem;
  padding: 2rem;
  position: relative;

  &.isHoveringWithFile {
    border-color: var(--esf-secondary);
    background-color: var(--esf-primary-active);
  }

  & *:not(input) {
    pointer-events: none;
  }
}

span {
  color: var(--esf-secondary-dark);
}

.currentActive {
  margin-block-start: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    margin-inline-start: 1rem;
    height: 5rem;
    width: 5rem;
  }
}

input {
  opacity: 0;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;

  &:focus-visible + .fakeFocus {
    display: block;
    outline-style: solid;
    outline-offset: 3px;
    outline-width: 3px;
    outline-color: var(--esf-accent-opacity);
  }
}

.fakeFocus {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  display: none;
  border-radius: 1rem;
}
</style>
