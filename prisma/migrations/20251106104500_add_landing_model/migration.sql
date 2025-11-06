-- Create LandingStatus enum if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LandingStatus') THEN
    CREATE TYPE "LandingStatus" AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

-- Create Landing table
CREATE TABLE IF NOT EXISTS "Landing" (
  "id" TEXT PRIMARY KEY,
  "merchantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "LandingStatus" NOT NULL DEFAULT 'draft',
  "content" JSONB NOT NULL,
  "theme" JSONB,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure updatedAt auto-updates (Prisma handles @updatedAt but we keep default)

-- Foreign key to Merchant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Landing_merchantId_fkey'
  ) THEN
    ALTER TABLE "Landing"
      ADD CONSTRAINT "Landing_merchantId_fkey"
        FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Index for quick merchant/status filtering
CREATE INDEX IF NOT EXISTS "Landing_merchantId_status_idx"
  ON "Landing"("merchantId", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Place' AND column_name = 'landingId'
  ) THEN
    ALTER TABLE "Place" ADD COLUMN "landingId" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Campaign' AND column_name = 'landingId'
  ) THEN
    ALTER TABLE "Campaign" ADD COLUMN "landingId" TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Place_landingId_idx" ON "Place"("landingId");
CREATE INDEX IF NOT EXISTS "Campaign_landingId_idx" ON "Campaign"("landingId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Place_landingId_fkey'
  ) THEN
    ALTER TABLE "Place"
      ADD CONSTRAINT "Place_landingId_fkey"
        FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Campaign_landingId_fkey'
  ) THEN
    ALTER TABLE "Campaign"
      ADD CONSTRAINT "Campaign_landingId_fkey"
        FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE SET NULL;
  END IF;
END $$;
