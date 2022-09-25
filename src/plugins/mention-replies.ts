import { SHAII_ID } from "../constants";
import { randomChoice } from "../logic/logic";
import { definePlugin } from "../naoko/Plugin";
import answers from "./mention-replies/answers.json";

export default definePlugin({
  name: "@geoxor/mention-replies",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      if (
        message.content.startsWith("<@" + SHAII_ID)
      ) {
        // Reply with this when they purely ping her with no question
        if (!message.content.substring(`<@!${SHAII_ID}>`.length).trim()) {
          message.reply("what tf do you want");
          return;
        }
        message.reply(randomChoice(answers));
      }
      return;
    },
  },
});
