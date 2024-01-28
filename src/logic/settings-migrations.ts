import { AppDataGlobal } from '~/types/app';

export function migrateSettings(settings: AppDataGlobal) {
  for (const migration of migrationScripts) {
    if (migration.fromVersion !== settings.version) {
      continue;
    }

    migration.migrate(settings);
  }
}

const migrationScripts: { fromVersion: string; toVersion: string; migrate: (settings: AppDataGlobal) => void }[] = [
  {
    fromVersion: '1.0',
    toVersion: '1.2.0',
    migrate: (settings) => {
      settings.version = '1.2.0';
      settings.rules.forEach((rule) => {
        rule.replacementType = 'generated';
        rule.externalFaviconLink = '';
      });
    },
  },
  {
    fromVersion: '1.2.0',
    toVersion: '1.3.0',
    migrate: (settings) => {
      settings.version = '1.3.0';
    },
  },
  {
    fromVersion: '1.3.0',
    toVersion: '1.3.1',
    migrate: (settings) => {
      settings.version = '1.3.1';
    },
  },
];
