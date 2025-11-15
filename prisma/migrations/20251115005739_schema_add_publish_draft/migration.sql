/*
  Warnings:

  - You are about to drop the column `content` on the `Landing` table. All the data in the column will be lost.
  - Added the required column `contentDraft` to the `Landing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Landing" DROP COLUMN "content",
ADD COLUMN     "contentDraft" JSONB NOT NULL,
ADD COLUMN     "contentPublished" JSONB;
