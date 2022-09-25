import { Collection, Snowflake, Message } from "discord.js";
import { definePlugin } from "../naoko/Plugin.naoko";

type MemberWarning = {
  saidBannedWords: string[];
  saidDifferentBannedWordCount: 0 | 1 | 2;
  removeWarningTime: number;
};

// just in case some trolley happened and `require()` is banned
//@ts-ignore
const bannedWords = (require("../assets/badWords.json") as string[])
  .map(word => ` ${word} `); // makes it so that it doesn't mute people randomly

const memberWarnings: Collection<Snowflake, MemberWarning> = new Collection();
const memberWarningTimeoutTimer = setInterval(() => {
  memberWarnings.forEach((warning, authorId) => {
    const timeLeft = warning.removeWarningTime - Date.now();
    if (timeLeft < 60 * 1000) {
      setTimeout(() => {
        memberWarnings.delete(authorId);
      }, timeLeft);
    }
  });
}, 60 * 1000);

const DAY = 24 * 60 * 60 * 1000;

export default definePlugin({
  name: "@nightmaretopia/ban-words",
  version: "1.0.0",
  timers: { memberWarningTimeoutTimer },
  events: {
    messageCreate: (message: Message): void => {
      if (!message.member) return;

      const content = message.content;
      const saidBannedWord = bannedWords.find(word => content.includes(word));

      if (saidBannedWord != null) {
        message.delete();

        const authorId = message.author.id;
        const warning = memberWarnings.get(authorId) ?? emptyMemberWarning();

        if (
          warning.saidBannedWords.includes(saidBannedWord) ||
          warning.saidDifferentBannedWordCount === 2
        ) {
          message.channel.send(`<@${authorId}>, you really like breaking rules, don't you?`);
          message.member.timeout(DAY).catch(() => { });
          memberWarnings.delete(authorId);
        } else {
          message.channel.send(
            warning.saidDifferentBannedWordCount === 1
              ? `<@${authorId}>, you said another word that you shouldn't say, please be careful.`
              : `<@${authorId}>, you said a word that you shouldn't say, don't do this again.`
          );
          warning.saidBannedWords.push(saidBannedWord);
          warning.removeWarningTime = Date.now() + DAY;
          warning.saidDifferentBannedWordCount++;
          memberWarnings.set(authorId, warning);
        }
      }
    },
  },
});

function emptyMemberWarning(): MemberWarning {
  return {
    saidBannedWords: [],
    saidDifferentBannedWordCount: 0,
    removeWarningTime: Date.now() + DAY,
  };
}
