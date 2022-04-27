import { Collection, Snowflake, Message } from 'discord.js';
import { definePlugin } from "../shaii/Plugin.shaii";

type MemberWarning = {
  saidBannedWords: BannedWords[];
  saidDifferentBannedWordCount: 0 | 1 | 2;
  lastBannedWordSentTime: number;
};

type BannedWords = typeof bannedWords[number];
const bannedWords = [
  "niger",
  "nigger",
] as const;

const memberWarnings: Collection<Snowflake, MemberWarning> = new Collection();
const memberWarningTimeoutTimer = setInterval(() => {
  memberWarnings.forEach((warning, authorId) => {
    const timeLeft = Date.now() - warning.lastBannedWordSentTime; 
    if (timeLeft < 60 * 1000) {
      setTimeout(() => {
        memberWarnings.delete(authorId);
      }, timeLeft);
    }
  });
}, 60 * 1000);

export default definePlugin({
  name: "@nightmaretopia/ban-words",
  version: "1.0.0",
  timers: { memberWarningTimeoutTimer },
  events: {
    messageCreate: (message: Message): void => {
      if (!message.member) return;    
  
      const content = message.content;
      const saidBannedWord = bannedWords.find(word => content.includes(word)) as BannedWords | undefined;

      if (saidBannedWord != null) {
        message.delete();

        const authorId = message.author.id;
        const warning = memberWarnings.has(authorId)
          ? memberWarnings.get(authorId)!
          : emptyMemberWarning();
        
        if (
          warning.saidBannedWords.includes(saidBannedWord) ||
          warning.saidDifferentBannedWordCount === 2
        ) {
          message.channel.send(`<@${authorId}>, you really like breaking rules, don't you?`);
          message.member.timeout(24 * 60 * 60 * 1000);
          memberWarnings.delete(authorId);
        } else {
          message.channel.send( 
            warning.saidDifferentBannedWordCount === 1
            ? `<@${authorId}>, you said another word that you shouldn't say, please be careful.`
            : `<@${authorId}>, you said a word that you shouldn't say, don't do this again.`
          );
          warning.saidBannedWords.push(saidBannedWord);
          warning.lastBannedWordSentTime = Date.now();
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
    lastBannedWordSentTime: Date.now(),
  };
}
