<template>
  <h2><slot name="title"></slot></h2>
  <section>
    <slot name="body"></slot>
  </section>
</template>

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
}
</style>
