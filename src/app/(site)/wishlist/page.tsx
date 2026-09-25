import type { Metadata } from "next";
import { CapBrowser } from "@/components/caps";
import { getWishlistCaps } from "@/server/queries";

export const metadata: Metadata = { title: "My wishlist" };

// Static (ISR), refreshed every 10 minutes — served from the CDN, not a function.
export const revalidate = 600;

export default async function WishlistPage() {
  const caps = await getWishlistCaps();

  return (
    <CapBrowser
      caps={caps}
      kicker="The wants"
      title="My wishlist"
      note="Caps I'm hunting. Nothing here can be marked — it's what I want in return."
      from="wishlist"
      allowTrade={false}
    />
  );
}
