<template>
  <div class="presentation">
    <img src="/assets/icon-512.png" alt="" />
    <div>
      <h4>{{ manifest.name }}</h4>
      <p class="textLight">Version {{ manifest.version }}</p>
    </div>
  </div>
  <div class="description">
    <p class="textLight">{{ manifest.description }}</p>
    <p v-if="credits" class="textLight">
      <a :href="manifest.homepage_url" target="_blank">Open source project</a> created by {{ manifest.author }}. Feel
      free to contribute.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import browser from 'webextension-polyfill';

interface Props {
  manifest: browser.Manifest.WebExtensionManifest;
  credits?: boolean;
}
defineProps<Props>();
</script>

<style lang="scss" scoped>
.presentation {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 4rem;
  margin-block-end: 3rem;

  img {
    width: 32px;
  }
}
</style>
