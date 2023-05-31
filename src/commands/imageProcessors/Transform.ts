import Discord from "discord.js";
import { fileTypeFromBuffer } from 'file-type';
import { transform } from "../../logic/imageProcessors";
import { parseBufferFromMessage } from "../../logic/logic";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Transform extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    const pipeline = message.args;
    if (pipeline.length > 10) return "Pipeline can't be longer than 10 elements";
    const buffer = await parseBufferFromMessage(message);
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
