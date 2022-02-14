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
          <EsfRadioGroup v-model="defaultFavIcon" :options="defaultFaviconOptions"></EsfRadioGroup>
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
        <Container
          lock-axis="y"
          behaviour="contain"
          non-drag-area-selector=".rules-rowAction"
          drag-handle-selector=".rules-handler"
          drag-class="isGhost"
          @dragStart="onDragStart"
          @drop="onDrop"
        >
          <template v-for="(rule, idx) in rules" :key="rule.id">
            <Draggable class="sectionItem rules-item" tag="button" @click="toggleRuleSelection(rule.id)">
              <div class="rules-row" :class="{ isDisabled: !rule.active }">
                <div class="rules-actionIcons rules-handler">
                  <img src="/assets/icon-grab.svg" alt="" />
                </div>
                <div>
                  <img src="/assets/icon-512.png" alt="" /><!-- TODO: Precalculate all transformed possibilities -->
                </div>
                <div>{{ lang.rules.type[rule.type] }}</div>
                <div class="rules-pattern">{{ rule.testPattern }}</div>
                <div>{{ rule.active ? 'Active' : 'Disable' }}</div>
                <VDropdown>
                  <button class="rules-rowAction rules-actionIcons" @click.stop>
                    <img src="/assets/icon-dots.svg" alt="" />
                  </button>
                  <template #popper>
                    <div class="rules-menu">
                      <button v-close-popper @click="toggleRuleState(idx)">
                        {{ rule.active ? 'Disable' : 'Active' }} rule
                      </button>
                      <button v-close-popper :disabled="idx === 0" @click="moveRule(idx, -1)">Move above</button>
                      <button v-close-popper :disabled="idx === rules.length - 1" @click="moveRule(idx, 1)">
                        Move below
                      </button>
                      <button v-close-popper @click="removeRule(idx)">Remove rule</button>
                    </div>
                  </template>
                </VDropdown>
              </div>
            </Draggable>
            <div v-if="selectedRuleId === rule.id" class="rules-edit">
              <div class="ruleItem">
                <h4 class="sectionLabel">Match pattern against</h4>
                <EsfRadioGroup v-model="rule.type" :options="ruleMatchPatternOptions"></EsfRadioGroup>
              </div>
              <div class="ruleItem">
                <h4 class="sectionLabel">Match pattern</h4>
                // TODO: Add input text
              </div>
              <div class="ruleItem">
                <h4 class="sectionLabel">Color</h4>
                // TODO: Add input color
              </div>
              <div class="ruleItem">
                <h4 class="sectionLabel">Color position</h4>
                <EsfRadioGroup v-model="rule.filter" :options="ruleColorPositionOptions"></EsfRadioGroup>
              </div>
            </div>
          </template>
        </Container>
        <div class="sectionItem rules-action">
          <EsfButton @click="addRule">Add a new rule</EsfButton>
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
import { ref, reactive } from 'vue';
import EsfRadioGroup from '~/components/esf-radio-group.vue';
import EsfSection from '~/components/esf-section.vue';
import EsfButton from '~/components/esf-button.vue';
import browser from 'webextension-polyfill';
// @ts-ignore
import { Container, Draggable } from 'vue-dndrop';
import { applyDragOnReactive } from '~/logic/drag-and-drop';
import { en as lang } from '~/translations/en';
import { AppDataRule } from '~/types/app';
import { getEmptyRule } from '~/logic';

const defaultFaviconOptions = [
  {
    label: lang.blankFavicons.chrome,
    value: 'chrome',
  },
  {
    label: lang.blankFavicons.firefox,
    value: 'firefox',
  },
  {
    label: lang.blankFavicons.edge,
    value: 'edge',
  },
];
const defaultFavIcon = ref(defaultFaviconOptions[0].value);

const ruleMatchPatternOptions = [
  {
    label: lang.rules.type.url,
    value: 'url',
  },
  {
    label: lang.rules.type.title,
    value: 'title',
  },
];

