export type { Cap, GallerySlide, SiteSetting, TradeRequest } from "@prisma/client";

export type StyleId = "verdigris" | "plate" | "industry";

export type SortKey = "newest" | "oldest" | "az" | "za";

/** Which facets to keep; an empty list means "all" for that facet. */
export type CapFilters = {
  countries: string[];
  products: string[];
  liners: string[];
};
