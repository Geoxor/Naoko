import { SHAII_ID } from "../constants";
import { randomChoice } from "../logic/logic.shaii";
import { definePlugin } from "../shaii/Plugin.shaii";
import answers from "./mention-replies/answers.json";

export default definePlugin({
  name: "@geoxor/mention-replies",
  version: "1.0.0",
  events: {
    messageCreate: message => {
      if (
        message.content.startsWith("<@!") &&
        message.mentions.members?.first()?.id === SHAII_ID &&
        message.type !== "REPLY"
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
