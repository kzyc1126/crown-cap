"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { resolveCountry } from "@/lib/countries";
import { prisma } from "@/lib/db";
import { MAIL_ATTACHMENT_BUDGET, formatBytes, photoBudget } from "@/lib/limits";
import { type MailAttachment, sendMail, tradeRequestMail } from "@/lib/mail";
import { assertImageAllowed, storeImage, storeImageWithBytes } from "@/lib/storage";
import { offeredCapSpecs } from "@/lib/trade";

export type ActionResult = { ok: boolean; message: string };

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const number = (data: FormData, key: string, fallback = 0) => {
  const value = Number(data.get(key));
  return Number.isFinite(value) ? value : fallback;
};

/** Trim, then cut to a column's width so an overlong field cannot fail a write. */
const clip = (value: unknown, max: number) =>
  String(value ?? "").trim().slice(0, max) || null;

/** A four-digit year, or null for anything that is not one. */
const yearOf = (value: unknown) => {
  const year = Number(String(value ?? "").trim());
  return Number.isInteger(year) && year > 1000 && year < 3000 ? year : null;
};

function refreshSite() {
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/countries");
  revalidatePath("/wishlist");
  revalidatePath("/trade");
  revalidatePath("/admin", "layout");
}

/**
 * Anything that can read and write caps: the shared client, or a transaction.
 * Accepting a request creates caps inside one, and those writes are only
 * visible to the transaction itself — so the helpers below take the client.
 */
type Db = Pick<typeof prisma, "cap">;

/** Next free catalogue reference, e.g. CC·037 or WL·013. */
async function nextRef(wish: boolean, db: Db = prisma) {
  const prefix = wish ? "WL" : "CC";
  const count = await db.cap.count({ where: { wish } });
  let n = count + 1;
  // skip numbers already taken (caps can be deleted out of order)
  while (await db.cap.findUnique({ where: { ref: `${prefix}·${String(n).padStart(3, "0")}` } })) {
    n += 1;
  }
  return `${prefix}·${String(n).padStart(3, "0")}`;
}

// ---------------------------------------------------------------- caps

