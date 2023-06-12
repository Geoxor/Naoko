import { singleton } from "@triptyk/tsyringe";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import Logger from "../../../naoko/Logger";

// TODO: This can be handled by the auto moderator
@singleton()
export default class CheckForSpam extends AbstractPipelineElement {
  constructor(
    private logger: Logger,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<boolean> {
    const message = payload.get('message');
    const content = message.content.toLowerCase();

    // Don't check in DM's
    if (!message.inGuild()) {
      return true;
    }

    if (this.isDiscordInvite(content) || this.isFreeNitro(content)) {
      await message.delete();
      this.logger.error(`SpamCheck failed for ${message.author.username}`);
      return false;
    }

    return true;
  }

  isDiscordInvite(content: string) {
    return (
      content.includes("discord.gg") &&
      !(content.includes("discord.gg/geoxor") &&
      (content.match(/discord.gg/g) || []).length == 1)
    );
  }

  isFreeNitro(content: string) {
    return (content.includes("nitro") && content.includes("http"));
  }
}
