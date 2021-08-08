-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "favoriteWaifu" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kick" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "byUserId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "fastestBattleId" INTEGER,
    "totalPrismaSpent" INTEGER NOT NULL DEFAULT 0,
    "totalPrismaCollected" INTEGER NOT NULL DEFAULT 0,
    "totalAttacks" INTEGER NOT NULL DEFAULT 0,
    "topDPS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commonWaifusKilled" INTEGER NOT NULL DEFAULT 0,
    "uncommonWaifusKilled" INTEGER NOT NULL DEFAULT 0,
    "rareWaifusKilled" INTEGER NOT NULL DEFAULT 0,
    "legendaryWaifusKilled" INTEGER NOT NULL DEFAULT 0,
    "mythicalWaifusKilled" INTEGER NOT NULL DEFAULT 0,
    "health" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "healthRegen" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "magicalDamage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "physicalDamage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "physicalArmor" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "magicArmor" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "critChance" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "rangedDamageMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "meleeDamageMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "summonDamageMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" SERIAL NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BattleToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild.id_unique" ON "Guild"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User.id_unique" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_unique" ON "Inventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_userId_unique" ON "Statistics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_BattleToUser_AB_unique" ON "_BattleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BattleToUser_B_index" ON "_BattleToUser"("B");

-- AddForeignKey
ALTER TABLE "Kick" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kick" ADD FOREIGN KEY ("byUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistics" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistics" ADD FOREIGN KEY ("fastestBattleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BattleToUser" ADD FOREIGN KEY ("A") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BattleToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
