import { AppDataGlobal, AppDataRule } from './app';

export interface LangInterface {
  blankFavicons: Record<AppDataGlobal['blankFavIcon'], string>;
  rules: {
    type: Record<AppDataRule['type'], string>;
    filters: Record<AppDataRule['filter'], string>;
  };
}
