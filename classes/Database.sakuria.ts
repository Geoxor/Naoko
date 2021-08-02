import { commands } from "../commands";
import { PrismaClient } from "@prisma/client";

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
    return await this.prisma.user.upsert({
      where: { id },
      update: {},
      create: { id },
    });
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
  }
}

export const db = new DB();
