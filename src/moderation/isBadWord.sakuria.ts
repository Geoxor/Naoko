import Discord from "discord.js";
import badWords from "../assets/badWords.json";

const badWordRegexs = badWords.map(word => new RegExp(word, "gi"));

export function isBadWord (message: Discord.Message) {
  for (let i = 0; i < badWordRegexs.length; i++) {
    const regex = badWordRegexs[i];
    if (regex.test(message.content)) {
      message.delete();
      return true;
    };
  }

  return false;
}