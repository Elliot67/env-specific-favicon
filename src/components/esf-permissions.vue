<template>
  <EsfSection v-if="!hasAllPermissions" type="alert">
    <template #body>
      <div class="sectionItem">
        <h3 class="sectionLabel">{{ lang.general.permissions.title }}</h3>
        <div class="Permissions-content">
          <p class="textLight">{{ lang.general.permissions.description }}</p>
          <EsfButton @click="askPermissions" class="Permissions-button">{{
            lang.general.permissions.button
          }}</EsfButton>
        </div>
      </div>
    </template>
  </EsfSection>
</template>

<script lang="ts" setup>
import EsfSection from '~/components/esf-section.vue';
import EsfButton from '~/components/esf-button.vue';
import { Permissions } from 'webextension-polyfill';
import { en as lang } from '~/translations/en';

const neededPermissions: Permissions.Permissions = {
  origins: ['*://*/*'],
};

const hasAllPermissions = ref(true);

async function updateAvailability(): Promise<void> {
  const hasOriginPermission = await browser.permissions.contains(neededPermissions);
  hasAllPermissions.value = hasOriginPermission;
}

function onPermissionChanges(): void {
  updateAvailability();
}

browser.permissions.onAdded.addListener(onPermissionChanges);
browser.permissions.onRemoved.addListener(onPermissionChanges);

onUnmounted(() => {
  browser.permissions.onAdded.removeListener(onPermissionChanges);
  browser.permissions.onRemoved.removeListener(onPermissionChanges);
});

async function askPermissions(): Promise<void> {
  browser.permissions.request(neededPermissions);
}

updateAvailability();
</script>

<style lang="scss">
.Permissions {
  &-content {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 4rem;
  }

  &-button {
    flex-shrink: 0;
  }
}
</style>
