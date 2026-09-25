import { formatYear } from "@/lib/format";

/** The offered-cap columns of a TradeRequestItem, as stored. */
export type OfferedCapFields = {
  offerName: string | null;
  offerBrewery: string | null;
  offerCountry: string | null;
  offerLiner: string | null;
  offerYear: number | null;
  offerProduct: string | null;
  offerCapType: string | null;
  offerFactorySigns: string | null;
};

/**
 * The offered cap's own fields as label/value rows, empty ones left out — laid
 * out like the spec table on a cap page. Shared by /admin/requests and the
 * notification e-mail so the two never describe the same offer differently.
 */
export function offeredCapSpecs(item: OfferedCapFields): Array<[string, string]> {
  const rows: Array<[string, string | null]> = [
    ["Country", item.offerCountry],
    ["Producer", item.offerBrewery],
    ["Product", item.offerProduct],
    ["Liner", item.offerLiner],
    ["Type", item.offerCapType],
    ["Year", item.offerYear === null ? null : formatYear(item.offerYear)],
    ["Factory signs", item.offerFactorySigns],
  ];

  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}
