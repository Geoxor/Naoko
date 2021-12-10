import logger from "../shaii/Logger.shaii";
import { isFreeNitro } from "../moderation/isFreeNitro.shaii";
import { isBadWord } from "../moderation/isBadWord.shaii";
import { IMessage } from "../types";
import { isMuted } from "../moderation/isMuted.shaii";
import { isIP } from "../moderation/isIP.shaii";
import { GEOXOR_GUILD_ID, TESTING_GUILD_ID, QBOT_DEV_GUILD_ID } from "../constants";

const checks = [isFreeNitro, isBadWord, isMuted, isIP];

export default async function (message: IMessage, next: (message: IMessage) => any): Promise<void> {
  try {
    if (message.author.bot) return next(message);
    if (
      message.guild?.id !== GEOXOR_GUILD_ID &&
      message.guild?.id !== TESTING_GUILD_ID &&
      message.guild?.id !== QBOT_DEV_GUILD_ID
    )
      return;
    for (let i = 0; i < checks.length; i++) {
      const checkFn = checks[i];
      const idxString = `[${i + 1}/${checks.length}]`;
      const isFailed = checkFn(message);
      if (isFailed) {
        await message.delete();
        return logger.error(`${idxString} Check ${checkFn.name} failed for ${message.author.username}`);
      }
    }
    return next(message);
  } catch (error) {
    logger.error(error as string);
    return;
  }
}
