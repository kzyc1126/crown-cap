import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const db = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });
const r = await db.tradeRequest.findUnique({
  where: { id: 5 },
  include: { items: { include: { cap: true, offeredCap: true } } },
});
console.log(JSON.stringify(r!.items.map((i) => ({
  offeredCap: i.offeredCap?.name ?? null,
  offerName: i.offerName, offerBrewery: i.offerBrewery, offerCountry: i.offerCountry,
  offerYear: i.offerYear, offerFactorySigns: i.offerFactorySigns,
})), null, 2));
await db.$disconnect();
