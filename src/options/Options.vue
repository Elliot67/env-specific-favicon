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
          <p class="sectionItemDescription">
            If you want to keep your fallback browser favicon, you have to choose 'custom' and upload the image. More
            details on how to get the original file can be found in
            <a href="https://github.com/Elliot67/env-specific-favicon">the repository readme</a>.
          </p>
          <EsfRadioGroup v-model="settings.favicon.type" :options="faviconOptions"></EsfRadioGroup>
          <template v-if="settings.favicon.type === 'custom'">
            <p class="textLight inputFileHint">
              Provide a small size square image, an svg or a 48px width image is recommended.
            </p>
            <EsfInputFile v-model="settings.favicon.custom" label="Click or drag & drop your favicon" />
          </template>
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
          <template v-for="(rule, idx) in settings.rules" :key="rule.id">
            <Draggable class="sectionItem rules-item" tag="button" @click="toggleRuleSelection(rule.id)">
              <div class="rules-row" :class="{ isDisabled: !rule.active }">
                <div class="rules-actionIcons rules-handler">
                  <img src="/assets/icon-grab.svg" alt="" />
                </div>
                <div>
                  <img :src="icons[rule.id]?.icon" alt="" />
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
                      <button v-close-popper :disabled="idx === settings.rules.length - 1" @click="moveRule(idx, 1)">
                        Move below
                      </button>
                      <button v-close-popper @click="deleteRule(idx)">Remove rule</button>
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
                <h4 class="sectionLabel">Pattern</h4>
                <EsfInputText v-model="rule.testPattern" label="Match pattern" placeholder="*.com" />
              </div>
              <div class="ruleItem">
                <h4 class="sectionLabel">Color</h4>
                <EsfInputColor v-model="rule.color" label="Color" placeholder="#663399" />
              </div>
              <div class="ruleItem">
                <h4 class="sectionLabel">Color position</h4>
                <EsfRadioGroup v-model="rule.filter" :options="ruleColorPositionOptions"></EsfRadioGroup>
              </div>
            </div>
          </template>
        </Container>
        <div class="sectionItem rules-action">
          <EsfButton @click="newRule">Add a new rule</EsfButton>
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
import { ref, reactive, watch } from 'vue';
import EsfRadioGroup from '~/components/esf-radio-group.vue';
import EsfSection from '~/components/esf-section.vue';
import EsfButton from '~/components/esf-button.vue';
import browser from 'webextension-polyfill';
// @ts-ignore
import { Container, Draggable } from 'vue-dndrop';
import { applyDragOnReactive } from '~/logic/drag-and-drop';
import { en as lang } from '~/translations/en';
import EsfInputText from '~/components/esf-input-text.vue';
import EsfInputColor from '~/components/esf-input-color.vue';
import useSettings from '~/composables/useSettings';
import { sendMessage } from 'webext-bridge';
import { AppDataRule } from '~/types/app';
import { isDef } from '~/utils';
import EsfInputFile from '~/components/esf-input-file.vue';

const faviconOptions = [
  {
    label: lang.favicon.global,
    value: 'global',
  },
  {
    label: lang.favicon.earth,
    value: 'earth',
  },
  {
    label: lang.favicon.custom,
    value: 'custom',
  },
];

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

const { settings, load, toggleRuleState, moveRule, deleteRule, addRule } = useSettings();

load();

async function generateIcon(index: number): Promise<string> {
  //@ts-ignore
  const { favicon } = await sendMessage('get-favicon', settings.rules[index]);
  return favicon;
}

function generateIconHash(rule: AppDataRule): string {
  let hash = rule.color + rule.filter + settings.favicon.type;
  if (settings.favicon.type === 'custom') {
    // TODO: Hash le custom pour pas avoir tout le data uri
    hash += settings.favicon.custom;
  }
  return hash;
}

const icons = reactive<Record<string, { icon: string; hash: string }>>({});

watch(settings, async () => {
  settings.rules.forEach((rule, idx) => {
    let renewIcon = !isDef(icons[rule.id]);
    if (!renewIcon) {
      const { hash } = icons[rule.id];
      renewIcon = hash !== generateIconHash(rule);
    }
    if (renewIcon) {
      generateIcon(idx).then((favicon) => (icons[rule.id] = { icon: favicon, hash: generateIconHash(rule) }));
    }
  });
});

const selectedRuleId = ref<string | null>(null);

function toggleRuleSelection(ruleId: string) {
  if (selectedRuleId.value === ruleId) {
    selectedRuleId.value = null;
  } else {
    selectedRuleId.value = ruleId;
  }
}

function unselectRule() {
  selectedRuleId.value = null;
}

function onDragStart(dragResult: any) {
  unselectRule();
}

function onDrop(dropResult: any) {
  applyDragOnReactive(settings.rules, dropResult);
}

function newRule(): void {
  const rule = addRule();
  toggleRuleSelection(rule.id);
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

.sectionItemDescription {
  color: var(--esf-secondary-dark);
  margin-block-end: 2rem;
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

.inputFileHint {
  margin-block-start: 4rem;
  margin-block-end: 2rem;
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
