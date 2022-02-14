export interface AppDataGlobal {
  version: string;
  blankFavIcon: 'chrome' | 'edge' | 'firefox'; // TODO: Récupérer avec chrome://favicon/ | edge://favicon/
  tabs: AppDataRule[];
}

export interface AppDataRule {
  id: string;
  active: boolean;
  type: 'url' | 'title';
  testPattern: string;
  filter: 'top' | 'bottom' | 'right' | 'left'; // TODO: Add more
  color: string;
}
