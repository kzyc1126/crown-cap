import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { CapBrowser } from "@/components/caps";
import { countryByCode } from "@/lib/countries";
import type { SortKey } from "@/lib/types";
import { getCapPage } from "@/server/queries";

export const metadata: Metadata = { title: "My collection" };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || null;

const many = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

const SORTS = new Set<SortKey>(["newest", "oldest", "az", "za"]);
const asSort = (value: string | null): SortKey =>
  value && SORTS.has(value as SortKey) ? (value as SortKey) : "newest";

export default async function CollectionPage({ searchParams }: PageProps<"/collection">) {
  const params = await searchParams;
  // ?country=ID comes from the country index; ?place=… covers the rows that
  // have no ISO code of their own ("Multiple countries", "Unknown")
  const code = first(params.country);
  const place = first(params.place);

  const country = code ? countryByCode(code) : null;
  const narrow: Prisma.CapWhereInput = country
    ? { countryCode: country.code }
    : place
      ? { country: place, countryCode: null }
      : {};
  const base: Prisma.CapWhereInput = { wish: false, ...narrow };

  const query = {
    q: first(params.q) ?? "",
    countries: many(params.countries),
    products: many(params.products),
    liners: many(params.liners),
    sort: asSort(first(params.sort)),
    page: Number(first(params.page)) || 1,
  };

  const { caps, total, grandTotal, page, perPage, facets } = await getCapPage(base, query);
  const label = country?.name ?? place ?? null;

  return (
    <CapBrowser
      caps={caps}
      total={total}
      grandTotal={grandTotal}
      perPage={perPage}
      facets={facets}
      state={{ ...query, page }}
      kicker="The catalogue"
      title="My collection"
      note="Open a cap for its full record. Duplicates can be marked and sent as one request."
      from="collection"
      allowTrade
      hideCountryFacet={Boolean(country || place)}
      filter={
        label
          ? { label: `${country?.flag ? `${country.flag} ` : ""}${label}`, clearHref: "/collection" }
          : null
      }
    />
  );
}
