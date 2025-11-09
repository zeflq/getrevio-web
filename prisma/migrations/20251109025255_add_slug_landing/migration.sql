/*
  Warnings:

  - A unique constraint covering the columns `[merchantId,slug]` on the table `Landing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Landing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Landing" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "landing_merchant_slug_unique" ON "Landing"("merchantId", "slug");
