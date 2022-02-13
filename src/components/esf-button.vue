<template>
  <button>
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  border-radius: 1rem;
  color: var(--esf-accent);
  border: solid 1px var(--esf-primary-light);
  font-weight: var(--esf-bold);
  padding-block: 2rem;
  padding-inline: 4rem;
  background-color: var(--esf-primary);
  transition-duration: 0.3s;
  transition-property: background-color;
  transition-timing-function: ease;

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: var(--esf-primary-hover);
  }

  &:active:not(:disabled) {
    transition-duration: 0.1s;
    background-color: var(--esf-primary-active);
  }

  &:disabled {
    color: var(--esf-secondary-dark);
    background-color: var(--esf-primary-disabled);
    border-color: transparent;
  }
}
</style>
