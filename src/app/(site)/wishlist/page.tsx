import type { Metadata } from "next";
import { CapBrowser } from "@/components/caps";
import { getWishlistCaps } from "@/server/queries";

export const metadata: Metadata = { title: "My wishlist" };

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
