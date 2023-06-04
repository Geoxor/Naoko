import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import TextProcessingService from "../../service/TextProcessingService";

@command()
class Spongify extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');
 
    if (args.length === 0) return "What do you want to SpOnGiFy?";
    return this.textProcessingService.spongify(args.join(" "));
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

