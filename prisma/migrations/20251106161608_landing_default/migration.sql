/*
  Warnings:

  - You are about to drop the column `landingDefaults` on the `Place` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_landingId_fkey";

-- DropForeignKey
ALTER TABLE "Landing" DROP CONSTRAINT "Landing_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_landingId_fkey";

-- AlterTable
ALTER TABLE "Landing" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "landingDefaults";

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_landingId_fkey" FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_landingId_fkey" FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Landing" ADD CONSTRAINT "Landing_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
