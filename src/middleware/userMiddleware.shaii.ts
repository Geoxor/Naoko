import Discord, { GuildMember } from "discord.js";
import { GHOSTS_ROLE_ID } from "../constants";
import logger from "../shaii/Logger.shaii";
import { User } from "../shaii/Database.shaii";
import { IMessage } from "../types";

export async function userMiddleware(message: Discord.Message, next: (message: IMessage) => any): Promise<void> {
  if (message.member) {
    let databaseUser = await User.findOneOrCreate(message.member);
    (message as IMessage).databaseUser = databaseUser;
    if (!hasGhostsRole(message.member)) {
      giveGhostsRole(message.member).catch((error) => {
        logger.error(error as string);
      });
    }
    next(message as IMessage);
  }
}

export function hasGhostsRole(member: Discord.GuildMember): boolean {
  return member.roles.cache.has(GHOSTS_ROLE_ID);
}

export async function giveGhostsRole(member: Discord.GuildMember): Promise<GuildMember> {
  return member.roles.add(GHOSTS_ROLE_ID);
}
