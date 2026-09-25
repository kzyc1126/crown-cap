import { SiteFooter, SiteHeader, TabBar } from "@/components/layout";
import {
  getCollectionStats,
  getSiteSettings,
  getTradableCaps,
} from "@/server/queries";

/** Chrome for the public site: header, footer and the mobile tab bar. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, stats, tradableCaps] = await Promise.all([
    getSiteSettings(),
    getCollectionStats(),
    getTradableCaps(),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col pb-[72px] md:pb-0">
      <SiteHeader ownerName={settings.ownerName} tradableCaps={tradableCaps} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter
        ownerName={settings.ownerName}
        totalCaps={stats.capsCatalogued}
        totalCountries={stats.countries}
      />
      <TabBar />
    </div>
  );
}
