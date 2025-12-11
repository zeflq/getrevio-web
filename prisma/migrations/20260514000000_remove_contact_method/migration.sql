/*
  Warning: this migration drops the `contactMethod` column; any historic values will be lost.
*/

-- AlterTable
ALTER TABLE "LotteryConfig" DROP COLUMN "contactMethod";

-- DropEnum
DROP TYPE "LotteryContactMethod";
