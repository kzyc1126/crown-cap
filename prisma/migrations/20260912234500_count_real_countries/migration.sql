-- Count countries by their ISO code, not by the country text: the scrape
-- carries rows that name no country ("Unknown") or several ("Multiple
-- countries"), and neither is a country to add to the tally.
CREATE OR REPLACE VIEW `collection_stats` AS
SELECT
  (SELECT COUNT(*) FROM `caps` WHERE `wish` = 0)                        AS `capsCatalogued`,
  (SELECT COUNT(DISTINCT `countryCode`) FROM `caps` WHERE `wish` = 0)   AS `countries`,
  (SELECT COUNT(*) FROM `caps` WHERE `wish` = 0 AND `copies` > 1)       AS `duplicatesForTrade`,
  (SELECT COUNT(*) FROM `caps` WHERE `wish` = 1)                        AS `wishlistCount`,
  (SELECT COUNT(DISTINCT `brewery`) FROM `caps` WHERE `wish` = 0)       AS `breweries`,
  (SELECT COALESCE(SUM(`copies`), 0) FROM `caps` WHERE `wish` = 0)      AS `capsIncludingSpares`;
