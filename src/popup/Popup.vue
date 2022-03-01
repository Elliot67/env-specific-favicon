<template>
  <main class="pageContainer">
    <div>
      <EsfExtensionPresentation :manifest="manifest" />
    </div>
    <EsfButton @click="openOptionsPage">Settings</EsfButton>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import browser from 'webextension-polyfill';
import EsfButton from '~/components/esf-button.vue';
import EsfExtensionPresentation from '~/components/esf-extension-presentation.vue';

const manifest = ref<browser.Manifest.WebExtensionManifest>(browser.runtime.getManifest());

function openOptionsPage() {
  browser.runtime.openOptionsPage();
}
</script>

<style lang="scss" scoped>
main {
  width: 360px;
}

button {
  display: block;
  margin-inline-start: auto;
  margin-block-start: 4rem;
}
</style>
