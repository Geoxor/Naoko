import { DiscordAPIError, TextChannel } from "discord.js";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";

@command()
class Clear extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    let count = parseFloat(args[0]) + 1;
    count = count > 100 ? 100 : count;
    // Will return if count is not a string.
    if (isNaN(count)) return `⚠️ when not number`;

    try {
      await (message.channel as TextChannel).bulkDelete(count);
      return `Cleared ${count} messages!`;
    } catch (error: any) {
      const err = error as DiscordAPIError;
      return err.message;
    }
  }

  get commandData(): CommandData {
    return {
      name: "clear",
      category: "MODERATION",
      aliases: ["cls"],
      usage: "clear <amount>",
      description: "Bulk delete messages up to 100",
      permissions: ["ManageMessages"],
    }
  }
}
