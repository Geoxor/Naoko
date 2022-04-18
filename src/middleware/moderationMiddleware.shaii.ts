import Discord from "discord.js";
import { GEOXOR_GUILD_ID, QBOT_DEV_GUILD_ID, TESTING_GUILD_ID } from "../constants";
import { isBadWord } from "../moderation/isBadWord.shaii";
import { isDiscordInvite } from "../moderation/isDiscordInvite.shaii";
import { isFreeNitro } from "../moderation/isFreeNitro.shaii";
import { isIP } from "../moderation/isIP.shaii";
import { isMuted } from "../moderation/isMuted.shaii";
import { isSelfMuted } from "../moderation/isSelfMuted.shaii";
import logger from "../shaii/Logger.shaii";
import { IMessage } from "../types";

const checks = [isFreeNitro, isBadWord, isDiscordInvite, isMuted, isSelfMuted, isIP];

export default async function (message: IMessage, next: (message: IMessage) => any): Promise<void> {
  try {
    if (
      !(
        message.guild?.id === GEOXOR_GUILD_ID ||
        message.guild?.id === TESTING_GUILD_ID ||
        message.guild?.id === QBOT_DEV_GUILD_ID ||
        message.channel.type == "DM"
      )
    )
      return;
    for (let i = 0; i < checks.length; i++) {
      const checkFn = checks[i];
      const idxString = `[${i + 1}/${checks.length}]`;
      const isFailed = checkFn(message);
      if (isFailed) {
        await message.delete().catch(() => {});
        return logger.error(`${idxString} Check ${checkFn.name} failed for ${message.author.username}`);
      }
    }
    return next(message);
  } catch (error) {
    logger.error(error as string);
    return;
  }
}
