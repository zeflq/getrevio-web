/*
  Warnings:

  - You are about to drop the column `target` on the `Shortlink` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Shortlink` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Shortlink_targetType_idx";

-- AlterTable
ALTER TABLE "Shortlink" DROP COLUMN "target",
DROP COLUMN "targetType",
ADD COLUMN     "landingId" TEXT;

-- DropEnum
DROP TYPE "ShortlinkTargetType";

-- CreateIndex
CREATE INDEX "Shortlink_landingId_idx" ON "Shortlink"("landingId");

-- AddForeignKey
ALTER TABLE "Shortlink" ADD CONSTRAINT "Shortlink_landingId_fkey" FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
