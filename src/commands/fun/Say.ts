import command from '../../decorators/command';
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import MessageCreatePayload from '../../pipeline/messageCreate/MessageCreatePayload';

@command()
class Say extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const message = payload.get('message');

    if (args.length === 0) {
      return `What do you want to say?`;
    }

    await message.delete();
    return args.join(" ");
  }

  get commandData(): CommandData {
    return {
      name: "say",
      category: "FUN",
      usage: "say <sentence>",
      description: "Say your stupid message",
    }
  }
}
