-- Remove theme reference from Place
ALTER TABLE "Place" DROP CONSTRAINT IF EXISTS "Place_themeId_fkey";
ALTER TABLE "Place" DROP COLUMN IF EXISTS "themeId";

-- Cleanup theme relation table columns if needed (Shortlink already handled separately)
