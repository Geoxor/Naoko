import command from '../../decorators/command';
import MessageCreatePayload from '../../pipeline/messageCreate/MessageCreatePayload';
import TextProcessingService from '../../service/TextProcessingService';
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class Uwufy extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');

    if (args.length === 0) return "b-baka!! you need to give me s-something! uwu";
    return this.textProcessingService.uwufy(args.join(" "));
  }

  get commandData(): CommandData {
    return {
      name: "uwufy",
      category: "TEXT_PROCESSORS",
      usage: "uwufy <sentence>",
      description: "Transforms your sentence to uwu",
    }
  }
}
