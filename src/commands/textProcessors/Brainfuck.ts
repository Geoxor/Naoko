import { Readable } from "stream";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import TextProcessingService from "../../service/TextProcessingService";

@command()
class Bainfuck extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    if (args.length === 0) return `What to you want to translate`;
    const response: string = this.textProcessingService.brainfuck(args.join(" "));
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
