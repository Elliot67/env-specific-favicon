<template>
  <main>
    <EsfSection>
      <template #title>General</template>
      <template #body>
        <div class="sectionItem">
          <h3>Manage configuration</h3>
        </div>
        <div class="sectionItem">
          <h3>Default favicon</h3>
          <EsfRadioGroup v-model="defaultFavIcon" name="nom" :options="defaultFaviconOptions"></EsfRadioGroup>
        </div>
      </template>
    </EsfSection>
    <EsfSection>
      <template #title>Règles de remplacement</template>
      <template #body>
        <div class="sectionItem rules-action">
          <EsfButton>Add a new rule</EsfButton>
        </div>
      </template>
    </EsfSection>

    <EsfSection v-if="manifest">
      <template #title>About</template>
      <template #body>
        <div class="sectionItem aboutContainer">
          <img src="/assets/icon-512.png" alt="" />
          <div>
            <h4>{{ manifest.name }}</h4>
            <p class="textLight">Version {{ manifest.version }}</p>
          </div>
        </div>
        <div class="sectionItem">
          <p class="textLight">{{ manifest.description }}</p>
          <p class="textLight">Open source project created by {{ manifest.author }}.</p>
        </div>
      </template>
    </EsfSection>
  </main>
</template>

<script setup lang="ts">
//import { storageDemo } from '~/logic/storage';
import { ref } from 'vue';
import EsfRadioGroup from '~/components/esf-radio-group.vue';
import EsfSection from '~/components/esf-section.vue';
import EsfButton from '~/components/esf-button.vue';
import browser from 'webextension-polyfill';

const defaultFaviconOptions = ref([
  {
    label: 'Google Chrome',
    value: 'chrome',
  },
  {
    label: 'Mozilla Firefox',
    value: 'firefox',
  },
  {
    label: 'Microsoft Edge',
    value: 'edge',
  },
]);
const defaultFavIcon = ref(defaultFaviconOptions.value[0].value);

const manifest = ref<browser.Manifest.WebExtensionManifest>(browser.runtime.getManifest());
</script>

<style lang="scss" scoped>
main {
  max-width: 680px;
  margin: auto;
  padding-inline: 24px;
}

.sectionItem {
  padding-block: 5rem;
  padding-inline: 3rem;

  &:not(:last-child) {
    border-block-end: solid var(--esf-primary-light) 1px;
  }
}

.textLight {
  color: var(--esf-secondary-dark);
}

.rules-action {
  display: flex;
  justify-content: flex-end;
}

.aboutContainer {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 4rem;

  img {
    width: 32px;
  }
}
</style>
