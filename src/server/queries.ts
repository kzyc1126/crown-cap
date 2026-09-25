import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { SortKey } from "@/lib/types";
import { UNSPECIFIED_PRODUCT, type FacetOption } from "@/lib/caps";

/** Owned caps, newest catalogue number last; `where` narrows them further. */
export function getOwnedCaps(where: Prisma.CapWhereInput = {}) {
  return prisma.cap.findMany({
    where: { wish: false, ...where },
    orderBy: { id: "asc" },
  });
}

/**
 * The caps that can actually be asked for: owned, with a spare to give away.
 * Same rule as `duplicatesForTrade` in the collection_stats view and as
 * `isTradable` on the client.
 */
export function getTradableCaps() {
  return getOwnedCaps({ copies: { gt: 1 } });
}

export function getWishlistCaps() {
  return prisma.cap.findMany({ where: { wish: true }, orderBy: { id: "asc" } });
}

/** Newest few for the home page — avoids loading the whole collection for a slice. */
export function getLatestOwnedCaps(take = 6) {
  return prisma.cap.findMany({ where: { wish: false }, orderBy: { id: "asc" }, take });
}

// ── Paged, searchable, filterable cap browsing (server-side) ─────────────────
// The catalogue can run to tens of thousands of caps, so searching, filtering,
// sorting and paging all happen in the database and only one page of rows is
// sent to the client. Mirrors the semantics that used to live in src/lib/caps.ts.

export const CAPS_PER_PAGE = 24;

export type CapQuery = {
  q?: string;
  countries?: string[];
  products?: string[];
  liners?: string[];
  /** only caps with a spare to give away (owned, copies > 1) */
  tradable?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

/** Search across name, brewery and country (case-insensitive). */
function searchClause(q?: string): Prisma.CapWhereInput | null {
  const term = q?.trim();
  if (!term) return null;
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { brewery: { contains: term, mode: "insensitive" } },
      { country: { contains: term, mode: "insensitive" } },
    ],
  };
}

/** Product filter, where the "Unspecified" option means product IS NULL. */
function productsClause(products?: string[]): Prisma.CapWhereInput | null {
  if (!products?.length) return null;
  const named = products.filter((value) => value !== UNSPECIFIED_PRODUCT);
  const or: Prisma.CapWhereInput[] = [];
  if (named.length) or.push({ product: { in: named } });
  if (products.includes(UNSPECIFIED_PRODUCT)) or.push({ product: null });
  return or.length === 1 ? or[0] : { OR: or };
}

/**
 * base + search + the selected facets. `skip` leaves one facet out so its own
 * option counts reflect what picking each value would leave — matching the old
 * client-side facet behaviour where each dropdown counts against the other two.
 */
function capWhere(
  base: Prisma.CapWhereInput,
  query: CapQuery,
  skip?: "countries" | "products" | "liners",
): Prisma.CapWhereInput {
  const and: Prisma.CapWhereInput[] = [base];
  const search = searchClause(query.q);
  if (search) and.push(search);
  // "Available for trade" is a global narrowing like search — it applies to the
  // results and to every facet count, so it lives outside the skip logic.
  if (query.tradable) and.push({ copies: { gt: 1 } });
  if (skip !== "countries" && query.countries?.length) {
    and.push({ country: { in: query.countries } });
  }
  if (skip !== "products") {
    const products = productsClause(query.products);
    if (products) and.push(products);
  }
  if (skip !== "liners" && query.liners?.length) {
    and.push({ liner: { in: query.liners } });
  }
  return { AND: and };
}

/** Catalogue numbers are handed out in order of entry, so "newest" = highest id. */
function orderFor(sort: SortKey = "newest"): Prisma.CapOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ id: "asc" }];
    case "az":
      return [{ name: "asc" }, { id: "asc" }];
    case "za":
      return [{ name: "desc" }, { id: "asc" }];
    default:
      return [{ id: "desc" }];
  }
}

const byAlpha = (a: FacetOption, b: FacetOption) => a.value.localeCompare(b.value);
const byCount = (a: FacetOption, b: FacetOption) =>
  b.count - a.count || a.value.localeCompare(b.value);

