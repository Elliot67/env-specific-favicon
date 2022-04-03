<h1 align="center">Env Specific Favicon</h1>
<p align="center">Browser extension to customize favicons based on URL and title regex matching</p>

## Keep the fallback browser favicon

You can easily download the original favicon from your browser on the following links :

- Google Chrome : `chrome://favicon`
- Microsoft Edge : `edge://favicon`
- Mozilla Firefox : [source code](https://searchfox.org/mozilla-central/source/toolkit/themes/shared/icons/defaultFavicon.svg)

## Update manifest & PWA icons

Env Specific Favicon doesn't update `manifest.json` icons for performance reason. However, it can be easily implemented by downloading and modifying the source code. Partial support has been removed in [this commit](https://github.com/Elliot67/env-specific-favicon/commit/beab1d2073026354de540dc5e56a953c4372a5ab).

> Inspired by Brad Czerniak - [Development favicon](https://github.com/ao5357/development_favicon)
