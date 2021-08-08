/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Kick` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Kick` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[byUserId]` on the table `Kick` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Statistics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildId` to the `Battle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "guildId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "balance" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Inventory.id_unique" ON "Inventory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Kick.id_unique" ON "Kick"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Kick.userId_unique" ON "Kick"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Kick.byUserId_unique" ON "Kick"("byUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Statistics.id_unique" ON "Statistics"("id");

-- AlterIndex
ALTER INDEX "Inventory_userId_unique" RENAME TO "Inventory.userId_unique";

-- AlterIndex
ALTER INDEX "Statistics_userId_unique" RENAME TO "Statistics.userId_unique";
