import { SettingsStorage, getEmptyRule } from '~/logic';
import { AppDataGlobal, AppDataRule } from '~/types/app';
import { reactive, toRaw, watch } from 'vue';
import { defaultSettings } from '~/configuration/settings';

export default function useSettings() {
  const settings = reactive<AppDataGlobal>({ ...defaultSettings });

  async function load(): Promise<void> {
    const storageSettings = await SettingsStorage.getItem();
    settings.version = storageSettings.version;
    settings.blankFavicon = storageSettings.blankFavicon;
    settings.rules = storageSettings.rules;
  }

  async function reset() {
    settings.version = defaultSettings.version;
    settings.blankFavicon = defaultSettings.blankFavicon;
    settings.rules = [];
  }

  async function save(): Promise<void> {
    await SettingsStorage.setItem(toRaw(settings));
  }

  watch(settings, () => {
    save();
  });

  // Rules

  function toggleRuleState(index: number) {
    settings.rules[index].active = !settings.rules[index].active;
  }

  function moveRule(startIndex: number, shift: number) {
    const item = settings.rules.splice(startIndex, 1)[0];
    settings.rules.splice(startIndex + shift, 0, item);
  }

  function deleteRule(index: number): void {
    settings.rules.splice(index, 1);
  }

  function addRule(rule: AppDataRule = getEmptyRule()): AppDataRule {
    settings.rules.push(rule);
    return rule;
  }

  return {
    settings,
    load,
    save,
    reset,

    // Rules
    toggleRuleState,
    moveRule,
    deleteRule,
    addRule,
  };
}
