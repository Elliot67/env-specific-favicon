import { LangInterface } from '~/types/lang';

export const en: LangInterface = {
  general: {
    permissions: {
      title: 'Missing required permission',
      description:
        'For the extension to operate effectively, it requires permission to access all websites in order to match the right ones and retrieve their favicons. Without this access, the extension will not work as intended.',
      button: 'Grant permission',
    },
  },
  favicon: {
    global: 'Global',
    earth: 'Earth',
    custom: 'Custom',
  },
  rules: {
    type: {
      url: 'URL',
      title: 'Title',
    },
    filters: {
      top: 'Top',
      bottom: 'Bottom',
      cover: 'Cover',
      fill: 'Fill',
    },
    replacementType: {
      generated: 'Customization',
      external: 'Replacement',
    },
  },
};
