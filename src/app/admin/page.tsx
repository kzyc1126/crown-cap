import Link from "next/link";
import { Frame } from "@/components/ui";
import { formatDate, formatNumber } from "@/lib/format";
import { getAdminStats, getTradeRequests } from "@/server/queries";

export default async function AdminDashboard() {
  const [stats, requests] = await Promise.all([
    getAdminStats(),
    getTradeRequests(),
  ]);

  const tiles = [
    { label: "Caps catalogued", value: stats.capsCatalogued, href: "/admin/caps" },
    {
      label: "On the wishlist",
      value: stats.wishlistCount,
      href: "/admin/caps?kind=wishlist",
    },
    { label: "Countries", value: stats.countries, href: "/admin/caps" },
    {
      label: "New trade requests",
      value: stats.newRequests,
      href: "/admin/requests",
    },
  ];

  return (
    <div className="grid gap-10">
      <section>
        <div className="grid grid-cols-2 border-l md:grid-cols-4 border-t border-line">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="border-b border-r border-line px-4 py-5 sm:px-6 text-fg hover:text-fg"
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 44,
                  lineHeight: 1,
                  color: "var(--accent-strong)",
                }}
              >
                {formatNumber(tile.value)}
              </div>
              <div className="ovr dimmer mt-2">{tile.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-baseline gap-4.5">
          <h2 className="text-2xl">Latest trade requests</h2>
          <span className="rule" />
          <Link href="/admin/requests" className="ovr">
            All {stats.totalRequests}
          </Link>
        </div>

        {requests.length === 0 ? (
          <Frame className="p-8 text-center">
            <p className="dim m-0">No trade requests yet.</p>
          </Frame>
        ) : (
          <div className="grid gap-4">
            {requests.slice(0, 4).map((request) => (
              <Frame key={request.id} className="flex flex-wrap items-center gap-4 p-5">
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                    {request.name}
                  </div>
                  <div className="ovr dimmer mt-1">{request.contact}</div>
                </div>
                <div className="ovr dim ml-auto">
                  {request.items.length} cap{request.items.length === 1 ? "" : "s"} ·{" "}
                  {formatDate(request.createdAt)}
                </div>
                <span
                  className="ovr px-3 py-1.5"
                  style={{
                    border: "1px solid var(--line)",
                    color:
                      request.status === "new"
                        ? "var(--accent-strong)"
                        : "color-mix(in srgb, var(--fg) 55%, transparent)",
                  }}
                >
                  {request.status}
                </span>
              </Frame>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-baseline gap-4.5">
          <h2 className="text-2xl">Quick actions</h2>
          <span className="rule" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/caps/new" className="btn solid">
            Add a cap
          </Link>
          <Link href="/admin/import" className="btn">
            Bulk import
          </Link>
          <Link href="/admin/settings" className="btn">
            Edit site figures
          </Link>
        </div>
      </section>
    </div>
  );
}