export async function saveCap(
  _prev: ActionResult | null,
  data: FormData,
): Promise<ActionResult> {
  const id = Number(data.get("id")) || null;
  const wish = data.get("wish") === "on";
  const name = text(data, "name");
  const brewery = text(data, "brewery");
  const country = text(data, "country");

  if (!name || !brewery || !country) {
    return { ok: false, message: "Name, brewery and country are required." };
  }

  let image = text(data, "image") || null;
  try {
    const uploaded = await storeImage(data.get("photo") as File | null, "caps");
    if (uploaded) image = uploaded;
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const fields = {
    name,
    brewery,
    country,
    countryCode: resolveCountry(country)?.code ?? null,
    liner: text(data, "liner") || "Unknown",
    year: data.get("year") ? number(data, "year") : null,
    copies: wish ? 0 : Math.max(0, number(data, "copies", 1)),
    wish,
    image,
    paletteIndex: Math.abs(number(data, "paletteIndex")) % 8,
    notes: text(data, "notes") || null,
  };

  if (id) {
    await prisma.cap.update({ where: { id }, data: fields });
  } else {
    await prisma.cap.create({ data: { ...fields, ref: await nextRef(wish) } });
  }

  refreshSite();
  redirect("/admin/caps?saved=1");
}

export async function deleteCap(data: FormData) {
  const id = Number(data.get("id"));
  if (id) await prisma.cap.delete({ where: { id } });
  refreshSite();
  revalidatePath("/admin/caps");
}

/** One row of the admin table as edited in the browser. */
export type CapRowInput = {
  id: number;
  name: string;
  brewery: string;
  country: string;
  liner: string;
  year: number | null;
  copies: number;
  wish: boolean;
};

/**
 * Save the rows edited inline on the admin table. Every row is checked before
 * any is written, and all of them go in one transaction, so a bad row leaves
 * the table exactly as it was.
 */
export async function saveCapRows(
  _prev: ActionResult | null,
  data: FormData,
): Promise<ActionResult> {
  let rows: CapRowInput[];
  try {
    rows = JSON.parse(text(data, "rows"));
    if (!Array.isArray(rows)) throw new Error();
  } catch {
    return { ok: false, message: "Something went wrong reading the changes." };
  }
  if (rows.length === 0) return { ok: false, message: "Nothing has changed." };

  const updates: Array<{ id: number; data: Prisma.CapUpdateInput }> = [];

  for (const row of rows) {
    const id = Number(row.id);
    const name = clip(row.name, 160);
    const brewery = clip(row.brewery, 160);
    const country = clip(row.country, 80);
    if (!Number.isInteger(id) || id <= 0) continue;
    if (!name || !brewery || !country) {
      return { ok: false, message: "Every row needs a name, a product and a country." };
    }

    const year = row.year === null || row.year === undefined ? null : yearOf(row.year);
    if (row.year !== null && row.year !== undefined && !year) {
      return { ok: false, message: `"${name}" has a year that is not four digits.` };
    }

    const wish = Boolean(row.wish);
    const copies = Number(row.copies);
    if (!wish && (!Number.isInteger(copies) || copies < 0)) {
      return { ok: false, message: `"${name}" needs a whole number of copies.` };
    }

    updates.push({
      id,
      data: {
        name,
        brewery,
        country,
        countryCode: resolveCountry(country)?.code ?? null,
        liner: clip(row.liner, 60) ?? "Unknown",
        year,
        wish,
        copies: wish ? 0 : copies,
      },
    });
  }

  if (updates.length === 0) return { ok: false, message: "Nothing has changed." };

  await prisma.$transaction(
    updates.map((row) => prisma.cap.update({ where: { id: row.id }, data: row.data })),
  );

  refreshSite();
  revalidatePath("/admin/caps");
  return {
    ok: true,
    message: `Saved ${updates.length} cap${updates.length === 1 ? "" : "s"}.`,
  };
}

// ------------------------------------------------------------ settings

export async function saveSettings(
  _prev: ActionResult | null,
  data: FormData,
): Promise<ActionResult> {
  const fields = {
    ownerName: text(data, "ownerName") || "Filip’s Caps",
    startYear: number(data, "startYear", 2016),
  };

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: fields,
    create: { id: 1, ...fields },
  });

  refreshSite();
  return { ok: true, message: "Saved." };
}

// -------------------------------------------------------------- slides

export async function saveSlide(
  _prev: ActionResult | null,
  data: FormData,
): Promise<ActionResult> {
  const id = Number(data.get("id")) || null;
  const caption = text(data, "caption");
  if (!caption) return { ok: false, message: "Give the slide a caption." };

  let image = text(data, "image") || null;
  try {
    const uploaded = await storeImage(data.get("photo") as File | null, "gallery");
    if (uploaded) image = uploaded;
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const position = number(data, "position");

  if (id) {
    await prisma.gallerySlide.update({ where: { id }, data: { caption, image, position } });
  } else {
    await prisma.gallerySlide.create({ data: { caption, image, position } });
  }

  refreshSite();
  revalidatePath("/admin/settings");
  return { ok: true, message: id ? "Slide updated." : "Slide added." };
}

export async function deleteSlide(data: FormData) {
  const id = Number(data.get("id"));
  if (id) await prisma.gallerySlide.delete({ where: { id } });
  refreshSite();
  revalidatePath("/admin/settings");
}

// -------------------------------------------------------------- import

type ImportRow = Record<string, string>;

/** Parse CSV with a header row; quoted fields and embedded commas are handled. */
function parseCsv(input: string): ImportRow[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "," || char === ";" || char === "\t") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const lines = rows.filter((line) => line.some((cell) => cell.trim()));
  const header = lines.shift();
  if (!header) return [];

  const keys = header.map((cell) => cell.trim().toLowerCase().replace(/^\ufeff/, ""));

  return lines.map((line) => {
    const entry: ImportRow = {};
    keys.forEach((key, index) => {
      entry[key] = (line[index] ?? "").trim();
    });
    return entry;
  });
}

