import command from "../../decorators/command";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import TextProcessingService from "../../service/TextProcessingService";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';

@command()
class Textify extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');

    const pipeline = [];
    while (true) {
      const arg = args.shift() || '';
      if (this.textProcessingService.isTextProcessor(arg)) {
        pipeline.push(arg);
      } else {
        args.unshift(arg);
        break;
      }
    }

    if (pipeline.length === 0) return 'Pipeline cannot be empty';
    if (pipeline.length > 10) return "Pipeline can't be longer than 10 iterators";

    const userSentence = args.join(' ');
    if (userSentence.length === 0) return "What do you want to textify?";

    return this.textProcessingService.textify(pipeline, userSentence);
  }

  get commandData(): CommandData {
    return {
      name: "textify",
      usage: "textify <...processor_names> <text>",
      category: "TEXT_PROCESSORS",
      description: "Transform a sentence with a pipeline",
      requiresProcessing: true,
    }
  }
}
