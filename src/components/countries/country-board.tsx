"use client";

import { useMemo, useState } from "react";
import { CountryTile } from "@/components/countries/country-tile";
import { ChoiceChip, Field } from "@/components/ui";
import { UNPLACED_REGION, type CountryRow } from "@/lib/country-rows";

/** Continents first, then the two rows that are not continents. */
const REGION_ORDER = [
  "Europe",
  "Asia",
  "Africa",
  "Americas",
  "Oceania",
  "Antarctic",
  "Former states",
  UNPLACED_REGION,
];

const sortRegions = (a: string, b: string) => {
  const ai = REGION_ORDER.indexOf(a);
  const bi = REGION_ORDER.indexOf(b);
  return (ai === -1 ? REGION_ORDER.length : ai) - (bi === -1 ? REGION_ORDER.length : bi);
};

/**
 * The whole world, continent by continent. No dropdown: every country is a
 * tile on the page, so what is missing is as visible as what is collected.
 */
export function CountryBoard({ rows }: { rows: CountryRow[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [onlyCollected, setOnlyCollected] = useState(false);

  const regions = useMemo(() => {
    const seen = new Map<string, { total: number; collected: number }>();
    rows.forEach((row) => {
      const entry = seen.get(row.region) ?? { total: 0, collected: 0 };
      entry.total += 1;
      if (row.caps > 0) entry.collected += 1;
      seen.set(row.region, entry);
    });
    return [...seen.entries()].sort((a, b) => sortRegions(a[0], b[0]));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (region !== "All" && row.region !== region) return false;
      if (onlyCollected && row.caps === 0) return false;
      return !q || row.name.toLowerCase().includes(q);
    });
  }, [rows, query, region, onlyCollected]);

  const groups = useMemo(() => {
    const map = new Map<string, CountryRow[]>();
    filtered.forEach((row) => {
      const list = map.get(row.region);
      if (list) list.push(row);
      else map.set(row.region, [row]);
    });
    // caps first inside each continent, then the empty ones alphabetically
    map.forEach((list) =>
      list.sort((a, b) => b.caps - a.caps || a.name.localeCompare(b.name)),
    );
    return [...map.entries()].sort((a, b) => sortRegions(a[0], b[0]));
  }, [filtered]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end gap-7 border-b border-line pb-5">
        <Field id="country-q" label="Find a country" className="min-w-[230px] flex-1">
          <input
            id="country-q"
            type="text"
            className="input"
            placeholder="Indonesia, Peru, Malta…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>

        <div>
          <span className="field-label">Region</span>
          <div className="flex flex-wrap gap-2">
            <ChoiceChip active={region === "All"} onClick={() => setRegion("All")}>
              All
            </ChoiceChip>
            {regions.map(([name, count]) => (
              <ChoiceChip
                key={name}
                active={region === name}
                onClick={() => setRegion(name)}
                title={`${count.collected} of ${count.total} collected`}
              >
                {name}
              </ChoiceChip>
            ))}
          </div>
        </div>

        <div>
          <span className="field-label">Show</span>
          <ChoiceChip
            active={onlyCollected}
            onClick={() => setOnlyCollected((value) => !value)}
          >
            Collected only
          </ChoiceChip>
        </div>
      </div>

      {groups.map(([name, list]) => {
        const collected = list.filter((row) => row.caps > 0).length;

        return (
          <section key={name} className="mt-9">
            <div className="mb-4 flex items-baseline gap-4">
              <h3 className="text-2xl">{name}</h3>
              <span className="ovr dimmer">
                {collected} of {list.length} collected
              </span>
              <span className="rule" />
            </div>
            <div className="ctygrid">
              {list.map((row) => (
                <CountryTile key={row.code ?? row.name} row={row} />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <p className="dim mt-10 text-[15px]">No country matches that search.</p>
      ) : null}
    </>
  );
}