const ruleColorPositionOptions = [
  {
    label: lang.rules.filters.top,
    value: 'top',
  },
  {
    label: lang.rules.filters.bottom,
    value: 'bottom',
  },
  {
    label: lang.rules.filters.right,
    value: 'right',
  },
  {
    label: lang.rules.filters.left,
    value: 'left',
  },
];
const manifest = ref<browser.Manifest.WebExtensionManifest>(browser.runtime.getManifest());

let rules: AppDataRule[] = reactive([
  {
    id: '1',
    active: true,
    type: 'url',
    testPattern: 'Je suis le test pattern',
    filter: 'top',
    color: 'red',
  },
  {
    id: '2',
    active: true,
    type: 'url',
    testPattern: 'Je suis le test pattern',
    filter: 'top',
    color: 'red',
  },
  {
    id: '3',
    active: true,
    type: 'url',
    testPattern: 'Je suis le test pattern',
    filter: 'top',
    color: 'red',
  },
]);
const selectedRuleId = ref<string | null>(null);

function toggleRuleSelection(ruleId: string) {
  if (selectedRuleId.value === ruleId) {
    selectedRuleId.value = null;
  } else {
    selectedRuleId.value = ruleId;
  }
}

function toggleRuleState(index: number) {
  rules[index].active = !rules[index].active;
}

function unselectRule() {
  selectedRuleId.value = null;
  // TODO: Might need to backup data or something
}

function onDragStart(dragResult: any) {
  unselectRule();
}

function onDrop(dropResult: any) {
  applyDragOnReactive(rules, dropResult);
}

function moveRule(startIndex: number, shift: number) {
  const item = rules.splice(startIndex, 1)[0];
  rules.splice(startIndex + shift, 0, item);
}

function removeRule(idx: number): void {
  rules.splice(idx, 1);
}

function addRule(): void {
  const newRule = getEmptyRule();
  rules.push(newRule);
  toggleRuleSelection(newRule.id);
}
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

.ruleItem {
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
  &-item {
    cursor: pointer;
    width: 100%;
    text-align: start;
    transition-duration: 0.2s;
    transition-property: background-color;

    //&:hover,
    &:focus-visible,
    &:hover,
    &.dndrop-ghost {
      background-color: var(--esf-primary-hover);
    }
  }

  &-row {
    display: grid;
    align-items: center;
    grid-template-columns: 8rem 6rem 1fr 4fr 1fr 6rem;
    grid-column-gap: 3rem;

    & > div {
      flex: 2;
    }

    img {
      width: 100%;
    }

    &.isDisabled {
      color: var(--esf-secondary-dark);
    }
  }

  &-actionIcons {
    display: block;
    height: 6rem;
  }

  &-handler {
    cursor: grab;
    width: 6rem;
  }

  &-pattern {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-rowAction {
    position: relative;
    outline-style: none;

    cursor: pointer;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      transform: scale(0);
      transition-property: transform;
      transition-duration: 0.2s;
      opacity: 0.4;
    }

    &:hover::before {
      background-color: var(--esf-primary-light);
      transform: scale(1.4);
    }
    &:focus-visible::before {
      background-color: var(--esf-accent-opacity);
      transform: scale(1.4);
    }
  }

  &-menu {
    padding-block: 2rem;
    display: flex;
    flex-direction: column;

    button {
      padding-inline: 5rem;
      height: 9rem;
      width: 100%;
      text-align: start;

      &:disabled {
        color: var(--esf-secondary-dark);
      }

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background: var(--esf-primary-light);
        // TODO: Add focus trap for the menu
      }
    }
  }

  &-edit {
    padding-inline: 5rem;
    background-color: var(--esf-primary-dark);

    &:not(:last-child) {
      border-block-end: solid var(--esf-primary-light) 1px;
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
</style>
