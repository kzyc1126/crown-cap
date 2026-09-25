/**
 * Seeds everything except the caps: the single settings row and the home page
 * slides. The collection itself is imported from the crowncaps.info scrape —
 * `npm run db:import` — so there are no sample caps to tell apart from real ones.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { SETTINGS, SLIDES } from "./seed-data";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.gallerySlide.deleteMany();
  await prisma.gallerySlide.createMany({ data: SLIDES });

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: SETTINGS,
    create: { id: 1, ...SETTINGS },
  });

  const caps = await prisma.cap.count();
  console.log(
    `Seeded settings and ${SLIDES.length} slides. Caps in the table: ${caps}` +
      (caps === 0 ? " — run `npm run db:import` to load the collection." : "."),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
