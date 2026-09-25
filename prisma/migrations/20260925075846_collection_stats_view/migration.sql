-- Live counters for the home page, counted straight from the caps table by the
-- `collection_stats` view. Reading it always reflects the current rows, so
-- adding, importing, editing or deleting caps updates the site with no extra
-- bookkeeping. Ported from the original MySQL view to PostgreSQL: boolean
-- literals instead of 0/1, and camelCase columns/aliases are double-quoted.
CREATE VIEW "collection_stats" AS
SELECT
  (SELECT COUNT(*) FROM "caps" WHERE "wish" = false)                          AS "capsCatalogued",
  (SELECT COUNT(DISTINCT "countryCode") FROM "caps" WHERE "wish" = false)     AS "countries",
  (SELECT COUNT(*) FROM "caps" WHERE "wish" = false AND "copies" > 1)         AS "duplicatesForTrade",
  (SELECT COUNT(*) FROM "caps" WHERE "wish" = true)                           AS "wishlistCount",
  (SELECT COUNT(DISTINCT "brewery") FROM "caps" WHERE "wish" = false)         AS "breweries",
  (SELECT COALESCE(SUM("copies"), 0) FROM "caps" WHERE "wish" = false)        AS "capsIncludingSpares";
