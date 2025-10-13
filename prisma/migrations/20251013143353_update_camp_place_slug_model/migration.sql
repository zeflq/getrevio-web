/*
  Warnings:

  - You are about to drop the column `defaultShortlinkCode` on the `Place` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[placeId,slug]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[merchantId,slug]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Campaign_slug_key";

-- DropIndex
DROP INDEX "public"."Place_slug_key";

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "defaultShortlinkCode";

-- CreateIndex
CREATE UNIQUE INDEX "campaign_place_slug_unique" ON "Campaign"("placeId", "slug");

-- CreateIndex
CREATE INDEX "Place_merchantId_idx" ON "Place"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "place_merchant_slug_unique" ON "Place"("merchantId", "slug");