/** One page of caps plus the totals and facet counts the browser needs. */
export async function getCapPage(base: Prisma.CapWhereInput, query: CapQuery) {
  const perPage = query.perPage ?? CAPS_PER_PAGE;
  const page = Math.max(1, query.page ?? 1);
  const where = capWhere(base, query);

  const [grandTotal, total, caps, countryRows, productRows, linerRows] = await Promise.all([
    prisma.cap.count({ where: base }),
    prisma.cap.count({ where }),
    prisma.cap.findMany({
      where,
      orderBy: orderFor(query.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.cap.groupBy({
      by: ["country"],
      where: capWhere(base, query, "countries"),
      _count: { _all: true },
    }),
    prisma.cap.groupBy({
      by: ["product"],
      where: capWhere(base, query, "products"),
      _count: { _all: true },
    }),
    prisma.cap.groupBy({
      by: ["liner"],
      where: capWhere(base, query, "liners"),
      _count: { _all: true },
    }),
  ]);

  const facets = {
    countries: countryRows
      .map((row) => ({ value: row.country, count: row._count._all }))
      .sort(byAlpha),
    products: productRows
      .map((row) => ({ value: row.product ?? UNSPECIFIED_PRODUCT, count: row._count._all }))
      .sort(byCount),
    liners: linerRows
      .map((row) => ({ value: row.liner, count: row._count._all }))
      .sort(byCount),
  };

  return { caps, total, grandTotal, page, perPage, facets };
}

/** One row per country the collection has caps from. */
export type CountryTally = {
  /** ISO code, or null for caps whose country could not be placed */
  code: string | null;
  /** the country as stored on the caps, used when there is no code */
  name: string;
  caps: number;
  /** one photo from that country, for the tile */
  image: string | null;
};

/**
 * Caps per country. Counted over the owned caps only — the wishlist is what is
 * still missing, so counting it would make the map look fuller than it is.
 */
export async function getCountryTally(): Promise<CountryTally[]> {
  const caps = await prisma.cap.findMany({
    where: { wish: false },
    select: { countryCode: true, country: true, image: true },
    orderBy: { id: "asc" },
  });

  const tally = new Map<string, CountryTally>();
  caps.forEach((cap) => {
    const key = cap.countryCode ?? `?${cap.country}`;
    const row = tally.get(key);
    if (row) {
      row.caps += 1;
      row.image ??= cap.image;
    } else {
      tally.set(key, {
        code: cap.countryCode,
        name: cap.country,
        caps: 1,
        image: cap.image,
      });
    }
  });

  return [...tally.values()].sort((a, b) => b.caps - a.caps);
}

export function getCapById(id: number) {
  return prisma.cap.findUnique({ where: { id } });
}

export function getGallerySlides() {
  return prisma.gallerySlide.findMany({ orderBy: { position: "asc" } });
}

/** The single settings row; created with defaults when missing. */
export async function getSiteSettings() {
  const existing = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (existing) return existing;

  return prisma.siteSetting.create({
    data: {
      id: 1,
      ownerName: "Filip’s Caps",
      startYear: new Date().getFullYear(),
    },
  });
}

export type CollectionStats = {
  capsCatalogued: number;
  countries: number;
  duplicatesForTrade: number;
  wishlistCount: number;
  breweries: number;
  capsIncludingSpares: number;
};

/**
 * Figures for the home page, read from the `collection_stats` SQL view
 * (see prisma/migrations/*_collection_stats_view). Counting happens in the database, so the
 * numbers always match the rows — no counters to keep in sync.
 */
export async function getCollectionStats(): Promise<CollectionStats> {
  const rows = await prisma.$queryRaw<
    Array<Record<keyof CollectionStats, bigint | number>>
  >`SELECT * FROM collection_stats`;

  const row = rows[0];
  const toNumber = (value: bigint | number | undefined) => Number(value ?? 0);

  return {
    capsCatalogued: toNumber(row?.capsCatalogued),
    countries: toNumber(row?.countries),
    duplicatesForTrade: toNumber(row?.duplicatesForTrade),
    wishlistCount: toNumber(row?.wishlistCount),
    breweries: toNumber(row?.breweries),
    capsIncludingSpares: toNumber(row?.capsIncludingSpares),
  };
}

export function getTradeRequests() {
  return prisma.tradeRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { cap: true, offeredCap: true } } },
  });
}

/** Counters for the admin dashboard: the view plus request counts. */
export async function getAdminStats() {
  const [stats, newRequests, totalRequests] = await Promise.all([
    getCollectionStats(),
    prisma.tradeRequest.count({ where: { status: "new" } }),
    prisma.tradeRequest.count(),
  ]);

  return { ...stats, newRequests, totalRequests };
}
