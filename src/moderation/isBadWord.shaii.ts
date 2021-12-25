import normalize from "@taku.moe/pura";
// @ts-ignore
import badWords from "../assets/badWords.json";
import goodWords from "../assets/goodWords.json";
import { IMessage } from "../types";

const badWordRegexs = badWords.map((word: string) => new RegExp(word, "gi"));
const goodWordRegexs = goodWords.map((word: string) => new RegExp(word, "gi"));

export function isBadWord(message: IMessage) {
  let normalized = normalize(message.content).replace(/\s/g, "");

  // Remove all the good words and replace them with spaces so they don't concat into sex and shit
  for (let i = 0; i < goodWordRegexs.length; i++) {
    normalized = normalized.replace(goodWordRegexs[i], " ");
  }

  // Split on where the good words were
  const splits = normalized.split(" ");

  for (let i = 0; i < splits.length; i++) {
    const word = splits[i];

    for (let i = 0; i < badWordRegexs.length; i++) {
      const badRegex = badWordRegexs[i];

      // If it contains a bad word
      if (badRegex.test(word)) {
        return true;
      }
    }
  }

  return false;
}
