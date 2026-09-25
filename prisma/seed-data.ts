/**
 * Rows that are not caps: the site settings and the home page slideshow.
 *
 * The caps themselves are not fixtures any more — they come from the
 * crowncaps.info scrape via `npm run db:import` (prisma/import-caps.ts).
 */

export const SLIDES = [
  { caption: "Collection wall", image: null, position: 0 },
  { caption: "Belgian rarities", image: null, position: 1 },
  { caption: "Liner detail", image: null, position: 2 },
];

export const SETTINGS = {
  ownerName: "Filip’s Caps",
  startYear: 2016,
};
