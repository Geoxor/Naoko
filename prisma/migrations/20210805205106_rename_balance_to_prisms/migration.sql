/*
  Warnings:

  - You are about to drop the column `balance` on the `Inventory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "balance",
ADD COLUMN     "prisms" INTEGER NOT NULL DEFAULT 0;
