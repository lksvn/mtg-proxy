# Frame definitions

Each file exports one group of frame definitions. `../frameFamilyRegistry.ts`
combines them; the editor and renderer still use the same registry.

- `m15.ts`: regular modern frames, Nyx, Snow, UB, borderless and extended art.
- `transform.ts` and `modal.ts`: ordinary double-faced treatments.
- `showcase.ts`: set-specific showcase treatments.
- `historical.ts`, `planeswalkers.ts`, `tokens.ts`, `sagas.ts`: their named families.
- `adventure.ts`, `battle.ts`, `case.ts`, `class.ts`, `leveler.ts`, `room.ts`, `split.ts`: specialized layouts.
- `shared.ts`: reusable layouts, fonts, footer settings, asset maps and fallbacks.

To tweak a frame, find its ID in the matching file. Its `layout` contains positions
and text sizes; `frames`, `pt` and masks select assets. Shared layouts are spread
first, then frame-specific overrides follow. Edit an override to affect one style;
edit the shared layout only when every consumer should change.

New styles also need an ID in `../frameFamilies.ts`, an option in
`../editorOptions.ts`, EN/PT-BR labels in `../../../i18n/messages.ts`, and the vault's
Frame Naming Reference. Keep assets under `public/img/frames/`; no asset paths
need to change when reorganizing these TypeScript files.
