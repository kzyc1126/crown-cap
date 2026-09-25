import Link from "next/link";
import { CapTable } from "@/components/admin";
import { ALL_COUNTRIES } from "@/data/countries";
import { prisma } from "@/lib/db";

export const metadata = { title: "Caps" };

export default async function AdminCapsPage({
  searchParams,
}: PageProps<"/admin/caps">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const kind = typeof params.kind === "string" ? params.kind : "all";
  const saved = params.saved === "1";

  const caps = await prisma.cap.findMany({
    where: {
      ...(kind === "all" ? {} : { wish: kind === "wishlist" }),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { brewery: { contains: query } },
              { country: { contains: query } },
              { ref: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: [{ wish: "asc" }, { id: "asc" }],
    take: 500,
    select: {
      id: true,
      ref: true,
      name: true,
      brewery: true,
      country: true,
      liner: true,
      year: true,
      copies: true,
      wish: true,
      image: true,
    },
  });

  /* Dropdown choices: every country we know of plus whatever is already in
     use, and the liners already in use. */
  const [usedCountries, usedLiners] = await Promise.all([
    prisma.cap.findMany({ distinct: ["country"], select: { country: true } }),
    prisma.cap.findMany({ distinct: ["liner"], select: { liner: true } }),
  ]);
  const collator = new Intl.Collator("en");
  const countries = [
    ...new Set([...ALL_COUNTRIES.map((c) => c.name), ...usedCountries.map((c) => c.country)]),
  ].sort(collator.compare);
  const liners = usedLiners.map((l) => l.liner).sort(collator.compare);

  const filters = [
    { key: "all", label: "All" },
    { key: "collection", label: "Collection" },
    { key: "wishlist", label: "Wishlist" },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="q" className="field-label">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              className="input sm:w-72"
              placeholder="Name, brewery, country, ref…"
            />
          </div>
          <input type="hidden" name="kind" value={kind} />
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = filter.key === kind;
            return (
              <Link
                key={filter.key}
                href={`/admin/caps?kind=${filter.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className="ovr px-3 py-2"
                style={{
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  borderRadius: "var(--radius)",
                  background: active ? "var(--accent)" : "transparent",
                  color: active
                    ? "var(--accent-ink)"
                    : "color-mix(in srgb, var(--fg) 58%, transparent)",
                }}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <Link href="/admin/caps/new" className="btn solid ml-auto">
          Add a cap
        </Link>
      </div>

      {saved ? (
        <p className="ovr" style={{ color: "var(--accent-strong)" }}>
          Cap saved.
        </p>
      ) : null}

      <div className="ovr dimmer">{caps.length} rows</div>

      <CapTable key={`${kind}|${query}`} caps={caps} countries={countries} liners={liners} />
    </div>
  );
}
