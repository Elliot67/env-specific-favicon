<p align="center"><img width="150" src="./src/assets/static/icon.svg" alt="Custom Favicon"></p>

<h1 align="center">Custom Favicon</h1>
<p align="center">Browser extension to customize favicons based on URL and title regex matching</p>

> [!NOTE]
> Env Specific Favicon is now Custom Favicon

Target any webpages with its URL or title and change its favicon. This enables you to differentiate favicons shared across multiple websites or environments.

If your rule isn't working, make sure your pattern is correct with online tools like [regex101](https://regex101.com).

## Installation

The extension is available on all chromium based browser (Google Chrome, Microsoft Edge, Opera, Brave) from [the chrome web store](https://chrome.google.com/webstore/detail/custom-favicon/licfgcgpjgbbankegljcpbklabdnmopl).

Support for Firefox will be possible once the [Navigation API](https://bugzilla.mozilla.org/show_bug.cgi?id=1777171) is implemented.

## Development

The project architecture is based on the [vitesse-webext template](https://github.com/antfu/vitesse-webext).

## Additionnal informations

### Keep the fallback browser favicon

You can easily download the default favicon of your browser :

- For **chromium based browsers**, the favicon can be retrieved at `chrome://favicon`, `edge://favicon`, ...
- For **Mozilla Firefox**, the favicon can be downloaded from [the source code](https://searchfox.org/mozilla-central/source/toolkit/themes/shared/icons/defaultFavicon.svg)

### Update manifest & PWA icons

Custom Favicon doesn't update `manifest.json` icons for performance reason. However, it can be easily implemented by downloading and modifying the source code. Partial support has been removed in [this commit](https://github.com/Elliot67/custom-favicon/commit/beab1d2073026354de540dc5e56a953c4372a5ab).

> Inspired by Brad Czerniak - [Development favicon](https://github.com/ao5357/development_favicon)
