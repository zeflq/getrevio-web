DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ShortlinkTargetType') THEN
    CREATE TYPE "ShortlinkTargetType" AS ENUM ('campaign', 'place');
  END IF;
END $$;

ALTER TABLE "Shortlink"
  ADD COLUMN IF NOT EXISTS "targetType" "ShortlinkTargetType" NOT NULL DEFAULT 'place';

ALTER TABLE "Shortlink"
  ADD COLUMN IF NOT EXISTS "campaignId" TEXT;

ALTER TABLE "Shortlink"
  ADD COLUMN IF NOT EXISTS "placeId" TEXT;

UPDATE "Shortlink"
SET
  "targetType" = COALESCE(
    CASE jsonb_extract_path_text("target", 't')
      WHEN 'campaign' THEN 'campaign'
      WHEN 'place' THEN 'place'
      ELSE NULL
    END::"ShortlinkTargetType",
    'place'::"ShortlinkTargetType"
  ),
  "campaignId" = NULLIF(jsonb_extract_path_text("target", 'cid'), ''),
  "placeId" = NULLIF(jsonb_extract_path_text("target", 'pid'), '');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Shortlink_campaignId_fkey'
  ) THEN
    ALTER TABLE "Shortlink"
      ADD CONSTRAINT "Shortlink_campaignId_fkey"
        FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Shortlink_placeId_fkey'
  ) THEN
    ALTER TABLE "Shortlink"
      ADD CONSTRAINT "Shortlink_placeId_fkey"
        FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Shortlink_campaignId_idx" ON "Shortlink"("campaignId");
CREATE INDEX IF NOT EXISTS "Shortlink_placeId_idx" ON "Shortlink"("placeId");
CREATE INDEX IF NOT EXISTS "Shortlink_targetType_idx" ON "Shortlink"("targetType");
