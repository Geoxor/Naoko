import Logger from "../sakuria/Logger.sakuria";
import { isFreeNitro } from "../moderation/isFreeNitro.sakuria";
import { isBadWord } from "../moderation/isBadWord.sakuria";
import { IMessage } from "../types";
import { isMuted } from "../moderation/isMuted.sakuria";
import { isIP } from "../moderation/isIP.sakuria";

const checks = [isFreeNitro, isBadWord, isMuted, isIP];

export default function (message: IMessage, next: (message: IMessage) => any): void {
  if (message.author.bot) return next(message);
  if (message.guild?.id !== "385387666415550474") return;
  if (message.channel.id === "881632596298170399") return next(message);
  for (let i = 0; i < checks.length; i++) {
    const checkFn = checks[i];
    const idxString = `[${i + 1}/${checks.length}]`;
    const isFailed = checkFn(message);
    if (isFailed) {
      message.delete();
      return Logger.command.error(`${idxString} Check ${checkFn.name} failed for ${message.author.username}`);
    }
  }

  return next(message);
}
