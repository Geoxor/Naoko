/*
  Warnings:

  - You are about to drop the column `fastestBattleId` on the `Statistics` table. All the data in the column will be lost.
  - You are about to drop the `Battle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BattleToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Statistics" DROP CONSTRAINT "Statistics_fastestBattleId_fkey";

-- DropForeignKey
ALTER TABLE "_BattleToUser" DROP CONSTRAINT "_BattleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BattleToUser" DROP CONSTRAINT "_BattleToUser_B_fkey";

-- AlterTable
ALTER TABLE "Statistics" DROP COLUMN "fastestBattleId";

-- DropTable
DROP TABLE "Battle";

-- DropTable
DROP TABLE "_BattleToUser";
