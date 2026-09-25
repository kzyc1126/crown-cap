import type { Metadata } from "next";
import { CapBrowser } from "@/components/caps";
import { countryByCode } from "@/lib/countries";
import { getOwnedCaps } from "@/server/queries";

export const metadata: Metadata = { title: "My collection" };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || null;

export default async function CollectionPage({ searchParams }: PageProps<"/collection">) {
  const params = await searchParams;
  // ?country=ID comes from the country index; ?place=… covers the rows that
  // have no ISO code of their own ("Multiple countries", "Unknown")
  const code = first(params.country);
  const place = first(params.place);

  const country = code ? countryByCode(code) : null;
  const where = country
    ? { countryCode: country.code }
    : place
      ? { country: place, countryCode: null }
      : {};

  const caps = await getOwnedCaps(where);
  const label = country?.name ?? place ?? null;

  return (
    <CapBrowser
      caps={caps}
      kicker="The catalogue"
      title="My collection"
      note="Open a cap for its full record. Duplicates can be marked and sent as one request."
      from="collection"
      allowTrade
      filter={
        label
          ? { label: `${country?.flag ? `${country.flag} ` : ""}${label}`, clearHref: "/collection" }
          : null
      }
    />
  );
}
