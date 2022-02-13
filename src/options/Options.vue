<template>
  <main>
    <EsfSection>
      <template #title>General</template>
      <template #body>
        <div class="sectionItem">
          <h3 class="sectionLabel">Manage configuration</h3>
          <div class="general-subItem">
            <p class="textLight">Backup and share your settings</p>
            <div class="general-action">
              <EsfButton>Import</EsfButton>
              <EsfButton>Export</EsfButton>
            </div>
          </div>
        </div>
        <div class="sectionItem">
          <h3 class="sectionLabel">Default favicon</h3>
          <EsfRadioGroup v-model="defaultFavIcon" name="nom" :options="defaultFaviconOptions"></EsfRadioGroup>
        </div>
      </template>
    </EsfSection>
    <EsfSection>
      <template #title>Règles de remplacement</template>
      <template #body>
        <div class="sectionItem rules-row textLight">
          <div></div>
          <div></div>
          <div>Type</div>
          <div>Pattern</div>
          <div>State</div>
          <div></div>
        </div>
        <Container lock-axis="y" behaviour="contain" non-drag-area-selector=".rules-rowAction" @drop="onDrop">
          <Draggable v-for="(item, index) in 5" :key="index" class="sectionItem">
            <div class="rules-row">
              <div class="rules-actionIcons">
                <img src="/assets/icon-grab.svg" alt="" />
              </div>
              <div>
                <img src="/assets/icon-512.png" alt="" />
              </div>
              <div>URL</div>
              <div>*//*/*/</div>
              <div>Disabled</div>
              <button class="rules-rowAction rules-actionIcons"><img src="/assets/icon-dots.svg" alt="" /></button>
            </div>
          </Draggable>
        </Container>
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
import { Container, Draggable } from 'vue-dndrop';

function onDrop(dropResult) {
  console.log(dropResult);
  // TODO: Apply drag | https://amendx.github.io/vue-dndrop/examples/helpers.html#applydrag
}

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
// ----------
// Utility
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

.sectionLabel {
  margin-block-end: 3rem;
}

// ----------
// Content based
main {
  max-width: 680px;
  margin: auto;
  padding-inline: 24px;
}

.general {
  &-action {
    display: flex;
    gap: 2rem;
  }

  &-subItem {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
}

.rules {
  &-row {
    display: grid;
    align-items: center;
    grid-template-columns: 6rem 6rem 1fr 4fr 1fr 6rem;
    grid-column-gap: 3rem;

    & > div {
      flex: 2;
    }

    img {
      width: 100%;
    }
  }

  &-rowAction {
    cursor: pointer;
  }

  &-actionIcons {
    height: 6rem;
    position: relative;
    outline-style: none;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--esf-accent-opacity);
      border-radius: 50%;
      transform: scale(0);
      transition-property: transform;
      transition-duration: 0.2s;
      opacity: 0.4;
    }
    &:focus-visible::before {
      transform: scale(1.4);
    }
  }

  &-action {
    display: flex;
    justify-content: flex-end;
  }
}

.aboutContainer {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 4rem;

  img {
    width: 32px;
  }
}

.dndrop-draggable-wrapper {
  cursor: grab;
}
</style>
