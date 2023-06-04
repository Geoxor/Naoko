import Discord from "discord.js";
import { fileTypeFromBuffer } from 'file-type';
import command from '../../decorators/command';
import { stack } from "../../logic/imageProcessors";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import MessageImageParser from "../../service/MessageImageParser";

// TODO: Refactor this to the main image processors
// so we can easily override the frames for diff
// processors blah blah fuck your mom
const stacks: {
  [key: string]: number;
} = {
  wasted: 90,
  vignette: 90,
  fuckyou: 90,
};

@command()
class Stack extends AbstractCommand {
  constructor(
    private messageImageParser: MessageImageParser,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const args = payload.get('args');

    const processorFunctionName = args[0];
    if (!processorFunctionName) return "Please enter the name of an image processor function";
    const buffer = await this.messageImageParser.parseBufferFromMessage(message, args);
    const resultBuffer = await stack(processorFunctionName, buffer, stacks[processorFunctionName]);
    const mimetype = await fileTypeFromBuffer(resultBuffer);
    const attachment = new Discord.AttachmentBuilder(resultBuffer, { name: `shit.${mimetype?.ext}` });
    return { files: [attachment] };
  }

  get commandData(): CommandData {
    return {
      name: "stack",
      category: "IMAGE_PROCESSORS",
      usage: `stack <processor_name> <image | url | reply | user_id>`,
      description: "Stack an image processor and make a gif out of it",
      requiresProcessing: true,
    };
  }
}
