import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

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
 * (see prisma/migrations/*_derive_stats). Counting happens in MySQL, so the
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
