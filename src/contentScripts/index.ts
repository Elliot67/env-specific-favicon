import { onMessage } from 'webext-bridge';
import { isNull } from '~/utils';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  onMessage('update-favicon', ({ data }) => {
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
  });
})();
