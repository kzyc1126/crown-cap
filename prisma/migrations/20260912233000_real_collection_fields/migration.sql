-- AlterTable
ALTER TABLE `caps` ADD COLUMN `capType` VARCHAR(40) NULL,
    ADD COLUMN `countryCode` VARCHAR(4) NULL,
    ADD COLUMN `factorySigns` VARCHAR(120) NULL,
    ADD COLUMN `product` VARCHAR(60) NULL,
    ADD COLUMN `sourceId` VARCHAR(16) NULL,
    ADD COLUMN `sourceUrl` VARCHAR(255) NULL,
    MODIFY `year` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `caps_sourceId_key` ON `caps`(`sourceId`);

-- CreateIndex
CREATE INDEX `caps_countryCode_idx` ON `caps`(`countryCode`);

