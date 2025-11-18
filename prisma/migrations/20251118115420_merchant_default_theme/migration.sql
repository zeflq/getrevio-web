/*
  Warnings:

  - You are about to drop the column `defaultThemeId` on the `Merchant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Merchant" DROP CONSTRAINT "Merchant_defaultThemeId_fkey";

-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "defaultThemeId";
