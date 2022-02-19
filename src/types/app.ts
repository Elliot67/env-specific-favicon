export interface AppDataGlobal {
  version: string;
  favicon: {
    type: 'global' | 'earth' | 'custom';
    custom: string;
  };
  rules: AppDataRule[];
}

export interface AppDataRule {
  id: string;
  active: boolean;
  type: 'url' | 'title';
  testPattern: string;
  filter: 'top' | 'bottom' | 'right' | 'left'; // TODO: Add more
  color: string;
}
