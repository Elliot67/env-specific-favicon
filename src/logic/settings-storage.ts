import { storage } from 'webextension-polyfill';

export const AsyncStorage = {
  async removeItem(key: string): Promise<void> {
    return await storage.local.remove(key);
  },

  async setItem(key: string, value: unknown): Promise<void> {
    return await storage.local.set({ [key]: value });
  },

  async getItem<T>(key: string): Promise<T> {
    return (await storage.local.get(key))[key];
  },
};
