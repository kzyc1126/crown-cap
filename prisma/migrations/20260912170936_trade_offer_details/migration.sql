-- AlterTable
ALTER TABLE `trade_request_items` ADD COLUMN `offerBrewery` VARCHAR(160) NULL,
    ADD COLUMN `offerCapType` VARCHAR(40) NULL,
    ADD COLUMN `offerCountry` VARCHAR(80) NULL,
    ADD COLUMN `offerFactorySigns` VARCHAR(120) NULL,
    ADD COLUMN `offerLiner` VARCHAR(60) NULL,
    ADD COLUMN `offerName` VARCHAR(160) NULL,
    ADD COLUMN `offerProduct` VARCHAR(60) NULL,
    ADD COLUMN `offerYear` INTEGER NULL;
