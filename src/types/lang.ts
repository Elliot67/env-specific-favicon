import { AppDataGlobal, AppDataRule } from './app';

export interface LangInterface {
  favicon: Record<AppDataGlobal['favicon']['type'], string>;
  rules: {
    type: Record<AppDataRule['type'], string>;
    filters: Record<AppDataRule['filter'], string>;
  };
}
