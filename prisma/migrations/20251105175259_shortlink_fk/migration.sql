-- CreateEnum
CREATE TYPE "ShortlinkTargetType" AS ENUM ('campaign', 'place');

-- AlterTable
ALTER TABLE "Shortlink" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "placeId" TEXT,
ADD COLUMN     "targetType" "ShortlinkTargetType" NOT NULL DEFAULT 'place';

-- CreateIndex
CREATE INDEX "Shortlink_campaignId_idx" ON "Shortlink"("campaignId");

-- CreateIndex
CREATE INDEX "Shortlink_placeId_idx" ON "Shortlink"("placeId");

-- CreateIndex
CREATE INDEX "Shortlink_targetType_idx" ON "Shortlink"("targetType");

-- AddForeignKey
ALTER TABLE "Shortlink" ADD CONSTRAINT "Shortlink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlink" ADD CONSTRAINT "Shortlink_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
