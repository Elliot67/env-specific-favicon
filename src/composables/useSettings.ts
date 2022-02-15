import { AsyncStorage, getEmptyRule } from '~/logic';
import { AppDataGlobal, AppDataRule } from '~/types/app';
import { reactive, toRaw, watch } from 'vue';

const initialState: AppDataGlobal = {
  version: '1.0', // TODO: Get version from manifest
  blankFavicon: 'chrome',
  rules: [],
};

const STORAGE_KEY = 'env-specific-favicon';

export default function useSettings() {
  const settings = reactive<AppDataGlobal>({ ...initialState });

  async function load(): Promise<void> {
    const storageSettings = await AsyncStorage.getItem<AppDataGlobal | undefined>(STORAGE_KEY);
    if (storageSettings) {
      settings.version = storageSettings.version;
      settings.blankFavicon = storageSettings.blankFavicon;
      settings.rules = storageSettings.rules;
    } else {
      save();
    }
  }

  async function reset() {
    settings.version = initialState.version;
    settings.blankFavicon = initialState.blankFavicon;
    settings.rules = [];
    save();
  }

  async function save(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, toRaw(settings));
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
