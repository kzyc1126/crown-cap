# Filip's Caps — crown cap collection

A catalogue for a crown cap collection: the collection itself, a wishlist, a
trade form for visitors, and an admin area to manage all of it.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · MySQL.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000  (admin at /admin)
npm run build
npm run lint
```

The database must be running first — see below.

## Database

MySQL, schema **`crowncap`**, on the local MAMP server:

```
host 127.0.0.1 · port 3306 · user root
```

The connection string lives in `.env` (git-ignored):

```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/crowncap"
```

In MySQL Workbench this is one connection with many schemas — `crowncap` sits
next to the other projects on the same server.

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Apply schema changes (`prisma/schema.prisma`) |
| `npm run db:seed` | Load the site settings and slideshow rows |
| `npm run db:import` | Load the crowncaps.info scrape — see below |
| `npm run db:countries` | Regenerate `src/data/countries.ts` from `world-countries` |
| `npm run db:studio` | Prisma's own table browser |
| `npm run db:reset` | Drop everything, re-migrate, re-seed |

### Tables

| Table | Holds |
| --- | --- |
| `caps` | Every cap. `wish = 0` is the collection, `wish = 1` the wishlist |
| `trade_requests` | One submission of the trade form (name, contact, status) |
| `trade_request_items` | One line per request: the cap wanted + what is offered |
| `site_settings` | Single row: site name and the year collecting started |
| `gallery_slides` | Home page slideshow |

### Importing the collection

The caps are not fixtures — they come from a crowncaps.info scrape: a JSON file
and a folder of photos.

```bash
npm run db:import          # ~/Downloads/caps.json + ~/Downloads/crowncaps_images
npx tsx prisma/import-caps.ts path/to/caps.json path/to/images
```

It **replaces** every cap in the table (and the trade requests pointing at them),
copies the photos into `/public/caps`, and resolves each country to an ISO code
through `src/lib/countries.ts`, so caps filed under "Korea (South)", "Turkey" or
"*Soviet Union" all land on the right country. Undated caps keep a null year,
and caps with no name are catalogued under their producer.

The current import: **1,134 caps, 176 countries, 1,134 photos**.

### The `collection_stats` view

The four figures on the home page are **not** stored anywhere — they are counted
by a SQL view, so they move on their own whenever caps are added, imported,
edited or deleted, including changes made directly in Workbench:

```sql
CREATE OR REPLACE VIEW collection_stats AS
SELECT
  (SELECT COUNT(*) FROM caps WHERE wish = 0)                  AS capsCatalogued,
  (SELECT COUNT(DISTINCT countryCode) FROM caps WHERE wish = 0) AS countries,
  (SELECT COUNT(*) FROM caps WHERE wish = 0 AND copies > 1)   AS duplicatesForTrade,
  (SELECT COUNT(*) FROM caps WHERE wish = 1)                  AS wishlistCount,
  (SELECT COUNT(DISTINCT brewery) FROM caps WHERE wish = 0)   AS breweries,
  (SELECT COALESCE(SUM(copies), 0) FROM caps WHERE wish = 0)  AS capsIncludingSpares;
