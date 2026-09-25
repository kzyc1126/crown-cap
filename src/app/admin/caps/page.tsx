import Link from "next/link";
import { CapFilters, CapTable, type AdminFilterState } from "@/components/admin";
import { ALL_COUNTRIES } from "@/data/countries";
import { prisma } from "@/lib/db";
import { pageWindow } from "@/lib/paging";
import { getAdminCapPage } from "@/server/queries";

export const metadata = { title: "Caps" };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || null;
const many = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];
const asKind = (value: string | null): AdminFilterState["kind"] =>
  value === "collection" || value === "wishlist" ? value : "all";

export default async function AdminCapsPage({
  searchParams,
}: PageProps<"/admin/caps">) {
  const params = await searchParams;
  const state: AdminFilterState = {
    kind: asKind(first(params.kind)),
    q: first(params.q) ?? "",
    countries: many(params.countries),
    products: many(params.products),
    liners: many(params.liners),
    tradable: first(params.trade) === "1",
  };
  const page = Number(first(params.page)) || 1;
  const saved = params.saved === "1";

  const { caps, total, grandTotal, page: current, perPage, facets } =
    await getAdminCapPage({ ...state, page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  /* Dropdown choices for inline editing: every country we know of plus whatever
     is in use, and the liners in use. */
  const [usedCountries, usedLiners] = await Promise.all([
    prisma.cap.findMany({ distinct: ["country"], select: { country: true } }),
    prisma.cap.findMany({ distinct: ["liner"], select: { liner: true } }),
  ]);
  const collator = new Intl.Collator("en");
  const countries = [
    ...new Set([...ALL_COUNTRIES.map((c) => c.name), ...usedCountries.map((c) => c.country)]),
  ].sort(collator.compare);
  const liners = usedLiners.map((l) => l.liner).sort(collator.compare);

  const hrefFor = (target: number) => {
    const sp = new URLSearchParams();
    if (state.q) sp.set("q", state.q);
    if (state.kind !== "all") sp.set("kind", state.kind);
    state.countries.forEach((c) => sp.append("countries", c));
    state.products.forEach((p) => sp.append("products", p));
    state.liners.forEach((l) => sp.append("liners", l));
    if (state.tradable) sp.set("trade", "1");
    if (target > 1) sp.set("page", String(target));
    const qs = sp.toString();
    return qs ? `/admin/caps?${qs}` : "/admin/caps";
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-[26px]">Caps</h2>
        <Link href="/admin/caps/new" className="btn solid ml-auto">
          Add a cap
        </Link>
      </div>

      <CapFilters facets={facets} state={state} total={total} grandTotal={grandTotal} />

      {saved ? (
        <p className="ovr" style={{ color: "var(--accent-strong)" }}>
          Cap saved.
        </p>
      ) : null}

      <CapTable key={hrefFor(current)} caps={caps} countries={countries} liners={liners} />

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <span className="ovr dimmer">
            Page {current} of {totalPages} · {caps.length} shown
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {current > 1 ? (
              <Link href={hrefFor(current - 1)} className="btn quiet px-3 sm:px-[18px]">
                Prev
              </Link>
            ) : (
              <span className="btn quiet px-3 sm:px-[18px]" style={{ opacity: 0.4 }}>
                Prev
              </span>
            )}
            {pageWindow(current, totalPages).map((n, i) =>
              n === null ? (
                <span key={`gap-${i}`} className="dimmer px-1">
                  …
                </span>
              ) : (
                <Link
                  key={n}
                  href={hrefFor(n)}
                  className="ovr px-3 py-2"
                  aria-current={n === current ? "page" : undefined}
                  style={{
                    border: `1px solid ${n === current ? "var(--accent)" : "var(--line)"}`,
                    borderRadius: "var(--radius)",
                    background: n === current ? "var(--accent)" : "transparent",
                    color: n === current
                      ? "var(--accent-ink)"
                      : "color-mix(in srgb, var(--fg) 62%, transparent)",
                  }}
                >
                  {n}
                </Link>
              ),
            )}
            {current < totalPages ? (
              <Link href={hrefFor(current + 1)} className="btn quiet px-3 sm:px-[18px]">
                Next
              </Link>
            ) : (
              <span className="btn quiet px-3 sm:px-[18px]" style={{ opacity: 0.4 }}>
                Next
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
