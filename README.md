# MTG Proxy

Create printable Magic: The Gathering playtest cards from a deck list, directly in your browser.

[Open MTG Proxy](https://lksvn.com.br/mtg-proxy/)

[Open the Custom Card Editor](https://lksvn.com.br/mtg-proxy/#editor)

![MTG Proxy interface](docs/mtg-proxy.gif)

## Features

- Parse deck lists with optional quantities, set codes, and collector numbers
- Import plain-text deck lists
- Accept card names in any language and resolve them to English printings through Scryfall
- Autocomplete English card names by typing `@` followed by at least two characters
- Search available printings and update card previews
- Keep up to five recent deck lists in browser storage
- Remove individual saved lists or clear the complete history
- Download card lists as entered, without basic lands, or with names only
- Export printable PDFs for A4, A3, Letter, and Legal paper
- Configure gaps, crop marks, black corners, bleed, basic-land filtering, a deck-list page, and playtest watermarks
- Preview and export both faces of double-faced cards
- Retry failed card, printing, and preview-image requests independently
- Switch between English (US) and Portuguese (Brazil) interfaces
- Use light and dark color schemes
- Design a custom card in a native 1500 × 2100 Canvas preview
- Choose Box Topper, M15 Regular, M15 Extended Art, Snow, Borderless, or Promo Regular frames with automatic or manual colors
- Position artwork by dragging, wheel zoom, or transform controls
- Render card fonts, mana and loyalty symbols, reminder text, set symbols, and P/T
- Download custom cards as PNG at the default resolution or with 300/600 DPI metadata

The application is client-only. Deck lists remain in the browser except for card lookups sent to Scryfall.
Custom-card artwork and editor state remain in the current browser tab.

## Custom Card Editor

Open `#editor` or use the navigation link. The editor currently supports ordinary single-faced cards. Specialized layouts such as planeswalkers, Sagas, Battles, split cards, and double-faced cards are not yet supported.

Frame assets are sourced from Card Conjurer and documented alongside each family under [`public/img/frames`](public/img/frames).

## Card list format

Only the card name is required. Add one card per line:

```text
[quantity] card name [(set)] [collector number]
```

Examples:

```text
Lightning Bolt
4 Lightning Bolt
1 Black Lotus (lea) 232
2 Delver of Secrets (isd)
```

Card names may be supplied in any language. To search while typing, start a line with an optional quantity followed by `@`:

```text
@lightning
4 @counter
```
![Autocomplete card names](docs/autocomplete.gif)

Autocomplete suggestions are currently available in English and support the mouse, arrow keys, Enter, and Escape.

After loading a list, review the card previews, change any printings, choose the print settings, and download the PDF.

![Search and change a card printing](docs/printing-selection.gif)

## Development

Built with React, TypeScript, Vite, Sass, and pdf-lib.

Requires Node.js and npm:

```sh
npm install
npm run dev
```

Available checks:

```sh
npm test
npm run lint
npm run build
```

SVG icon types are generated automatically before development and production builds. To generate them manually:

```sh
npm run generate:icons
```

## Attribution and disclaimer

Card data and images are provided by [Scryfall](https://scryfall.com/).

This project is intended for personal, non-commercial playtesting. It is not affiliated with or endorsed by Wizards of the Coast.
