/*
  Warnings:

  - You are about to drop the column `maxWinners` on the `LotteryConfig` table. All the data in the column will be lost.
  - You are about to drop the column `requiresAction` on the `LotteryConfig` table. All the data in the column will be lost.
  - You are about to drop the column `resetPlayLimit` on the `LotteryConfig` table. All the data in the column will be lost.
  - Added the column `cooldown` to the `LotteryConfig` table with a default value.

*/
-- CreateEnum
CREATE TYPE "LotteryConfigStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "LotteryPlayResult" AS ENUM ('win', 'nowin', 'ineligible', 'error');

-- CreateEnum
CREATE TYPE "RedemptionMethod" AS ENUM ('admin', 'qr', 'api');

-- CreateEnum
CREATE TYPE "LotteryWinStatus" AS ENUM ('pending_contact', 'contact_collected', 'email_sent', 'redeemed', 'expired');

-- CreateEnum
CREATE TYPE "LotteryDeliveryChannel" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "LotteryContactMethod" AS ENUM ('email', 'phone');

-- CreateEnum
CREATE TYPE "LotteryCooldown" AS ENUM ('one_hour', 'one_day', 'one_week');

-- AlterTable
ALTER TABLE "Landing" ADD COLUMN     "lotteryConfigId" TEXT;

-- AlterTable
ALTER TABLE "LotteryConfig" DROP COLUMN "maxWinners",
DROP COLUMN "requiresAction",
DROP COLUMN "resetPlayLimit",
ADD COLUMN     "contactMethod" "LotteryContactMethod" NOT NULL DEFAULT 'email',
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guaranteeWinOnFirstPlay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cooldown" "LotteryCooldown" NOT NULL DEFAULT 'one_day',
ADD COLUMN     "noWinWeight" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "RequiresAction";

-- DropEnum
DROP TYPE "ResetPlayLimit";

-- CreateTable
CREATE TABLE "LotteryPlay" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "landingId" TEXT NOT NULL,
    "participantKey" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "result" "LotteryPlayResult" NOT NULL DEFAULT 'nowin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotteryWin" (
    "id" TEXT NOT NULL,
    "playId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "giftSnapshot" JSONB NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "contactCompletedAt" TIMESTAMP(3),
    "deliveryChannel" "LotteryDeliveryChannel",
    "validFrom" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "deliveryEmailSentAt" TIMESTAMP(3),
    "deliveryEmailStatus" TEXT,
    "status" "LotteryWinStatus" NOT NULL DEFAULT 'pending_contact',
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "redemptionMethod" "RedemptionMethod",
    "redemptionMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryWin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LotteryPlay_merchantId_idx" ON "LotteryPlay"("merchantId");

-- CreateIndex
CREATE INDEX "LotteryPlay_configId_idx" ON "LotteryPlay"("configId");

-- CreateIndex
CREATE INDEX "LotteryPlay_landingId_idx" ON "LotteryPlay"("landingId");

-- CreateIndex
CREATE INDEX "LotteryPlay_participantKey_idx" ON "LotteryPlay"("participantKey");

-- CreateIndex
CREATE UNIQUE INDEX "LotteryWin_playId_key" ON "LotteryWin"("playId");

-- CreateIndex
CREATE INDEX "LotteryWin_merchantId_idx" ON "LotteryWin"("merchantId");

-- CreateIndex
CREATE INDEX "LotteryWin_configId_idx" ON "LotteryWin"("configId");

-- CreateIndex
CREATE INDEX "LotteryWin_giftId_idx" ON "LotteryWin"("giftId");

-- CreateIndex
CREATE INDEX "LotteryWin_email_idx" ON "LotteryWin"("email");

-- CreateIndex
CREATE INDEX "LotteryWin_phone_idx" ON "LotteryWin"("phone");

-- AddForeignKey
ALTER TABLE "Landing" ADD CONSTRAINT "Landing_lotteryConfigId_fkey" FOREIGN KEY ("lotteryConfigId") REFERENCES "LotteryConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryPlay" ADD CONSTRAINT "LotteryPlay_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryPlay" ADD CONSTRAINT "LotteryPlay_configId_fkey" FOREIGN KEY ("configId") REFERENCES "LotteryConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryPlay" ADD CONSTRAINT "LotteryPlay_landingId_fkey" FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryWin" ADD CONSTRAINT "LotteryWin_playId_fkey" FOREIGN KEY ("playId") REFERENCES "LotteryPlay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryWin" ADD CONSTRAINT "LotteryWin_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryWin" ADD CONSTRAINT "LotteryWin_configId_fkey" FOREIGN KEY ("configId") REFERENCES "LotteryConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
