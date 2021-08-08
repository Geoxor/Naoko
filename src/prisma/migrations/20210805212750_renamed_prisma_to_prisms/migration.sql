/*
  Warnings:

  - You are about to drop the column `totalPrismaCollected` on the `Statistics` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrismaSpent` on the `Statistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Statistics" DROP COLUMN "totalPrismaCollected",
DROP COLUMN "totalPrismaSpent",
ADD COLUMN     "totalPrismsCollected" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPrismsSpent" INTEGER NOT NULL DEFAULT 0;
