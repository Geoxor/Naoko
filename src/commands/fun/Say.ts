import command from '../../decorators/command';
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class Say extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    if (message.args.length === 0) return `What do you want to say?`;
    message.delete().catch(() => { });
    return message.args.join(" ");
  }
  getCommandData(): CommandData {
    return {
      name: "say",
      category: "FUN",
      usage: "say <sentence>",
      description: "Say your stupid message",
    }
  }
}
