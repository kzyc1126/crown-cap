-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "caps" (
    "id" SERIAL NOT NULL,
    "ref" VARCHAR(32) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "brewery" VARCHAR(160) NOT NULL,
    "country" VARCHAR(80) NOT NULL,
    "countryCode" VARCHAR(4),
    "liner" VARCHAR(60) NOT NULL,
    "product" VARCHAR(60),
    "capType" VARCHAR(40),
    "year" INTEGER,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "wish" BOOLEAN NOT NULL DEFAULT false,
    "image" VARCHAR(255),
    "paletteIndex" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "factorySigns" VARCHAR(120),
    "sourceId" VARCHAR(16),
    "sourceUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_requests" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "contact" VARCHAR(160) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_request_items" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "capId" INTEGER NOT NULL,
    "offeredCapId" INTEGER,
    "offerNote" TEXT,
    "offerImage" VARCHAR(255),
    "offerName" VARCHAR(160),
    "offerBrewery" VARCHAR(160),
    "offerCountry" VARCHAR(80),
    "offerLiner" VARCHAR(60),
    "offerYear" INTEGER,
    "offerProduct" VARCHAR(60),
    "offerCapType" VARCHAR(40),
    "offerFactorySigns" VARCHAR(120),

    CONSTRAINT "trade_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "ownerName" VARCHAR(120) NOT NULL,
    "startYear" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_slides" (
    "id" SERIAL NOT NULL,
    "caption" VARCHAR(160) NOT NULL,
    "image" VARCHAR(255),
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gallery_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "caps_ref_key" ON "caps"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "caps_sourceId_key" ON "caps"("sourceId");

-- CreateIndex
CREATE INDEX "caps_wish_idx" ON "caps"("wish");

-- CreateIndex
CREATE INDEX "caps_country_idx" ON "caps"("country");

-- CreateIndex
CREATE INDEX "caps_countryCode_idx" ON "caps"("countryCode");

-- CreateIndex
CREATE INDEX "caps_brewery_idx" ON "caps"("brewery");

-- CreateIndex
CREATE INDEX "trade_requests_status_idx" ON "trade_requests"("status");

-- CreateIndex
CREATE INDEX "trade_request_items_requestId_idx" ON "trade_request_items"("requestId");

-- CreateIndex
CREATE INDEX "trade_request_items_capId_idx" ON "trade_request_items"("capId");

-- AddForeignKey
ALTER TABLE "trade_request_items" ADD CONSTRAINT "trade_request_items_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "trade_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_request_items" ADD CONSTRAINT "trade_request_items_capId_fkey" FOREIGN KEY ("capId") REFERENCES "caps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_request_items" ADD CONSTRAINT "trade_request_items_offeredCapId_fkey" FOREIGN KEY ("offeredCapId") REFERENCES "caps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

