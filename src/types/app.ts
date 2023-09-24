export interface AppDataGlobal {
  version: string;
  favicon: {
    type: IconsTypeSettings;
    custom: string;
  };
  rules: AppDataRule[];
}

export type IconsTypeSettings = 'global' | 'earth' | 'custom';
export type IconsTypeFull = 'global_dark' | 'global_light' | 'earth_dark' | 'earth_light' | 'custom';

export interface AppDataRule {
  id: string;
  active: boolean;
  type: AppDataRuleType;
  testPattern: string;
  replacementType: AppDataRuleReplacementType;
  filter: AppDataRyleFilter;
  color: string;
  externalFaviconLink: string;
}

export type AppDataRuleType = 'url' | 'title';
export type AppDataRuleReplacementType = 'generated' | 'external';
export type AppDataRyleFilter = 'top' | 'bottom' | 'cover' | 'fill';
