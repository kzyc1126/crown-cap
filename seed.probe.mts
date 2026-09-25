import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

const want = (await db.cap.findFirst({ where: { wish: false }, orderBy: { id: "asc" } }))!;
await db.cap.update({ where: { id: want.id }, data: { copies: 5 } });

// a wishlist cap to be offered back
const wish = await db.cap.create({
  data: { ref: "WL·900", name: "Probe Wanted", brewery: "W", country: "Wishland",
          liner: "Cork", wish: true, copies: 0 },
});
// a cap already owned, to prove an offer matching it does not duplicate
const dupe = await db.cap.create({
  data: { ref: "CC·900", name: "Probe Existing", brewery: "E", country: "Dupeland",
          liner: "PVC", wish: false, copies: 1 },
});

const req = await db.tradeRequest.create({
  data: {
    name: "Test Trader", contact: "test@example.com",
    items: { create: [
      { capId: want.id, offeredCapId: wish.id },
      { capId: want.id, offerName: "Probe Pilsener", offerBrewery: "Probe Brouwerij",
        offerCountry: "Testland", offerLiner: "Cork", offerYear: 1988,
        offerProduct: "Beer", offerCapType: "Bottle closure", offerFactorySigns: "PB",
        offerNote: "Slight rust on the skirt." },
      { capId: want.id, offerName: "Probe Existing", offerCountry: "Dupeland" },
    ] },
  },
});

console.log(JSON.stringify({ requestId: req.id, wantId: want.id, wantRef: want.ref,
  wishId: wish.id, dupeId: dupe.id }, null, 2));
await db.$disconnect();
