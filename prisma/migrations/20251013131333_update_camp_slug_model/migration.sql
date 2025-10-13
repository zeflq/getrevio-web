-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "slug" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Campaign_merchantId_idx" ON "Campaign"("merchantId");

-- CreateIndex
CREATE INDEX "Campaign_placeId_idx" ON "Campaign"("placeId");
