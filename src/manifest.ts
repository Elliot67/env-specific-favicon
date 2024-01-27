import fs from 'fs-extra';
import type { Manifest } from 'webextension-polyfill';
import type PkgType from '../package.json';
import { isDev, isFirefox, port, r } from '../scripts/utils';

export async function getManifest(): Promise<Manifest.WebExtensionManifest> {
  const pkg = (await fs.readJSON(r('package.json'))) as typeof PkgType;

  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    author: 'Elliot Lintz',
    version: pkg.version,
    description: pkg.description,
    homepage_url: 'https://github.com/Elliot67/env-specific-favicon',
    action: {
      default_icon: './assets/icon-512.png',
      default_popup: './dist/popup/index.html',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
    },
    background: isFirefox
    ? {
        scripts: ['dist/background/index.mjs'],
        type: 'module',
      }
    : {
        service_worker: './dist/background/index.mjs',
      },
    icons: {
      16: './assets/icon-128.png',
      32: './assets/icon-128.png',
      128: './assets/icon-128.png',
      512: './assets/icon-512.png',
    },
    permissions: ['storage'],
    host_permissions: ['*://*/*'],
    content_scripts: [
      {
        run_at: 'document_idle',
        matches: ['http://*/*', 'https://*/*'],
        js: ['./dist/contentScripts/index.global.js'],
      },
    ],
    content_security_policy: {
      extension_pages: isDev
        // this is required on dev for Vite script to load
        ? `script-src \'self\' http://localhost:${port}; object-src \'self\'`
        : 'script-src \'self\'; object-src \'self\'',
    },
  };

  // FIXME: not work in MV3
  if (isDev && false) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push('webNavigation')
  }

  return manifest;
}
