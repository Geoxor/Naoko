import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import TextProcessingService from "../../service/TextProcessingService";

@command()
class Britify extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    if (args.length === 0) return "Tell me whad u wan' in bri'ish cunt";
    return this.textProcessingService.britify(args.join(" "));
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
