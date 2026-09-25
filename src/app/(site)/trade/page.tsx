import type { Metadata } from "next";
import { TradeForm } from "@/components/trade";
import { getTradableCaps, getWishlistCaps } from "@/server/queries";

export const metadata: Metadata = { title: "Trade with me" };

export default async function TradePage() {
  const [caps, wishlist] = await Promise.all([
    getTradableCaps(),
    getWishlistCaps(),
  ]);

  return <TradeForm caps={caps} wishlist={wishlist} />;
}
