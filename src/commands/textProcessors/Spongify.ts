import { randomChoice, textToSpongify } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Spongify extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    if (message.args.length === 0) return `What do you want to SpOnGiFy`;
    return textToSpongify(message.args.join(" "), randomChoice([true, false]));
  }
  get commandData(): CommandData {
    return {
      name: "spongify",
      category: "TEXT_PROCESSORS",
      usage: "spongify <sentence>",
      description: "mAkEs YoU sPeAk lIkE ThIs",
    }
  }
}
