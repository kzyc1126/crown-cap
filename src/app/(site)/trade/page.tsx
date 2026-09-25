import type { Metadata } from "next";
import { TradeForm } from "@/components/trade";
import { getTradableCaps, getWishlistCaps } from "@/server/queries";

export const metadata: Metadata = { title: "Trade with me" };

// Static (ISR), refreshed every 10 minutes — served from the CDN, not a function.
export const revalidate = 600;

export default async function TradePage() {
  const [caps, wishlist] = await Promise.all([
    getTradableCaps(),
    getWishlistCaps(),
  ]);

  return <TradeForm caps={caps} wishlist={wishlist} />;
}