/** First non-empty value among the accepted column names. */
const pick = (row: ImportRow, ...keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return "";
};

export async function importCaps(
  _prev: ActionResult | null,
  data: FormData,
): Promise<ActionResult> {
  const file = data.get("file") as File | null;
  const pasted = text(data, "payload");
  const raw = file && file.size > 0 ? await file.text() : pasted;
  const target = text(data, "target") === "wishlist";
  const replace = data.get("replace") === "on";

  if (!raw.trim()) return { ok: false, message: "Paste a CSV or choose a .csv file." };

  const rows = parseCsv(raw);
  if (rows.length === 0) {
    return { ok: false, message: "No rows found — is the header row missing?" };
  }

  const prepared = rows
    .map((row) => ({
      name: pick(row, "name", "cap", "title"),
      brewery: pick(row, "brewery", "product", "producer"),
      country: pick(row, "country"),
      liner: pick(row, "liner", "liner type", "linertype") || "Unknown",
      year: Number(pick(row, "year", "date")) || null,
      copies: target ? 0 : Number(pick(row, "copies", "quantity", "qty")) || 1,
      image: pick(row, "image", "photo", "image_url") || null,
      wish: target,
    }))
    .filter((row) => row.name && row.country);

  if (prepared.length === 0) {
    return {
      ok: false,
      message: "Rows need at least a name and a country column with values.",
    };
  }

  if (replace) {
    await prisma.cap.deleteMany({ where: { wish: target } });
  }

  const prefix = target ? "WL" : "CC";
  const offset = replace ? 0 : await prisma.cap.count({ where: { wish: target } });

  await prisma.cap.createMany({
    data: prepared.map((row, index) => ({
      ...row,
      ref: `${prefix}\u00b7${String(offset + index + 1).padStart(3, "0")}`,
      paletteIndex: (index * 3) % 8,
    })),
    skipDuplicates: true,
  });

  refreshSite();
  revalidatePath("/admin/caps");

  const skipped = rows.length - prepared.length;
  return {
    ok: true,
    message:
      `Imported ${prepared.length} ${target ? "wishlist" : "collection"} caps` +
      (skipped > 0 ? ` — ${skipped} row(s) skipped for missing name or country.` : "."),
  };
}

// ------------------------------------------------------- trade requests

