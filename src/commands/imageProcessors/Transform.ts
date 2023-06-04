import Discord from "discord.js";
import { fileTypeFromBuffer } from 'file-type';
import command from '../../decorators/command';
import { transform } from "../../logic/imageProcessors";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import MessageImageParser from "../../service/MessageImageParser";

@command()
class Transform extends AbstractCommand {
  constructor(
    private messageImageParser: MessageImageParser,
  ) {
    super();
  }

  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');
    const pipeline = payload.get('args');

    if (pipeline.length > 10) return "Pipeline can't be longer than 10 elements";
    const buffer = await this.messageImageParser.parseBufferFromMessage(message, pipeline);
    const resultBuffer = await transform(pipeline, buffer);
    const mimetype = await fileTypeFromBuffer(resultBuffer);
    const attachment = new Discord.AttachmentBuilder(resultBuffer, { name: `shit.${mimetype?.ext}` });
    return { files: [attachment] };
  }

  get commandData(): CommandData {
    return {
      name: "transform",
      aliases: ["tf"],
      usage: "transform <...processor_names> <image | url | reply | user_id>",
      category: "IMAGE_PROCESSORS",
      description: "Transform an image with a pipeline",
      requiresProcessing: true,
    }
  }
}
