-- The four figures on the home page are no longer typed in by hand; they are
-- counted straight from the caps table by the `collection_stats` view below.
ALTER TABLE `site_settings`
  DROP COLUMN `totalCaps`,
  DROP COLUMN `totalCountries`,
  DROP COLUMN `duplicatesForTrade`,
  DROP COLUMN `wishlistCount`;

-- Live counters. Reading the view always reflects the current rows, so adding,
-- importing, editing or deleting caps updates the site with no extra bookkeeping.
CREATE OR REPLACE VIEW `collection_stats` AS
SELECT
  (SELECT COUNT(*) FROM `caps` WHERE `wish` = 0)                        AS `capsCatalogued`,
  (SELECT COUNT(DISTINCT `country`) FROM `caps` WHERE `wish` = 0)       AS `countries`,
  (SELECT COUNT(*) FROM `caps` WHERE `wish` = 0 AND `copies` > 1)       AS `duplicatesForTrade`,
  (SELECT COUNT(*) FROM `caps` WHERE `wish` = 1)                        AS `wishlistCount`,
  (SELECT COUNT(DISTINCT `brewery`) FROM `caps` WHERE `wish` = 0)       AS `breweries`,
  (SELECT COALESCE(SUM(`copies`), 0) FROM `caps` WHERE `wish` = 0)      AS `capsIncludingSpares`;
