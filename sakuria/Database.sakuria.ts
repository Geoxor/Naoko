import { Inventory, PrismaClient, Statistics, User } from "@prisma/client";
import { IBattle } from "../types"

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
          create: { }
        },
        statistics: {
          create: { }
        }
      },
      include: {
        inventory: true,
        statistics: true,
      },
    });
    console.log(`UPSERT: User: ${id}`);
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
    return console.log(`CREATE: Kick: kicker: ${kicker} - kickee: ${kickee}`);
  }

  /**
   * Get's a user's inventory from the database
   * If the user doesn't exist in the database it will create it
   * @param {string} userId the user to get
   * @author Geoxor
   */
  public async getInventory(userId: string): Promise<Inventory> {
    const inventory = await this.prisma.inventory.findFirst({
      where: { userId }
    });

    console.log(`GET Inventory: ${userId}`);
    return inventory!;
  }

  public async addBattleRewardsToUser(user: string, battle: IBattle): Promise<void> {
    await this.prisma.statistics.update({
      data: {
        xp: {
          increment: battle.xp
        },
        totalAttacks: {
          increment: battle.totalAttacks
        },
        totalDamageDealt: {
          increment: battle.totalDamageDealt
        },
        rareWaifusKilled: {
          increment: battle.rarity === 'rare' ? 1 : 0
        },
        commonWaifusKilled: {
          increment: battle.rarity === 'common' ? 1 : 0
        },
        mythicalWaifusKilled: {
          increment: battle.rarity === 'mythical' ? 1 : 0
        },
        uncommonWaifusKilled: {
          increment: battle.rarity === 'uncommon' ? 1 : 0
        },
        legendaryWaifusKilled: {
          increment: battle.rarity === 'legendary' ? 1 : 0
        },
      },
      where: {userId: user}
    })
    console.log(`UPDATE: Statistics: ${user}`);
    await this.prisma.inventory.update({
      data: {
        balance: {
          increment: battle.money
        },
      },
      where: {userId: user}
    })
    console.log(`UPDATE: Inventory: ${user}`);
    return
  }
}

export const db = new DB();
