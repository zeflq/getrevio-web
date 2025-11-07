/*
  Warnings:

  - You are about to drop the column `themeId` on the `Shortlink` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shortlink" DROP CONSTRAINT "Shortlink_themeId_fkey";

-- AlterTable
ALTER TABLE "Shortlink" DROP COLUMN "themeId";
