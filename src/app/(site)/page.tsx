import { Hero, LatestEntries, MenuCards, StatsRow } from "@/components/home";
import {
  getCollectionStats,
  getGallerySlides,
  getOwnedCaps,
  getSiteSettings,
} from "@/server/queries";

// Rebuilt as static (ISR) and refreshed every 10 minutes, so the home page is
// served from the CDN instead of a per-request serverless function.
export const revalidate = 600;

export default async function HomePage() {
  const [settings, stats, slides, caps] = await Promise.all([
    getSiteSettings(),
    getCollectionStats(),
    getGallerySlides(),
    getOwnedCaps(),
  ]);

  return (
    <>
      <Hero slides={slides} startYear={settings.startYear} />
      <StatsRow stats={stats} />
      <MenuCards />
      <LatestEntries caps={caps.slice(0, 6)} totalCaps={stats.capsCatalogued} />
    </>
  );
}