```

A view was chosen over triggers on purpose: a trigger has to fire correctly on
every insert, update and delete (bulk imports and manual edits included), and
when one path is missed the stored counters drift with nothing to show for it.
The view cannot drift — it counts the rows at read time. `SELECT * FROM
collection_stats;` works in Workbench too.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero slideshow, the four live figures, three menu cards, six latest caps |
| `/collection` | Cap grid: search, group by country / product / liner / decade, 24 per page, "Add for trade". `?country=ID` narrows it to one country |
| `/countries` | Every country in the world, continent by continent: what is collected and what is still missing |
| `/wishlist` | The same grid without trading — every cap marked "Wanted" |
| `/caps/[id]` | One cap: description, specification table, tags, mark for trade |
| `/trade` | Trade form: name + contact, a card per marked cap, offer a wishlist cap or "Other" (description + photo) |
| `/admin` | Dashboard: live counters, latest requests, quick actions |
| `/admin/caps` | Every cap in a table — search, filter, edit, delete |
| `/admin/caps/new`, `/admin/caps/[id]` | Add or edit one cap |
| `/admin/requests` | Trade request inbox: what they want, what they offer, photos, mark answered |
| `/admin/settings` | Live figures (read-only), site name and start year, slideshow slides |
| `/admin/import` | Bulk CSV import |

## The countries page

`src/data/countries.ts` is generated from the `world-countries` package (ISO
3166-1: 250 countries and territories, 194 of them UN members) plus four former
states — the Soviet Union, the GDR, Czechoslovakia and Yugoslavia — that no
longer have codes but still have caps.

Every one of them is a tile on the page, not an entry in a dropdown: the
countries with no caps stay visible, greyed out, because the gaps are the point.
Continents, a search box and a "collected only" switch narrow the board;
clicking a country opens the collection filtered to it.

Caps whose country could not be placed ("Multiple countries", blanks) are
gathered under **Unplaced** at the end rather than being dropped.

Caps marked for trade are kept in `localStorage`, shown in the "For trade"
drawer in the header, and posted to the database when the form is sent.

The admin has **no login yet** — anyone who can reach the URL can edit. Fine on
this machine; add authentication before putting it on a public domain.

## Three styles

The mockups came in three directions, and all three are built. Switch between
them in the "Style" bar at the top of every page; the choice is remembered in
the browser.

| No | Name | Feel |
| -- | ---- | ---- |
| 01 | Verdigris | teal `#1f9c96` on warm paper, Barlow Condensed, blueprint frames |
| 02 | Plate | copper `#c0713c` on dark ink, Instrument Serif + Spectral + IBM Plex Mono |
| 03 | Industry | steel blue `#5980a6` wireframe on a light grey ground |

Every colour, font, radius and grid density is a token in `src/app/globals.css`
— one block per style. No component hard-codes a colour, so a fourth style is
one token block plus one entry in `src/data/styles.ts`.

## CSV import

`/admin/import` takes a `.csv` file or pasted text. The first row must be the
header; commas, semicolons and tabs all work, and quoted fields may contain
commas.

```csv
name,product,country,liner type,year,copies
Bintang Pilsener,PT Multi Bintang,Indonesia,Cork,1974,3
"Pilsner Urquell, 1842",Plzensky Prazdroj,Czechia,Cork,2015,1
```

Recognised columns: **name** (or cap, title), **brewery** (or product,
producer), **country**, **liner type** (or liner), **year**, **copies** (or
quantity, qty), **image** (or photo, image_url). Rows without a name and a
country are skipped and reported; a missing year leaves the cap undated rather
than guessing one. Catalogue references (`CC·001`, `WL·001`) are
generated automatically. Tick "replace" to wipe that list first, otherwise rows
are appended.

## Photo storage

Uploads go through `src/lib/storage.ts`, which picks a driver from the
`IMAGE_STORAGE` environment variable:

- **`local`** (default) — files are written to `/public/caps`, `/public/gallery`
  or `/public/uploads` and the row stores a path like `/caps/ab12cd.jpg`. Good
  on this machine; the files live in the repo folder.
- **CDN** — the seam is there for a hosted store. On Vercel the natural choice
  is Vercel Blob (`npm i @vercel/blob`, then `put(name, file, { access: "public" })`
  inside `storeImage`); S3 or Cloudflare R2 fit the same shape. Only that one
  function changes, and rows then store a full `https://…` URL, which
  `next/image` already handles once the host is added to `next.config.ts`.

A local disk is the wrong long-term answer for a deployed site — serverless file
systems are read-only and ephemeral — so plan on the CDN driver as soon as the
site leaves this laptop. Uploads are limited to JPEG/PNG/WebP/AVIF; the size
limits live in `src/lib/limits.ts` — see below.

## Trade request e-mails

