# MTG Proxy

A browser-based tool for turning Magic: The Gathering deck lists into printable playtest card PDFs.

Try it at [lksvn.com.br/mtg-proxy](https://lksvn.com.br/mtg-proxy/).

## Features

- Loads card names and specific printings from Scryfall
- Supports quantities, set codes, and collector numbers
- Lets you preview cards and change their printing
- Saves the selected card list as a text backup
- Exports PDFs for common paper sizes
- Supports gaps, bleed, crop marks, black corners, basic-land filtering, deck lists, and playtest watermarks

Example input:

```text
4 Lightning Bolt
1 Black Lotus (lea) 232
2 Delver of Secrets (isd)
```

## Development

Requires Node.js and npm.

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm test
npm run build
npm run lint
```

Pushes to `main` are automatically deployed through GitHub Pages.

## Roadmap

- [x] Import deck lists from text files
- [ ] Search available card printings
- [ ] Keep a small list of previous deck lists in the browser
- [ ] Improve accessibility, error handling, and mobile layout

Importing directly from Moxfield URLs is deferred because its unofficial API
is not reliably available to browser-only applications.

## Attribution

Card data and images are provided by [Scryfall](https://scryfall.com/).

This project is intended for personal playtesting. It is not affiliated with or endorsed by Wizards of the Coast.
