import { AppDataGlobal, AppDataRule } from './app';

export interface LangInterface {
  general: {
    permissions: {
      title: string;
      description: string;
      button: string;
    };
  };
  favicon: Record<AppDataGlobal['favicon']['type'], string>;
  rules: {
    type: Record<AppDataRule['type'], string>;
    filters: Record<AppDataRule['filter'], string>;
    replacementType: Record<AppDataRule['replacementType'], string>;
  };
}
