import { ALL_COUNTRIES, WORLD_COUNTRIES, type WorldCountry } from "@/data/countries";

/** Lowercase, unaccent and strip punctuation, so "Côte d'Ivoire" == "cote d ivoire". */
function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Names the source data uses that ISO 3166 spells differently. */
const ALIASES: Record<string, string> = {
  "turkey": "TR",
  "czech republic": "CZ",
  "cote d ivoire": "CI",
  "cape verde": "CV",
  "burma": "MM",
  "macedonia": "MK",
  "holland": "NL",
  "korea south": "KR",
  "korea north": "KP",
  "congo republic of the": "CG",
  "congo democratic republic of the": "CD",
  "eswatini swaziland": "SZ",
  "virgin islands us": "VI",
  "virgin islands british": "VG",
  "soviet union": "SU",
  "ussr": "SU",
  "german democratic republic": "DD",
  "east germany": "DD",
  "czechoslovakia": "CS",
  "yugoslavia": "YU",
};

const byCode = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));

const byName = (() => {
  const map = new Map<string, WorldCountry>();
  const add = (key: string, country: WorldCountry) => {
    const k = normalise(key);
    if (k && !map.has(k)) map.set(k, country);
  };
  ALL_COUNTRIES.forEach((country) => add(country.name, country));
  return map;
})();

export function countryByCode(code: string | null | undefined) {
  return code ? byCode.get(code) ?? null : null;
}

/**
 * Resolve a country as written in the source data — "*Soviet Union",
 * "Korea (South)", "Turkey" — to one of our countries. Returns null for
 * "-Multiple countries", blanks and anything unrecognised.
 */
export function resolveCountry(raw: string | null | undefined): WorldCountry | null {
  if (!raw) return null;

  // the source marks former states with "*" and multi-country caps with "-"
  const cleaned = raw.replace(/^[*\-\s]+/, "").trim();
  if (!cleaned || /^multiple countries$/i.test(cleaned)) return null;

  const key = normalise(cleaned);
  const aliased = ALIASES[key];
  if (aliased) return byCode.get(aliased) ?? null;

  return byName.get(key) ?? null;
}

/** Emoji flag for a code, derived from the letters themselves. */
export function flagOf(code: string | null | undefined) {
  return countryByCode(code)?.flag || "";
}

/** Sovereign UN member states — what "195 countries" counts. */
export const SOVEREIGN_COUNT = WORLD_COUNTRIES.filter((c) => c.sovereign).length;
