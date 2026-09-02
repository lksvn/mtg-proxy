# MTG Proxy

Create printable Magic: The Gathering playtest cards from a deck list, directly in your browser.

[Open MTG Proxy](https://lksvn.com.br/mtg-proxy/)

![MTG Proxy interface](docs/mtg-proxy.png)

## Features

- Parse deck lists with optional quantities, set codes, and collector numbers
- Import plain-text deck lists
- Accept card names in any language and resolve them to English printings through Scryfall
- Autocomplete English card names by typing `@` followed by at least two characters
- Search available printings and update card previews
- Keep up to five recent deck lists in browser storage
- Save the current card list as a text backup
- Export printable PDFs for A4, A3, Letter, and Legal paper
- Configure gaps, crop marks, black corners, bleed, basic-land filtering, a deck-list page, and playtest watermarks
- Export both faces of double-faced cards
- Use light and dark color schemes

The application is client-only. Deck lists remain in the browser except for card lookups sent to Scryfall.

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

Autocomplete suggestions are currently available in English and support the mouse, arrow keys, Enter, and Escape.

After loading a list, review the card previews, change any printings, choose the print settings, and download the PDF.

![Search and change a card printing](docs/printing-selection.png)

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

## Roadmap

- Support English (US) and Portuguese (Brazil) interfaces based on the user's language preference
- Add card-list download options: as entered, without basic lands, or cleaned of set codes and collector numbers
- Remove individual lists from history while keeping the option to clear all history
- Show both card faces when available, with the back face behind the front and revealed on hover
- Improve accessibility and keyboard testing
- Improve network and image error feedback

## Attribution and disclaimer

Card data and images are provided by [Scryfall](https://scryfall.com/).

This project is intended for personal, non-commercial playtesting. It is not affiliated with or endorsed by Wizards of the Coast.
