<template>
  <h2><slot name="title"></slot></h2>
  <section :class="{ alert: props?.type === 'alert' }">
    <slot name="body"></slot>
  </section>
</template>

<script lang="ts" setup>
interface Props {
  type?: 'alert';
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
h2 {
  padding-block-start: 2rem;
  padding-block-end: 1rem;
  margin-block-start: 6rem;
  margin-block-end: 3rem;
  font-size: 4rem;
  line-height: 5rem;
  font-weight: var(--esf-bold);
}
section {
  background-color: var(--esf-primary);
  border-radius: 1rem;
  box-shadow: var(--esf-box-shadow);

  &:last-of-type {
    margin-bottom: 6rem;
  }

  &.alert {
    border: solid var(--esf-error-mandatory) 1px;
  }
}
</style>
