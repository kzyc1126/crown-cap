-- CreateTable
CREATE TABLE `caps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ref` VARCHAR(32) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `brewery` VARCHAR(160) NOT NULL,
    `country` VARCHAR(80) NOT NULL,
    `liner` VARCHAR(60) NOT NULL,
    `year` INTEGER NOT NULL,
    `copies` INTEGER NOT NULL DEFAULT 1,
    `wish` BOOLEAN NOT NULL DEFAULT false,
    `image` VARCHAR(255) NULL,
    `paletteIndex` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `caps_ref_key`(`ref`),
    INDEX `caps_wish_idx`(`wish`),
    INDEX `caps_country_idx`(`country`),
    INDEX `caps_brewery_idx`(`brewery`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trade_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `contact` VARCHAR(160) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trade_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trade_request_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestId` INTEGER NOT NULL,
    `capId` INTEGER NOT NULL,
    `offeredCapId` INTEGER NULL,
    `offerNote` TEXT NULL,
    `offerImage` VARCHAR(255) NULL,

    INDEX `trade_request_items_requestId_idx`(`requestId`),
    INDEX `trade_request_items_capId_idx`(`capId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `ownerName` VARCHAR(120) NOT NULL,
    `startYear` INTEGER NOT NULL,
    `totalCaps` INTEGER NOT NULL,
    `totalCountries` INTEGER NOT NULL,
    `duplicatesForTrade` INTEGER NOT NULL,
    `wishlistCount` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_slides` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `caption` VARCHAR(160) NOT NULL,
    `image` VARCHAR(255) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `trade_request_items` ADD CONSTRAINT `trade_request_items_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `trade_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trade_request_items` ADD CONSTRAINT `trade_request_items_capId_fkey` FOREIGN KEY (`capId`) REFERENCES `caps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trade_request_items` ADD CONSTRAINT `trade_request_items_offeredCapId_fkey` FOREIGN KEY (`offeredCapId`) REFERENCES `caps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
