/**
 * Loads a crowncaps.info scrape into the database. Replaces every cap already
 * in the table — and the trade requests that point at them — so it is the
 * real collection afterwards, not a mix.
 *
 *   npx tsx prisma/import-caps.ts ~/Downloads/caps_all.json
 *
 * The argument is optional; the path above is the default.
 *
 * Photos are not copied here. A cap gets `/caps/<source id>.webp` when that
 * file exists in /public/caps — the transparent cut-outs that dewhite_caps.py
 * (repo root, one level up) writes from the raw downloads — and no image
 * otherwise, so the initials disc shows instead of a photo on a white sheet.
 * Rerun this after de-whiting more photos and the rows pick them up.
 */
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { resolveCountry } from "../src/lib/countries";

type SourceCap = {
  source_id: string;
  name: string | null;
  brewery: string | null;
  country: string | null;
  liner: string | null;
  type: string | null;
  year: number | null;
  copies: number | null;
  wish: boolean;
  info: string | null;
  factory_signs: string[];
  product: string | null;
  source_url: string | null;
  image_filename: string | null;
};

const home = os.homedir();
const jsonPath = process.argv[2] ?? path.join(home, "Downloads", "caps_all.json");
const publicCaps = path.join(process.cwd(), "public", "caps");

/** Cap names arrive as several lines of embossing; keep them on one. */
const oneLine = (value: string | null) =>
  value?.replace(/\s*[\r\n]+\s*/g, " · ").replace(/\s+/g, " ").trim() || "";

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

async function main() {
  const source: SourceCap[] = JSON.parse(readFileSync(jsonPath, "utf8"));
  console.log(`Read ${source.length} caps from ${jsonPath}`);

  // ---- photos: the de-whited .webp in /public/caps, named by source id
  mkdirSync(publicCaps, { recursive: true });
  const onDisk = new Set(readdirSync(publicCaps));
  let withPhoto = 0;

  const imageFor = (cap: SourceCap) => {
    const file = `${cap.source_id}.webp`;
    if (!onDisk.has(file)) return null;
    withPhoto += 1;
    return `/caps/${file}`;
  };

  // ---- rows, numbered CC·00001… by country then name, the caps that name no
  // country last so the catalogue does not open on a run of unknowns
  const sortKey = (cap: SourceCap) => resolveCountry(cap.country)?.name ?? "\uffff";
  const ordered = [...source].sort((a, b) => {
    const country = sortKey(a).localeCompare(sortKey(b));
    return country !== 0 ? country : oneLine(a.name).localeCompare(oneLine(b.name));
  });

  let unplaced = 0;

  const rows = ordered.map((cap, i) => {
    const country = resolveCountry(cap.country);
    if (!country) unplaced += 1;

    const brewery = oneLine(cap.brewery) || "Unknown producer";
    const name = oneLine(cap.name) || brewery;

    return {
      ref: `CC·${String(i + 1).padStart(5, "0")}`,
      name: clamp(name, 160),
      brewery: clamp(brewery, 160),
      country: country?.name ?? (cap.country ? oneLine(cap.country).replace(/^[*-]/, "") : "Unknown"),
      countryCode: country?.code ?? null,
      liner: oneLine(cap.liner) || "Unknown",
      product: cap.product ? clamp(oneLine(cap.product), 60) : null,
      capType: cap.type ? clamp(oneLine(cap.type), 40) : null,
      year: cap.year ?? null,
      copies: cap.copies ?? 1,
      wish: cap.wish ?? false,
      image: imageFor(cap),
      paletteIndex: (i * 3) % 8,
      notes: cap.info?.replace(/\r\n/g, "\n").trim() || null,
      factorySigns: cap.factory_signs?.length
        ? clamp(cap.factory_signs.join(", "), 120)
        : null,
      sourceId: cap.source_id,
      sourceUrl: cap.source_url,
    };
  });

  // ---- replace the table (trade requests point at caps, so they go first)
  console.log("Clearing the old rows…");
  await prisma.tradeRequestItem.deleteMany();
  await prisma.tradeRequest.deleteMany();
  await prisma.cap.deleteMany();

  for (let i = 0; i < rows.length; i += 200) {
    await prisma.cap.createMany({ data: rows.slice(i, i + 200) });
  }

  const owned = rows.filter((r) => !r.wish).length;
  console.log(
    [
      `Inserted ${rows.length} caps (${owned} owned, ${rows.length - owned} wishlist).`,
      `Photos: ${withPhoto} caps point at a .webp in public/caps, ${rows.length - withPhoto} have none yet.`,
      `Countries: ${new Set(rows.map((r) => r.countryCode).filter(Boolean)).size} placed${unplaced ? `, ${unplaced} caps unplaceable` : ""}.`,
    ].join("\n"),
  );
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
