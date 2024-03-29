import plugin from "../../decorators/plugin";
import { GEOXOR_GENERAL_CHANNEL_ID } from "../../constants";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import answers from "./mention-replies-answers.json" assert { type: "json" };
import Discord from "discord.js";
import CommonUtils from "../../service/CommonUtils";

@plugin()
class MentionReplies extends AbstractPlugin {
  constructor(private commonUtils: CommonUtils) {
    super();
  }

  public get pluginData(): PluginData {
    return {
      name: "@geoxor/mention-replies",
      version: "1.0.0",
      events: {
        messageCreate: this.messageCreate,
      },
    };
  }

  private async messageCreate(message: Discord.Message) {
    const naokoId = message.client.user.id;
    if (!message.content.startsWith("<@" + naokoId) || message.channelId === GEOXOR_GENERAL_CHANNEL_ID) {
      return;
    }

    message.content.trim() === `<@${naokoId}>`
      ? await message.reply("what tf do you want") // Reply with this when they purely ping her with no question
      : await message.reply(this.commonUtils.randomChoice(answers));
  }
}
