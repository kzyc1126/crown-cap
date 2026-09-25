import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CountryRow } from "@/lib/country-rows";

/**
 * One country in the index. Countries with caps are tiles that open the
 * collection filtered to them; the rest stay on the page, greyed out — the
 * gaps are the point of showing all of them.
 */
export function CountryTile({ row }: { row: CountryRow }) {
  const has = row.caps > 0;

  const body = (
    <>
      <span
        aria-hidden
        className={cn("leading-none", has ? "" : "opacity-30 grayscale")}
        style={{ fontSize: 30 }}
      >
        {row.flag || "⌗"}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn("block truncate", has ? "" : "dim")}
          style={{ fontFamily: "var(--font-display)", fontSize: 18 }}
        >
          {row.name}
        </span>
        <span className="ovr dimmer block" style={{ fontSize: 10 }}>
          {has ? `${row.caps} ${row.caps === 1 ? "cap" : "caps"}` : "Not yet"}
          {row.sovereign ? "" : " · territory"}
        </span>
      </span>
    </>
  );

  if (!has) {
    return (
      <div
        className="flex items-center gap-3 px-3.5 py-3"
        style={{
          border: "1px dashed var(--line)",
          borderRadius: "var(--radius)",
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={row.code ? `/collection?country=${row.code}` : `/collection?place=${encodeURIComponent(row.name)}`}
      className="tile flex-row items-center gap-3 px-3.5 py-3 text-fg hover:text-fg"
      style={{ gap: 12 }}
    >
      {body}
    </Link>
  );
}
