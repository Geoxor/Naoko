import { TextChannel, DiscordAPIError, codeBlock } from "discord.js";
import MessageCreatePayload from "../../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../../types";
import AbstractCommand, { CommandData } from "../../AbstractCommand";
import { singleton } from "@triptyk/tsyringe";

@singleton()
export class Clear extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    let count = Number(args[0]);
    if (isNaN(count) || count <= 1) {
      return `⚠️ ${args[0]} is not a valid number!`;
    }

    const channel = (message.channel as TextChannel);
    let deletedCount = 0;
    try {
      // Count MUST be between 2 and 100
      while (count > 1) {
        const countToDelete = count > 100 ? 100 : count;
        const deleteResult = await channel.bulkDelete(countToDelete, true);
        deletedCount += deleteResult.size;
        if (deleteResult.size === 0) {
          break;
        }
      }
      await channel.send(`Cleared ${deletedCount} messages!`);
    } catch (error: any) {
      await channel.send(`An error occurred while deleting messages:\n${codeBlock(error.message || error)}`);
    }
  }

  get commandData(): CommandData {
    return {
      name: "clear",
      category: "MODERATION",
      usage: "<message-count>",
      description: "Bulk delete messages. Can delete all messages that are up to 2 weeks old",
      permissions: ["ManageMessages"],
      requiresProcessing: true,
    }
  }
}
