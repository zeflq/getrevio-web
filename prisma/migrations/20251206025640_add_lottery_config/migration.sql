-- CreateEnum
CREATE TYPE "ResetPlayLimit" AS ENUM ('daily', 'weekly', 'lifetime');

-- CreateEnum
CREATE TYPE "RequiresAction" AS ENUM ('review', 'formSubmit');

-- CreateTable
CREATE TABLE "LotteryConfig" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playLimitPerUser" INTEGER NOT NULL,
    "resetPlayLimit" "ResetPlayLimit",
    "maxWinners" INTEGER,
    "requiresAction" "RequiresAction",
    "gifts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LotteryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LotteryConfig_merchantId_idx" ON "LotteryConfig"("merchantId");

-- AddForeignKey
ALTER TABLE "LotteryConfig" ADD CONSTRAINT "LotteryConfig_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
