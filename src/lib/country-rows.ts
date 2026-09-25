import { FORMER_COUNTRIES, WORLD_COUNTRIES } from "@/data/countries";
import type { CountryTally } from "@/server/queries";

export type CountryRow = {
  /** ISO code, a former-state code, or null for caps that name no country */
  code: string | null;
  name: string;
  flag: string;
  region: string;
  sovereign: boolean;
  caps: number;
};

/** Countries the caps could not be placed in — kept at the end of the list. */
export const UNPLACED_REGION = "Unplaced";

/**
 * Every country in the world, each carrying how many caps came from it, plus
 * the former states and the unplaceable rows the collection actually holds.
 * Countries with no caps stay in the list: the empty ones are the collection's
 * to-do list.
 */
export function buildCountryRows(tally: CountryTally[]): CountryRow[] {
  const caps = new Map(tally.filter((t) => t.code).map((t) => [t.code as string, t.caps]));

  const world = WORLD_COUNTRIES.map((country) => ({
    code: country.code,
    name: country.name,
    flag: country.flag,
    region: country.region,
    sovereign: country.sovereign,
    caps: caps.get(country.code) ?? 0,
  }));

  // former states are only worth a row once there is a cap from one
  const former = FORMER_COUNTRIES.filter((country) => caps.get(country.code)).map((country) => ({
    code: country.code,
    name: country.name,
    flag: country.flag,
    region: country.region,
    sovereign: false,
    caps: caps.get(country.code) as number,
  }));

  const unplaced = tally
    .filter((t) => !t.code)
    .map((t) => ({
      code: null,
      name: t.name,
      flag: "",
      region: UNPLACED_REGION,
      sovereign: false,
      caps: t.caps,
    }));

  return [...world, ...former, ...unplaced];
}

export type CountryTotals = {
  /** UN member states with at least one cap */
  collected: number;
  /** UN member states in the world */
  sovereign: number;
  /** every row with caps, territories and former states included */
  places: number;
  caps: number;
};

export function countryTotals(rows: CountryRow[]): CountryTotals {
  const sovereign = rows.filter((row) => row.sovereign);

  return {
    collected: sovereign.filter((row) => row.caps > 0).length,
    sovereign: sovereign.length,
    places: rows.filter((row) => row.caps > 0).length,
    caps: rows.reduce((sum, row) => sum + row.caps, 0),
  };
}
