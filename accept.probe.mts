import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { acceptTradeRequest } from "./src/server/actions";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });
const snap = async (label: string) => {
  const want = await db.cap.findUnique({ where: { id: 1234 } });
  const wish = await db.cap.findUnique({ where: { id: 2368 } });
  const dupe = await db.cap.findUnique({ where: { id: 2369 } });
  const made = await db.cap.findFirst({ where: { name: "Probe Pilsener" } });
  const req = await db.tradeRequest.findUnique({ where: { id: 5 } });
  console.log(label, JSON.stringify({
    wantCopies: want!.copies,
    wishlistCap: { wish: wish!.wish, copies: wish!.copies },
    existingCap: { copies: dupe!.copies },
    newCap: made && { ref: made.ref, brewery: made.brewery, year: made.year,
                      product: made.product, signs: made.factorySigns, copies: made.copies,
                      notes: made.notes },
    status: req!.status,
  }, null, 2));
};

await snap("BEFORE");
const fd = new FormData();
fd.set("id", "5");
try { await acceptTradeRequest(fd); } catch (e) { console.log("(revalidate threw as expected:", (e as Error).message.slice(0, 60) + ")"); }
await snap("AFTER ");

// idempotency: a second accept must change nothing
try { await acceptTradeRequest(fd); } catch { /* ignore */ }
await snap("TWICE ");
await db.$disconnect();
