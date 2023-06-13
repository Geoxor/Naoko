import { singleton } from "@triptyk/tsyringe";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import Logger from "../../../naoko/Logger";
import SpamCheckService from "../../../service/SpamCheckService";

@singleton()
export default class CheckForSpam extends AbstractPipelineElement {
  constructor(private logger: Logger, private spamChecker: SpamCheckService) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<boolean> {
    const message = payload.get("message");
    const content = message.content.toLowerCase();

    // Don't check in DM's
    if (!message.inGuild()) {
      return true;
    }

    const spamResult = this.spamChecker.checkForSpam(content);
    if (spamResult.isSpam) {
      await message.delete();
      this.logger.error(`SpamCheck ${spamResult.failedCheck} failed for ${message.author.username}`);
      return false;
    }

    return true;
  }

  isDiscordInvite(content: string) {
    return (
      content.includes("discord.gg") &&
      !(content.includes("discord.gg/geoxor") && (content.match(/discord.gg/g) || []).length == 1)
    );
  }

  isFreeNitro(content: string) {
    return content.includes("nitro") && content.includes("http");
  }
}