export async function submitTradeRequest(
  _prev: ActionResult | null,
  data: FormData,
): Promise<ActionResult> {
  const name = text(data, "name");
  const contact = text(data, "contact");
  if (!name || !contact) {
    return { ok: false, message: "Add your name and a way to reach you first." };
  }

  type OfferedFields = Record<string, unknown>;
  let lines: Array<{
    capId: number;
    target: string;
    note: string;
    offered?: OfferedFields;
  }>;
  try {
    lines = JSON.parse(text(data, "items"));
  } catch {
    return { ok: false, message: "Something went wrong reading your selection." };
  }
  if (!lines.length) return { ok: false, message: "Mark at least one cap first." };

  /*
   * The marked list lives in the visitor's browser, so the caps it names are
   * checked here too: a cap can have been deleted, or dropped to its last copy,
   * since it was marked — and only spares are ever given away.
   */
  const tradable = await prisma.cap.findMany({
    where: { id: { in: lines.map((line) => line.capId) }, wish: false, copies: { gt: 1 } },
    select: { id: true },
  });
  const tradableIds = new Set(tradable.map((cap) => cap.id));
  if (lines.some((line) => !tradableIds.has(line.capId))) {
    return {
      ok: false,
      message:
        "Some of the caps you marked are no longer open for trade. " +
        "Reopen the collection and mark them again.",
    };
  }

  /* The browser asks for these, but the request arrives as JSON — so the two
     fields a Cap row cannot do without are checked here as well. */
  const incomplete = lines.find(
    (line) =>
      line.target === "other" &&
      !(clip(line.offered?.name, 160) && clip(line.offered?.country, 80)),
  );
  if (incomplete) {
    return {
      ok: false,
      message: "Give at least the name and country of the cap you are offering.",
    };
  }

  /*
   * Photos ride along on the notification e-mail, and a mailbox caps the whole
   * message rather than each file — so the budget is shared out between the
   * photos actually attached to this request. Everything is checked before a
   * single file is written, so a request is never half-stored.
   */
  const photos = lines.map((line) => {
    const file = data.get(`photo-${line.capId}`) as File | null;
    return file && file.size > 0 ? { capId: line.capId, file } : null;
  });
  const attached = photos.filter((entry) => entry !== null);
  const perPhoto = photoBudget(attached.length);

  try {
    for (const entry of attached) assertImageAllowed(entry.file, perPhoto);
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const total = attached.reduce((sum, entry) => sum + entry.file.size, 0);
  if (total > MAIL_ATTACHMENT_BUDGET) {
    return {
      ok: false,
      message:
        `Your photos come to ${formatBytes(total)} together — ${formatBytes(MAIL_ATTACHMENT_BUDGET)} ` +
        `is the most one request can carry. Send fewer photos, or smaller ones.`,
    };
  }

  const items = [];
  const mailPhotos = new Map<number, MailAttachment>();

  for (const [index, line] of lines.entries()) {
    let offerImage: string | null = null;
    const photo = photos[index];

    if (photo) {
      try {
        const stored = await storeImageWithBytes(photo.file, "uploads", perPhoto);
        if (stored) {
          offerImage = stored.url;
          mailPhotos.set(line.capId, {
            filename: stored.name,
            content: stored.bytes,
            contentType: stored.type,
          });
        }
      } catch (error) {
        return { ok: false, message: (error as Error).message };
      }
    }

    const other = line.target === "other";
    const offered = line.offered ?? {};

    items.push({
      capId: line.capId,
      offeredCapId: other || !line.target ? null : Number(line.target),
      offerNote: other ? clip(line.note, 4000) : null,
      offerImage,
      /* Widths mirror the Cap columns these are copied into on accept. */
      offerName: other ? clip(offered.name, 160) : null,
      offerBrewery: other ? clip(offered.brewery, 160) : null,
      offerCountry: other ? clip(offered.country, 80) : null,
      offerLiner: other ? clip(offered.liner, 60) : null,
      offerYear: other ? yearOf(offered.year) : null,
      offerProduct: other ? clip(offered.product, 60) : null,
      offerCapType: other ? clip(offered.capType, 40) : null,
      offerFactorySigns: other ? clip(offered.factorySigns, 120) : null,
    });
  }

  const request = await prisma.tradeRequest.create({
    data: { name, contact, items: { create: items } },
    include: { items: { include: { cap: true, offeredCap: true } } },
  });

  revalidatePath("/admin/requests");
  revalidatePath("/admin");

  /* The request is saved; the e-mail is a courtesy on top and must not fail it. */
  const mail = tradeRequestMail({
    name,
    contact,
    sentAt: request.createdAt,
    items: request.items.map((item) => ({
      wants: {
        name: item.cap.name,
        ref: item.cap.ref,
        country: item.cap.country,
        year: item.cap.year,
      },
      offersCap: item.offeredCap
        ? { name: item.offeredCap.name, country: item.offeredCap.country }
        : null,
      offersNew: item.offerName
        ? { name: item.offerName, specs: offeredCapSpecs(item) }
        : null,
      offersNote: item.offerNote,
      photo: mailPhotos.get(item.capId) ?? null,
    })),
  });

  const result = await sendMail({
    ...mail,
    attachments: [...mailPhotos.values()],
    replyTo: contact.includes("@") ? contact : undefined,
  });

  if (!result.sent) {
    console.warn(`[trade] request ${request.id} saved, e-mail not sent: ${result.detail}`);
  }

  return { ok: true, message: "Sent — I'll reply within a week." };
}

export async function setRequestStatus(data: FormData) {
  const id = Number(data.get("id"));
  const status = text(data, "status") || "new";
  if (id) await prisma.tradeRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
}

/**
 * Record that a cap has arrived in the collection.
 *
 * A wishlist row is the same cap, already described — it only has to stop being
 * a wish. An owned row means a second of something already held, so the count
 * goes up rather than a duplicate row appearing. The row is read inside the
 * transaction rather than trusted from the request: an earlier line of the same
 * request may already have moved it.
 */
async function receiveCap(db: Db, capId: number) {
  const cap = await db.cap.findUnique({
    where: { id: capId },
    select: { wish: true },
  });
  if (!cap) return;

  await db.cap.update({
    where: { id: capId },
    data: cap.wish ? { wish: false, copies: 1 } : { copies: { increment: 1 } },
  });
}

/**
 * Accept a trade request: the caps change hands, and the collection is brought
 * up to date in one go so nothing has to be typed in twice.
 *
 * For each line — the spare Filip gives away is counted down by one, and the
 * cap he gets is counted in. A cap offered off the wishlist is already in the
 * database, so it is only flipped to owned; one described in the form is looked
 * up by name and country first, and a row is written only when it is genuinely
 * new. Everything runs in a transaction: a half-accepted request would leave
 * the collection lying about what is in the drawer.
 */
export async function acceptTradeRequest(data: FormData): Promise<void> {
  const id = Number(data.get("id"));
  if (!id) return;

  const request = await prisma.tradeRequest.findUnique({
    where: { id },
    include: { items: true },
  });

  /* Only a request still waiting is acted on, so a double submit cannot count
     the same trade twice. */
  if (!request || request.status !== "new") return;

  await prisma.$transaction(async (tx) => {
    for (const item of request.items) {
      /* The spare going out, counted down in the database rather than from the
         number read with the request — the guard keeps it off zero, and the
         decrement stays right even if another line moved the same cap. */
      await tx.cap.updateMany({
        where: { id: item.capId, copies: { gt: 0 } },
        data: { copies: { decrement: 1 } },
      });

      if (item.offeredCapId) {
        await receiveCap(tx, item.offeredCapId);
        continue;
      }

      if (!item.offerName || !item.offerCountry) continue;

      /* Match case-insensitively so "Bintang" and "bintang" are the same cap
         here. MySQL did this under its default collation; Postgres compares
         case-sensitively, so the intent is spelled out with `mode`. */
      const existing = await tx.cap.findFirst({
        where: {
          name: { equals: item.offerName, mode: "insensitive" },
          country: { equals: item.offerCountry, mode: "insensitive" },
        },
      });

      if (existing) {
        await receiveCap(tx, existing.id);
        continue;
      }

      await tx.cap.create({
        data: {
          ref: await nextRef(false, tx),
          name: item.offerName,
          brewery: item.offerBrewery ?? "Unknown",
          country: item.offerCountry,
          liner: item.offerLiner ?? "Unknown",
          year: item.offerYear,
          product: item.offerProduct,
          capType: item.offerCapType,
          factorySigns: item.offerFactorySigns,
          image: item.offerImage,
          notes: [`Traded from ${request.name} (${request.contact}).`, item.offerNote]
            .filter(Boolean)
            .join("\n\n"),
          copies: 1,
          wish: false,
        },
      });
    }

    await tx.tradeRequest.update({ where: { id }, data: { status: "accepted" } });
  });

  refreshSite();
  revalidatePath("/admin/requests");
  revalidatePath("/admin/caps");
}

/** Turn a request down. Nothing changes hands, so no cap is touched. */
export async function declineTradeRequest(data: FormData) {
  const id = Number(data.get("id"));
  if (id) {
    await prisma.tradeRequest.updateMany({
      where: { id, status: "new" },
      data: { status: "declined" },
    });
  }
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
}

export async function deleteRequest(data: FormData) {
  const id = Number(data.get("id"));
  if (id) await prisma.tradeRequest.delete({ where: { id } });
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
}
