import { Inventory, PrismaClient, Statistics, User } from "@prisma/client";
import { IBattle } from "../types";
import logger from "./Logger.sakuria";

/**
 * Prisma wrapper for making shit simple
 * @author Bluskript, Geoxor
 */
class DB {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Adds a new user if not exists in the database
   * @author Bluskript, Geoxor
   */
  public async newUser(id: string) {
    const user = await this.prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        inventory: {
          create: {},
        },
        statistics: {
          create: {},
        },
      },
      include: {
        inventory: true,
        statistics: true,
      },
    });
    logger.prisma.generic(`UPSERT: User: ${id}`);
    return user;
  }

  /**
   * Makes a DB record for a kick
   * @param {string} kicker the user (admin) who is casting the kick
   * @param {string} kickee the user (victim) who is getting kicked
   * @author Bluskript, Geoxor
   */
  public async newKick(kicker: string, kickee: string) {
    const timestamp = Date.now();
    const { id: byUserId } = await this.newUser(kicker);
    const { id: userId } = await this.newUser(kickee);
    await this.prisma.kick.create({ data: { byUserId, userId, timestamp } });
    return logger.prisma.generic(`CREATE: Kick: kicker: ${kicker} - kickee: ${kickee}`);
  }

  /**
   * Get's a user's inventory from the database
   * If the user doesn't exist in the database it will create it
   * @param {string} userId the user to get
   * @author Geoxor
   */
  public async getInventory(userId: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { userId },
    });

    logger.prisma.generic(`GET Inventory: ${userId}`);
    return inventory!;
  }

  /**
   * Get's a user's statistics from the database
   * If the user doesn't exist in the database it will create it
   * @param {string} userId the user to get
   * @author Geoxor
   */
   public async getStatistics(userId: string) {
    const statistics = await this.prisma.statistics.findFirst({
      where: { userId },
    });

    logger.prisma.generic(`GET Statistics: ${userId}`);
    return statistics!;
  }

  public async addBattleRewardsToUser(user: string, battle: IBattle) {
    // Prepare the statistics to commit to the database
    let statistics = {
      xp: { increment: battle.xp },
      totalAttacks: { increment: battle.totalAttacks },
      totalDamageDealt: { increment: battle.totalDamageDealt },
      totalPrismsCollected: { increment: battle.money },
    } as { [key: string]: any };

    // Increment the waifu rarity they killed
    statistics[`${battle.rarity}WaifusKilled`] = { increment: 1 };

    // Commit their statistics
    await this.prisma.statistics.update({
      data: statistics,
      where: { userId: user },
    });
    logger.prisma.generic(`UPDATE: Statistics: ${user}`);

    // Commit their new prisms to their inventory
    await this.prisma.inventory.update({
      data: { prisms: { increment: battle.money } },
      where: { userId: user },
    });
    logger.prisma.generic(`UPDATE: Inventory: ${user}`);
    return;
  }
}

export const db = new DB();
