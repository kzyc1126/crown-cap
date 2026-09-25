import { Hero, LatestEntries, MenuCards, StatsRow } from "@/components/home";
import {
  getCollectionStats,
  getGallerySlides,
  getOwnedCaps,
  getSiteSettings,
} from "@/server/queries";

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
