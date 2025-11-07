-- AlterTable
ALTER TABLE "Shortlink" ADD COLUMN     "themeId" TEXT;

-- AddForeignKey
ALTER TABLE "Shortlink" ADD CONSTRAINT "Shortlink_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
