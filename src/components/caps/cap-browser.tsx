"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CapTile } from "@/components/caps/cap-tile";
import { ChoiceChip, Field, MultiSelect, PageHeader } from "@/components/ui";
import type { Cap, SortKey } from "@/lib/types";
import { sortOptions, type FacetOption } from "@/lib/caps";
import { pageWindow } from "@/lib/paging";

export type CapBrowserState = {
  q: string;
  countries: string[];
  products: string[];
  liners: string[];
  tradable: boolean;
  sort: SortKey;
  page: number;
};

/**
 * Cap grid with search, country / product / liner filters, sorting and paging.
 * All of that now runs in the database: this component only reflects the current
 * state (from the URL) and navigates to change it, so only one page of caps is
 * ever loaded. Search is debounced so typing doesn't fire a query per keystroke.
 */
export function CapBrowser({
  caps,
  total,
  grandTotal,
  perPage,
  facets,
  state,
  kicker,
  title,
  note,
  from,
  allowTrade,
  filter = null,
  hideCountryFacet = false,
}: {
  caps: Cap[];
  total: number;
  grandTotal: number;
  perPage: number;
  facets: { countries: FacetOption[]; products: FacetOption[]; liners: FacetOption[] };
  state: CapBrowserState;
  kicker: string;
  title: string;
  note: string;
  from: "collection" | "wishlist";
  allowTrade: boolean;
  /** set when the page is narrowed to one country, e.g. from /countries */
  filter?: { label: string; clearHref: string } | null;
  /** hide the country dropdown (already narrowed to one country) */
  hideCountryFacet?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  // The search box is controlled locally so typing stays instant; the URL (and
  // the query) is only updated once typing pauses.
  const [queryText, setQueryText] = useState(state.q);
  useEffect(() => setQueryText(state.q), [state.q]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const commit = (mutate: (params: URLSearchParams) => void, resetPage = true) => {
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
      commit((params) => {
        const term = value.trim();
        if (term) params.set("q", term);
        else params.delete("q");
      });
    }, 300);
  };

  const setMulti = (key: "countries" | "products" | "liners") => (values: string[]) =>
    commit((params) => {
      params.delete(key);
      values.forEach((value) => params.append(key, value));
    });

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, state.page), totalPages);
  const activeCount =
    state.countries.length +
    state.products.length +
    state.liners.length +
    (state.tradable ? 1 : 0);

  return (
    <div className="wrap flex-1 pb-18 pt-11">
      <PageHeader kicker={kicker} title={title} note={note} />

      {filter ? (
        <div className="mt-7 flex items-center gap-3">
          <span className="ovr dimmer">Showing</span>
          <span
            className="ovr px-3 py-2"
            style={{
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius)",
              color: "var(--accent-strong)",
            }}
          >
            {filter.label}
          </span>
          <Link href={filter.clearHref} className="ovr dimmer">
            Clear
          </Link>
        </div>
      ) : null}

      <div className="mt-8 border-b border-line pb-5">
        <div className="flex flex-wrap items-end gap-5">
          <Field id="q" label="Search" className="min-w-[230px] flex-1">
            <input
              id="q"
              type="text"
              className="input"
              placeholder="Bintang, Chimay, Belgium…"
              value={queryText}
              onChange={(event) => onSearch(event.target.value)}
            />
          </Field>

          {hideCountryFacet ? null : (
            <MultiSelect
              label="Country"
              placeholder="All countries"
              options={facets.countries}
              value={state.countries}
              onChange={setMulti("countries")}
              className="w-full sm:w-[200px]"
            />
          )}
          <MultiSelect
            label="Product"
            placeholder="All products"
            options={facets.products}
            value={state.products}
            onChange={setMulti("products")}
            className="w-full sm:w-[190px]"
          />
          <MultiSelect
            label="Liner"
            placeholder="All liners"
            options={facets.liners}
            value={state.liners}
            onChange={setMulti("liners")}
            className="w-full sm:w-[150px]"
          />

          <Field id="sort" label="Sort" className="w-full sm:w-[160px]">
            <select
              id="sort"
              className="input cursor-pointer"
              value={state.sort}
              onChange={(event) => commit((params) => params.set("sort", event.target.value))}
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          {allowTrade ? (
            <ChoiceChip
              active={state.tradable}
              onClick={() =>
                commit((params) => {
                  if (state.tradable) params.delete("trade");
                  else params.set("trade", "1");
                })
              }
            >
              Available for trade
            </ChoiceChip>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="ovr dimmer">
            {total} of {grandTotal}
          </span>
          {activeCount > 0 ? (
            <button
              type="button"
              className="ovr cursor-pointer"
              style={{ color: "var(--accent-strong)" }}
              onClick={() =>
                commit((params) => {
                  params.delete("countries");
                  params.delete("products");
                  params.delete("liners");
                  params.delete("trade");
                })
              }
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="capgrid mt-9"
        style={{ opacity: pending ? 0.6 : 1, transition: "opacity 120ms" }}
      >
        {caps.map((cap) => (
          <CapTile key={cap.id} cap={cap} from={from} showTrade={allowTrade} />
        ))}
      </div>

      {total === 0 ? (
        <p className="dim mt-10 text-[15px]">No caps match those filters.</p>
      ) : null}

      <div className="mt-11 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <span className="ovr dimmer">
          Page {current} of {totalPages} · {caps.length} caps shown
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="btn quiet px-3 sm:px-[18px]"
            disabled={current <= 1}
            onClick={() => commit((params) => params.set("page", String(current - 1)), false)}
          >
            Prev
          </button>
          {pageWindow(current, totalPages).map((pageNumber, i) =>
            pageNumber === null ? (
              <span key={`gap-${i}`} className="dimmer px-1">
                …
              </span>
            ) : (
              <ChoiceChip
                key={pageNumber}
                square
                ariaCurrent="page"
                active={pageNumber === current}
                onClick={() => commit((params) => params.set("page", String(pageNumber)), false)}
              >
                {pageNumber}
              </ChoiceChip>
            ),
          )}
          <button
            type="button"
            className="btn quiet px-3 sm:px-[18px]"
            disabled={current >= totalPages}
            onClick={() => commit((params) => params.set("page", String(current + 1)), false)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
