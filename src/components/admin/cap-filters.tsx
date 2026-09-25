"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChoiceChip, MultiSelect } from "@/components/ui";
import type { FacetOption } from "@/lib/caps";

type Facets = { countries: FacetOption[]; products: FacetOption[]; liners: FacetOption[] };

export type AdminFilterState = {
  kind: "all" | "collection" | "wishlist";
  q: string;
  countries: string[];
  products: string[];
  liners: string[];
  tradable: boolean;
};

const KINDS: Array<{ key: AdminFilterState["kind"]; label: string }> = [
  { key: "all", label: "All" },
  { key: "collection", label: "Collection" },
  { key: "wishlist", label: "Wishlist" },
];

/** Search + list + country / product / liner + trade filters for the admin table. */
export function CapFilters({
  facets,
  state,
  total,
  grandTotal,
}: {
  facets: Facets;
  state: AdminFilterState;
  total: number;
  grandTotal: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [queryText, setQueryText] = useState(state.q);
  useEffect(() => setQueryText(state.q), [state.q]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const commit = (mutate: (p: URLSearchParams) => void, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    if (resetPage) params.delete("page");
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const onSearch = (value: string) => {
    setQueryText(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      commit((p) => {
        const term = value.trim();
        if (term) p.set("q", term);
        else p.delete("q");
      });
    }, 300);
  };

  const setMulti = (key: "countries" | "products" | "liners") => (values: string[]) =>
    commit((p) => {
      p.delete(key);
      values.forEach((v) => p.append(key, v));
    });

  const activeCount =
    state.countries.length + state.products.length + state.liners.length + (state.tradable ? 1 : 0);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <input
            id="q"
            className="input"
            placeholder="Name, brewery, country, ref…"
            value={queryText}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <MultiSelect
          label="Country"
          placeholder="All countries"
          options={facets.countries}
          value={state.countries}
          onChange={setMulti("countries")}
          className="w-full sm:w-[190px]"
        />
        <MultiSelect
          label="Product"
          placeholder="All products"
          options={facets.products}
          value={state.products}
          onChange={setMulti("products")}
          className="w-full sm:w-[180px]"
        />
        <MultiSelect
          label="Liner"
          placeholder="All liners"
          options={facets.liners}
          value={state.liners}
          onChange={setMulti("liners")}
          className="w-full sm:w-[150px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((item) => (
          <ChoiceChip
            key={item.key}
            active={state.kind === item.key}
            onClick={() => commit((p) => (item.key === "all" ? p.delete("kind") : p.set("kind", item.key)))}
          >
            {item.label}
          </ChoiceChip>
        ))}
        <ChoiceChip
          active={state.tradable}
          onClick={() =>
            commit((p) => (state.tradable ? p.delete("trade") : p.set("trade", "1")))
          }
        >
          Available for trade
        </ChoiceChip>

        <span className="ovr dimmer ml-1">
          {total} of {grandTotal}
        </span>
        {activeCount > 0 || state.q ? (
          <button
            type="button"
            className="ovr cursor-pointer"
            style={{ color: "var(--accent-strong)" }}
            onClick={() =>
              commit((p) => {
                ["q", "countries", "products", "liners", "trade"].forEach((k) => p.delete(k));
              })
            }
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
