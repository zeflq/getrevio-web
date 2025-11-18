/*
  Warnings:

  - You are about to drop the column `accentColor` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `brandColor` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `Theme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "accentColor",
DROP COLUMN "brandColor",
DROP COLUMN "logoUrl",
DROP COLUMN "textColor";
