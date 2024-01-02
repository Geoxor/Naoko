import { singleton } from "tsyringe";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import SpamCheckService from "../../../service/SpamCheckService";

@singleton()
export default class CheckForSpam extends AbstractPipelineElement {
  constructor(
    private spamChecker: SpamCheckService,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload) {
    const message = payload.get("message");
    const content = message.content.toLowerCase();

    // Don't check in DM's
    if (!message.inGuild()) {
      return true;
    }

    const spamResult = this.spamChecker.checkForSpam(content);
    if (spamResult.isSpam) {
      await message.delete();
      return `SpamCheck ${spamResult.failedCheck} failed for ${message.author.username}`;
    }

    return true;
  }
}
