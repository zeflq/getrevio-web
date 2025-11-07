-- Remove theme relation from Shortlink
ALTER TABLE "Shortlink" DROP COLUMN IF EXISTS "themeId";
