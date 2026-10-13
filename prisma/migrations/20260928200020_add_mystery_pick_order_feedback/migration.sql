-- AlterTable
ALTER TABLE "MysteryPick" ADD COLUMN "feedbackRating" TEXT;
ALTER TABLE "MysteryPick" ADD COLUMN "feedbackTags" JSONB;
ALTER TABLE "MysteryPick" ADD COLUMN "orderedAt" DATETIME;
ALTER TABLE "MysteryPick" ADD COLUMN "paymentMethod" TEXT;
