import Discord from "discord.js";
import { GEOXOR_GUILD_ID, TESTING_GUILD_ID } from "../constants";
import { isBadWord } from "../moderation/isBadWord.naoko";
import { isDiscordInvite } from "../moderation/isDiscordInvite.naoko";
import { isFreeNitro } from "../moderation/isFreeNitro.naoko";
import { isIP } from "../moderation/isIP.naoko";
import { isMuted } from "../moderation/isMuted.naoko";
import { isSelfMuted } from "../moderation/isSelfMuted.naoko";
import logger from "../naoko/Logger.naoko";
import { IMessage } from "../types";

const checks = [isFreeNitro, isBadWord, isDiscordInvite, isMuted, isIP];

export default async function (message: IMessage, next: (message: IMessage) => any): Promise<void> {
  try {
    if (!(message.guild?.id === GEOXOR_GUILD_ID || message.guild?.id === TESTING_GUILD_ID || message.channel.type == "DM"))
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
