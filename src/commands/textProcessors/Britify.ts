import { textToBritify } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Bitify extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    if (message.args.length === 0) return "Tell me whad u wan' in bri'ish cunt";
    return textToBritify(message.args.join(" "));
  }

  get commandData(): CommandData {
    return {
      name: "britify",
      usage: "britify <sentence>",
      category: "TEXT_PROCESSORS",
      description: "Transforms your sentence to british",
    }
  }
}
