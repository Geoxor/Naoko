import command from '../../decorators/command';
import { textToUwufy } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class Uwufy extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    if (message.args.length === 0) return "b-baka!! you need to give me s-something! uwu";
    return textToUwufy(message.args.join(" "));
  }

  getCommandData(): CommandData {
    return {
      name: "uwufy",
      category: "TEXT_PROCESSORS",
      usage: "uwufy <sentence>",
      description: "Transforms your sentence to uwu",
    }
  }
}
