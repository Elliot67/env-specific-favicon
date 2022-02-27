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
  type: 'url' | 'title';
  testPattern: string;
  filter: 'top' | 'bottom' | 'cover' | 'fill';
  color: string;
}
