import type { Cap, CapFilters, SortKey } from "@/lib/types";
import { decadeOf, formatYear } from "@/lib/format";

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "az", label: "Name A–Z" },
  { key: "za", label: "Name Z–A" },
];

export const emptyFilters: CapFilters = { countries: [], products: [], liners: [] };

/** Label used in the Product filter for caps whose product was never recorded. */
export const UNSPECIFIED_PRODUCT = "Unspecified";

export const productOf = (cap: Pick<Cap, "product">) => cap.product ?? UNSPECIFIED_PRODUCT;

/**
 * Whether a cap can be asked for: owned, and with at least one spare to give
 * away. A single copy stays in the album and a wishlist entry isn't here yet.
 * Same rule as `duplicatesForTrade` in the collection_stats view, so the tiles
 * and the home page counter can never disagree.
 */
export function isTradable(cap: Pick<Cap, "wish" | "copies">) {
  return !cap.wish && cap.copies > 1;
}

/** Search by cap name, brewery or country. */
export function searchCaps(caps: Cap[], query: string): Cap[] {
  const q = query.trim().toLowerCase();
  if (!q) return caps;
  return caps.filter((cap) =>
    `${cap.name} ${cap.brewery} ${cap.country}`.toLowerCase().includes(q),
  );
}

/** Keep the caps matching every facet that has something selected. */
export function filterCaps(caps: Cap[], filters: CapFilters): Cap[] {
  const { countries, products, liners } = filters;
  if (!countries.length && !products.length && !liners.length) return caps;
  return caps.filter(
    (cap) =>
      (!countries.length || countries.includes(cap.country)) &&
      (!products.length || products.includes(productOf(cap))) &&
      (!liners.length || liners.includes(cap.liner)),
  );
}

/**
 * Catalogue numbers are handed out in order of entry, so "newest" is simply
 * the highest id — createdAt is the same minute for everything imported in
 * one go and cannot tell them apart.
 */
export function sortCaps(caps: Cap[], sort: SortKey): Cap[] {
  const byName = (a: Cap, b: Cap) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.id - b.id;
  const sorted = [...caps];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.id - a.id);
    case "oldest":
      return sorted.sort((a, b) => a.id - b.id);
    case "az":
      return sorted.sort(byName);
    case "za":
      return sorted.sort((a, b) => byName(b, a));
  }
}

export type FacetOption = { value: string; count: number };

/**
 * Distinct values of one field with how many caps carry each. Countries read
 * best alphabetically (there are 180-odd); the short lists go by count so the
 * common answer — Beer, Plastic — sits at the top.
 */
export function facetOptions(
  caps: Cap[],
  pick: (cap: Cap) => string,
  order: "alpha" | "count",
): FacetOption[] {
  const tally = new Map<string, number>();
  caps.forEach((cap) => {
    const value = pick(cap);
    tally.set(value, (tally.get(value) ?? 0) + 1);
  });
  const options = [...tally.entries()].map(([value, count]) => ({ value, count }));
  return options.sort((a, b) =>
    order === "count"
      ? b.count - a.count || a.value.localeCompare(b.value)
      : a.value.localeCompare(b.value),
  );
}

/** Specification rows for the detail page; empty fields are left out. */
export function capSpecs(cap: Cap): Array<[string, string]> {
  const rows: Array<[string, string] | null> = [
    ["ID", cap.ref.replace("·", " ")],
    ["Country", cap.country],
    ["Producer", cap.brewery],
    cap.product ? ["Product", cap.product] : null,
    ["Liner type", cap.liner],
    ["Type", cap.capType ?? "Bottle closure"],
    cap.factorySigns ? ["Factory signs", cap.factorySigns] : null,
    ["Year", formatYear(cap.year)],
    [
      "Copies",
      cap.wish ? "0 — wanted" : `${cap.copies}${cap.copies > 1 ? " (spares)" : ""}`,
    ],
    [
      "Status",
      cap.wish ? "Wanted" : isTradable(cap) ? "Open for trade" : "Not for trade",
    ],
  ];

  return rows.filter((row): row is [string, string] => row !== null);
}

export const capTags = (cap: Cap) => [
  cap.country,
  cap.liner,
  decadeOf(cap.year),
];
