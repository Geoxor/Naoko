import Discord from "discord.js";
import Logger from "../sakuria/Logger.sakuria";
import {isFreeNitro} from "../moderation/isFreeNitro.sakuria";
import {isBadWord} from "../moderation/isBadWord.sakuria";
import { DatabaseUser } from "src/types";

const checks = [
  isFreeNitro,
  isBadWord
];

export default function (message: Discord.Message & {databaseUser: DatabaseUser}, next: (message: Discord.Message & {databaseUser: DatabaseUser}) => any): void {
  if (message.author.bot) return next(message);
  if (message.guildId !== "385387666415550474") return;
  console.log('testfuck');
  
  for (let i = 0; i < checks.length; i++) {
    const checkFn = checks[i];
    const idxString = `[${i + 1}/${checks.length}]`;
    const isFailed = checkFn(message);
    Logger.command.print(`${idxString} Checking ${checkFn.name}`);
    if (isFailed){
      return Logger.command.error(`${idxString} Check ${checkFn.name} failed for ${message.author.username}`);
    }
  }

  return next(message);
}