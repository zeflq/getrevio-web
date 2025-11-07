-- Remove theme reference from Campaign
ALTER TABLE "Campaign" DROP CONSTRAINT IF EXISTS "Campaign_themeId_fkey";
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "themeId";
