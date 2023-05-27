import { ChannelType } from "discord.js";
import { GEOXOR_GUILD_ID, TESTING_GUILD_ID } from "../constants";
import { isDiscordInvite } from "../moderation/isDiscordInvite";
import { isFreeNitro } from "../moderation/isFreeNitro";
import { logger } from "../naoko/Logger";
import { IMessage } from "../types";

const checks = [isFreeNitro, isDiscordInvite];

export default async function (message: IMessage, next: (message: IMessage) => any): Promise<void> {
  try {
    if (!(message.guild?.id === GEOXOR_GUILD_ID || message.guild?.id === TESTING_GUILD_ID || message.channel.type == ChannelType.DM))
      return;
    for (let i = 0; i < checks.length; i++) {
      const checkFn = checks[i];
      const idxString = `[${i + 1}/${checks.length}]`;
      const isFailed = checkFn(message);
      if (isFailed) {
        await message.delete().catch(() => { });
        return logger.error(`${idxString} Check ${checkFn.name} failed for ${message.author.username}`);
      }
    }
    return next(message);
  } catch (error) {
    logger.error(error as string);
    return;
  }
}
