import { Readable } from "stream";
import { textToBrainfuck } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Bainfuck extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    if (message.args.length === 0) return `What to you want to translate`;
    const response: string = textToBrainfuck(message.args.join(" "));
    if (response.length > 2000) {
      return {
        content: "Bro the result is too big gonna put it in a file",
        files: [{ name: "shit.bf", attachment: Readable.from(response) }],
      };
    }
    return response;
  }

  get commandData(): CommandData {
    return {
      name: "brainfuck",
      category: "TEXT_PROCESSORS",
      usage: "brainfuck <sentence>",
      description: "Translates your sentence to brainfuck esoteric language",
    }
  }
}
