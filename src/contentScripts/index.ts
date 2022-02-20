import { onMessage } from 'webext-bridge';
import { isNull, isDef } from '~/utils';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  let RUN_MANIFEST_REPLACEMENT = false;
  let MANIFEST_URL: string;

  const $manifest = document.querySelector('link[rel="manifest"]');
  if ($manifest) {
    const originalManifestUrl = $manifest?.getAttribute('href');
    $manifest.removeAttribute('href');
    if (isDef(originalManifestUrl)) {
      RUN_MANIFEST_REPLACEMENT = true;
      MANIFEST_URL = originalManifestUrl;
    }
  }

  onMessage('update-favicon', async ({ data }) => {
    const $head = document.querySelector('head');
    const LINK_ID = 'env-specific-favicon';

    if (isNull($head) || $head.querySelector(`#${LINK_ID}`)) {
      return;
    }

    const { favicon } = data;

    // Create a new favicon link.
    const $newFavicon = document.createElement('link');
    $newFavicon.setAttribute('id', LINK_ID);
    $newFavicon.setAttribute('rel', 'icon');
    $newFavicon.setAttribute('href', favicon);

    // Remove current favicon
    const $links = $head.querySelectorAll(
      `link:not(#${LINK_ID})[rel*="icon"], link:not(#${LINK_ID})[rel="apple-touch-startup-image"]`
    );
    // @ts-ignore
    for (const $link of $links) {
      $link.remove();
    }

    $head.prepend($newFavicon);

    // Replace the manifest
    if (RUN_MANIFEST_REPLACEMENT) {
      const manifest = await fetch(MANIFEST_URL).then((r) => r.json());
      manifest.icons.forEach((icon: any) => {
        icon.src = favicon; // TODO: Provide the right favicon size for each icon
      });
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
      const shortManifestUrl = URL.createObjectURL(blob);
      ($manifest as Element).setAttribute('href', shortManifestUrl);
    }
  });
})();
