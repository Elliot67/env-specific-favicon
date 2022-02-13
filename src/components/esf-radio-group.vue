<template>
  <EsfRadio
    v-for="(radio, index) in props.options"
    :key="index"
    v-model="baseValue"
    :label="radio.label"
    :value="radio.value"
    :name="name"
  ></EsfRadio>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, PropType, computed } from 'vue';
import { getId } from '~/logic/counter';
import EsfRadio from './esf-radio.vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    required: true,
  },
  options: {
    type: Object as PropType<{ label: string; value: unknown }[]>,
    required: true,
  },
  name: {
    type: String,
    default: () => 'radio_group-' + getId(),
  },
});

const baseValue = computed({
  get: () => {
    return props.modelValue;
  },
  set: (newValue) => {
    emit('update:modelValue', newValue);
  },
});
</script>
