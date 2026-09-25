"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CapTile } from "@/components/caps/cap-tile";
import { ChoiceChip, Field, MultiSelect, PageHeader } from "@/components/ui";
import type { Cap, CapFilters, SortKey } from "@/lib/types";
import {
  emptyFilters,
  facetOptions,
  filterCaps,
  productOf,
  searchCaps,
  sortCaps,
  sortOptions,
} from "@/lib/caps";
import { pageWindow } from "@/lib/paging";

const PER_PAGE = 24;

/** Cap grid with search, country / product / liner filters, sorting and pagination. */
export function CapBrowser({
  caps,
  kicker,
  title,
  note,
  from,
  allowTrade,
  filter = null,
}: {
  caps: Cap[];
  kicker: string;
  title: string;
  note: string;
  from: "collection" | "wishlist";
  allowTrade: boolean;
  /** set when the page is narrowed to one country, e.g. from /countries */
  filter?: { label: string; clearHref: string } | null;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CapFilters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  const searched = useMemo(() => searchCaps(caps, query), [caps, query]);
  const filtered = useMemo(
    () => sortCaps(filterCaps(searched, filters), sort),
    [searched, filters, sort],
  );

  // Each dropdown counts against the other two filters, so the numbers say
  // what picking that option would actually leave.
  const facets = useMemo(
    () => ({
      countries: facetOptions(
        filterCaps(searched, { ...filters, countries: [] }),
        (cap) => cap.country,
        "alpha",
      ),
      products: facetOptions(
        filterCaps(searched, { ...filters, products: [] }),
        productOf,
        "count",
      ),
      liners: facetOptions(
        filterCaps(searched, { ...filters, liners: [] }),
        (cap) => cap.liner,
        "count",
      ),
    }),
    [searched, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const activeCount =
    filters.countries.length + filters.products.length + filters.liners.length;

  const setFacet = (key: keyof CapFilters) => (next: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: next }));
    setPage(1);
  };

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
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </Field>

          {filter ? null : (
            <MultiSelect
              label="Country"
              placeholder="All countries"
              options={facets.countries}
              value={filters.countries}
              onChange={setFacet("countries")}
              className="w-full sm:w-[200px]"
            />
          )}
          <MultiSelect
            label="Product"
            placeholder="All products"
            options={facets.products}
            value={filters.products}
            onChange={setFacet("products")}
            className="w-full sm:w-[190px]"
          />
          <MultiSelect
            label="Liner"
            placeholder="All liners"
            options={facets.liners}
            value={filters.liners}
            onChange={setFacet("liners")}
            className="w-full sm:w-[150px]"
          />

          <Field id="sort" label="Sort" className="w-full sm:w-[160px]">
            <select
              id="sort"
              className="input cursor-pointer"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortKey);
                setPage(1);
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="ovr dimmer">
            {filtered.length} of {caps.length}
          </span>
          {activeCount > 0 ? (
            <button
              type="button"
              className="ovr cursor-pointer"
              style={{ color: "var(--accent-strong)" }}
              onClick={() => {
                setFilters(emptyFilters);
                setPage(1);
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="capgrid mt-9">
        {slice.map((cap) => (
          <CapTile key={cap.id} cap={cap} from={from} showTrade={allowTrade} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="dim mt-10 text-[15px]">No caps match those filters.</p>
      ) : null}

      <div className="mt-11 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <span className="ovr dimmer">
          Page {current} of {totalPages} · {slice.length} caps shown
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="btn quiet px-3 sm:px-[18px]"
            disabled={current <= 1}
            onClick={() => setPage(Math.max(1, current - 1))}
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
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </ChoiceChip>
            ),
          )}
          <button
            type="button"
            className="btn quiet px-3 sm:px-[18px]"
            disabled={current >= totalPages}
            onClick={() => setPage(Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
