ALTER TABLE "Shortlink"
  ADD COLUMN IF NOT EXISTS "utmSource" TEXT,
  ADD COLUMN IF NOT EXISTS "utmMedium" TEXT,
  ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT,
  ADD COLUMN IF NOT EXISTS "utmTerm" TEXT,
  ADD COLUMN IF NOT EXISTS "utmContent" TEXT;

UPDATE "Shortlink"
SET
  "utmSource" = NULLIF(utm ->> 'source', ''),
  "utmMedium" = NULLIF(utm ->> 'medium', ''),
  "utmCampaign" = NULLIF(utm ->> 'campaign', ''),
  "utmTerm" = NULLIF(utm ->> 'term', ''),
  "utmContent" = NULLIF(utm ->> 'content', '')
WHERE utm IS NOT NULL;

ALTER TABLE "Shortlink"
  DROP COLUMN IF EXISTS "utm";
