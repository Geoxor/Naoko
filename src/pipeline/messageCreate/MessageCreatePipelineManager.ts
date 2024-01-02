import { singleton } from "tsyringe";
import { Message } from "discord.js";
import MessageCreatePayload from "./MessageCreatePayload";
import AbstractPipelineElement from "../AbstractPipelineElement";
import EnsureGhostRole from "./elements/EnsureGhostRole";
import CheckForSpam from "./elements/CheckForSpam";
import LoadDbUser from "./elements/LoadDbUser";
import RestrictedChannel from "./elements/RestrictedChannel";
import ParseCommand from "./elements/ParseCommand";
import ExecuteCommand from "./elements/ExecuteCommand";
import Logger from "../../naoko/Logger";

@singleton()
export default class MessageCreatePipelineManager {
  private pipeline: AbstractPipelineElement[];

  constructor(
    private logger: Logger,
    ensureGhostRole: EnsureGhostRole,
    checkForSpam: CheckForSpam,
    restrictedChannel: RestrictedChannel,
    parseCommand: ParseCommand,
    loadDbUser: LoadDbUser,
    executeCommand: ExecuteCommand,
  ) {
    this.pipeline = [ensureGhostRole, checkForSpam, restrictedChannel, parseCommand, loadDbUser, executeCommand];
  }

  public async handleMessageCreate(message: Message): Promise<void> {
    const payload = new MessageCreatePayload({ message });

    for (const element of this.pipeline) {
      try {
        const canContinue = await element.execute(payload);
        if (!canContinue) {
          this.logger.print(`MessageCreatePipeline ended after ${element.constructor.name}`);
          return;
        }
      } catch (error) {
        this.logger.error(`Error in messageCreatePipeline. Element: ${element.constructor.name}, Error: "${error}"`);
        return;
      }
    }
  }
}
