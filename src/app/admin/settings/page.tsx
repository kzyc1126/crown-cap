import Image from "next/image";
import { ConfirmButton, SettingsForm, SlideForm } from "@/components/admin";
import { Frame } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import { deleteSlide } from "@/server/actions";
import {
  getCollectionStats,
  getGallerySlides,
  getSiteSettings,
} from "@/server/queries";

export const metadata = { title: "Site figures" };

export default async function AdminSettingsPage() {
  const [settings, stats, slides] = await Promise.all([
    getSiteSettings(),
    getCollectionStats(),
    getGallerySlides(),
  ]);

  const counters = [
    { label: "Caps catalogued", value: stats.capsCatalogued },
    { label: "Countries", value: stats.countries },
    { label: "Duplicates to trade", value: stats.duplicatesForTrade },
    { label: "On the wishlist", value: stats.wishlistCount },
    { label: "Breweries", value: stats.breweries },
    { label: "Caps incl. spares", value: stats.capsIncludingSpares },
  ];

  return (
    <div className="grid gap-12">
      <section className="grid gap-6">
        <div>
          <h2 className="text-[28px]">Live figures</h2>
          <p className="dim mt-2 max-w-[62ch] text-[15px] leading-relaxed">
            Counted by the <code>collection_stats</code> view in the database, so they move
            on their own as caps are added, imported, edited or deleted — nothing
            here to keep up to date. The first four are the tiles on the home page.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] border-l border-t border-line">
          {counters.map((counter) => (
            <div
              key={counter.label}
              className="border-b border-r border-line px-5 py-4"
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 34,
                  lineHeight: 1,
                  color: "var(--accent-strong)",
                }}
              >
                {formatNumber(counter.value)}
              </div>
              <div className="ovr dimmer mt-2">{counter.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        <div>
          <h2 className="text-[28px]">Site details</h2>
          <p className="dim mt-2 max-w-[62ch] text-[15px] leading-relaxed">
            The name in the header and footer, and the year the collection started —
            the hero headline counts the years from it.
          </p>
        </div>
        <SettingsForm settings={settings} />
      </section>

      <section className="grid gap-6">
        <div>
          <h2 className="text-[28px]">Home slideshow</h2>
          <p className="dim mt-2 max-w-[62ch] text-[15px] leading-relaxed">
            Slides rotate every 5.6 seconds. Without a photo a slide shows its
            caption on a tinted panel.
          </p>
        </div>

        <div className="grid gap-5">
          {slides.map((slide) => (
            <Frame key={slide.id} className="grid gap-4 p-5">
              <div className="flex flex-wrap items-center gap-4">
                {slide.image ? (
                  <div className="relative h-16 w-28 overflow-hidden border border-line">
                    <Image
                      src={slide.image}
                      alt={slide.caption}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="ovr dimmer flex h-16 w-28 items-center justify-center border border-dashed border-line">
                    No photo
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>
                  {slide.caption}
                </div>
                <form action={deleteSlide} className="ml-auto">
                  <input type="hidden" name="id" value={slide.id} />
                  <ConfirmButton />
                </form>
              </div>
              <SlideForm slide={slide} />
            </Frame>
          ))}
        </div>

        <Frame className="p-5">
          <h3 className="mb-4 text-xl">Add a slide</h3>
          <SlideForm position={slides.length} />
        </Frame>
      </section>
    </div>
  );
}
