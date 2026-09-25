import type { Metadata } from "next";
import { CapBrowser } from "@/components/caps";
import type { SortKey } from "@/lib/types";
import { getCapPage } from "@/server/queries";

export const metadata: Metadata = { title: "My wishlist" };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || null;

const many = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

const SORTS = new Set<SortKey>(["newest", "oldest", "az", "za"]);
const asSort = (value: string | null): SortKey =>
  value && SORTS.has(value as SortKey) ? (value as SortKey) : "newest";

export default async function WishlistPage({ searchParams }: PageProps<"/wishlist">) {
  const params = await searchParams;
  const query = {
    q: first(params.q) ?? "",
    countries: many(params.countries),
    products: many(params.products),
    liners: many(params.liners),
    tradable: false,
    sort: asSort(first(params.sort)),
    page: Number(first(params.page)) || 1,
  };

  const { caps, total, grandTotal, page, perPage, facets } = await getCapPage(
    { wish: true },
    query,
  );

  return (
    <CapBrowser
      caps={caps}
      total={total}
      grandTotal={grandTotal}
      perPage={perPage}
      facets={facets}
      state={{ ...query, page }}
      kicker="The wants"
      title="My wishlist"
      note="Caps I'm hunting. Nothing here can be marked — it's what I want in return."
      from="wishlist"
      allowTrade={false}
    />
  );
}
