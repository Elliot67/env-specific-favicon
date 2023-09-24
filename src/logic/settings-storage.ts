import { storage } from 'webextension-polyfill';
import { defaultSettings } from '~/configuration/settings';
import { migrateSettings } from '~/logic/settings-migrations';
import { AppDataGlobal } from '~/types/app';
import { isDef } from '~/utils';

const STORAGE_KEY = 'env-specific-favicon';

export const SettingsStorage = {
  async setItem(value: unknown): Promise<void> {
    return await storage.local.set({ [STORAGE_KEY]: value });
  },

  async getItem(): Promise<AppDataGlobal> {
    const settings = (await storage.local.get(STORAGE_KEY))[STORAGE_KEY];
    if (!isDef(settings)) {
      await SettingsStorage.resetItem();
      return SettingsStorage.getItem();
    }
    if (settings.version !== defaultSettings.version) {
      migrateSettings(settings);
      await SettingsStorage.setItem(settings);
    }
    return settings;
  },

  async resetItem(): Promise<void> {
    return await SettingsStorage.setItem(defaultSettings);
  },

  async applyMigrations(): Promise<void> {
    const settings = await SettingsStorage.getItem();
    if (settings.version !== defaultSettings.version) {
      migrateSettings(settings);
    }
    await SettingsStorage.setItem(settings);
  },
};
