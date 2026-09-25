import { formatNumber } from "@/lib/format";
import type { CollectionStats } from "@/server/queries";

/** The four counters, read live from the collection_stats view. */
export function StatsRow({ stats }: { stats: CollectionStats }) {
  const tiles = [
    { value: stats.capsCatalogued, label: "Caps catalogued" },
    { value: stats.countries, label: "Countries" },
    { value: stats.duplicatesForTrade, label: "Duplicates to trade" },
    { value: stats.wishlistCount, label: "On the wishlist" },
  ];

  return (
    <section className="wrap pt-13">
      <div className="grid grid-cols-2 border-l md:grid-cols-4 border-t border-line">
        {tiles.map((tile) => (
          <div key={tile.label} className="border-b border-r border-line px-4 py-5 sm:px-6">
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 48,
                lineHeight: 1,
                color: "var(--accent-strong)",
              }}
            >
              {formatNumber(tile.value)}
            </div>
            <div className="ovr dimmer mt-2">{tile.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
