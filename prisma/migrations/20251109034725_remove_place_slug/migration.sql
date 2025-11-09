/*
  Warnings:

  - You are about to drop the column `googlePlaceId` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Place` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "place_merchant_slug_unique";

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "googlePlaceId",
DROP COLUMN "slug";