A submitted trade form is written to the database first and then announced by
e-mail — the row is the record, the mail is a notification, so a refused SMTP
server logs a warning and the visitor still gets a confirmation.

The message is laid out the way `/admin/requests` shows it: who is asking and
how to reach them, then one block per cap with what they want above what they
offer, and the offered photos as attachments. `Reply-To` is set to the
visitor's address when they left one, so replying goes straight to them.

Configured in `.env`:

```
TRADE_NOTIFY_EMAIL="kzyc26@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER=""          # the sending Gmail address
SMTP_PASS=""          # a Gmail App Password, not the account password
```

Gmail rejects the account password over SMTP: turn on 2-Step Verification on
the Google account, then Google account → Security → App passwords, and paste
the 16-character password into `SMTP_PASS`. With `SMTP_USER`/`SMTP_PASS` left
empty nothing is sent and the whole message is printed to the server console
instead, which is enough to check the wording.

Any other SMTP host works by changing `SMTP_HOST` and `SMTP_PORT`; port 465 is
treated as implicit TLS, anything else as STARTTLS.

### Photo size limits

A mailbox caps a whole *message*, not a file — Gmail stops at 25 MB, and base64
encoding inflates every attachment by about a third on the way out. So the
limit on a trade photo is not one fixed number: `MAIL_ATTACHMENT_BUDGET` (9 MB
of raw bytes, ≈ 12 MB encoded) is **divided between the photos actually
attached to that request**, with a 512 KB floor.

| Photos in one request | Each may weigh |
| --- | --- |
| 1 | 9 MB |
| 2 | 4.5 MB |
| 3 | 3 MB |
| 4 | 2.3 MB |
| 8 | 1.1 MB |

The trade form shows the current figure on the upload button and re-checks it
as photos are added; `submitTradeRequest` checks every file and the total again
before anything is written to disk, so a request is never half-stored. Past the
floor the total check refuses the request and asks for fewer photos.

Admin uploads — cap photos and slideshow slides — are never e-mailed and use a
flat `ADMIN_IMAGE_MAX` of 3 MB.

## Structure

```
prisma/
  schema.prisma        tables
  migrations/          including the collection_stats view
  seed.ts, seed-data.ts settings + slideshow only
  import-caps.ts       the crowncaps.info scrape -> caps + /public/caps
  generate-countries.ts writes src/data/countries.ts
src/
  app/
    (site)/            public pages + their chrome
    admin/             admin pages + their chrome
  components/
    ui/                Frame, ChoiceChip, Field, PageHeader, SectionHeading, IconButton
    layout/            header, footer, mobile tab bar, trade drawer, style switcher
    caps/              CapDisc, CapTile, CapBrowser, CapDetail, TradeButton
    countries/         CountryBoard, CountryTile
    trade/             TradeForm + TradeOfferCard
    home/              Hero, StatsRow, MenuCards, LatestEntries
    admin/             AdminNav, CapForm, SettingsForm, SlideForm, ImportForm, ConfirmButton
  hooks/               useStyle, useCart (localStorage via useSyncExternalStore)
  server/              queries.ts (reads), actions.ts (server actions)
  data/                styles.ts, countries.ts (generated)
  lib/                 db, storage, mail, limits, caps helpers, countries,
                       country-rows, paging, format, types, utils
public/caps, public/gallery, public/uploads
```

## Still open

- No authentication on `/admin`.
- `SMTP_USER` / `SMTP_PASS` in `.env` are empty — fill in a Gmail App Password
  and trade requests start arriving at `TRADE_NOTIFY_EMAIL`. Until then they are
  saved and logged to the console only.
- The e-mail links to `http://localhost:3000/admin/requests`; that hard-coded
  host in `src/lib/mail.ts` needs a real one once the site is deployed.
- `/admin/import` (CSV) cannot set the new columns — country code, product,
  cap type, factory signs. Re-run `npm run db:import` for those.
- `public/caps` now holds 1,134 photos (~21 MB) and is committed with the repo;
  move it to a CDN before deploying (see Photo storage).
