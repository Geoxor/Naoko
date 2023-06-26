import { AttachmentBuilder, Awaitable } from "discord.js";
import { fileTypeFromBuffer } from "file-type";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import ImageProcessorService from "../../service/ImageProcessorService";
import Jimp from "jimp";
import ThreeDProcessorService from "../../service/3dProcessorService";
import ImageUtilService from "../../service/ImageUtilService";
import plugin from "../../decorators/plugin";
import { singleton } from "@triptyk/tsyringe";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import Logger from "../../naoko/Logger";

@singleton()
class Transform extends AbstractCommand {
  constructor(
    private messageImageParser: ImageUtilService,
    private imageProcessorService: ImageProcessorService,
    private threeDProcessorService: ThreeDProcessorService,
    private logger: Logger
  ) {
    super();
  }

  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const pipeline = payload.get("args");

    if (pipeline.length > 10) return "Pipeline can't be longer than 10 elements";
    const buffer = await this.messageImageParser.parseBufferFromMessage(message, pipeline);
    const resultBuffer = await this.transform(pipeline, buffer);
    const mimetype = await fileTypeFromBuffer(resultBuffer);
    const attachment = new AttachmentBuilder(resultBuffer, { name: `shit.${mimetype?.ext}` });
    return { files: [attachment] };
  }

  private async transform(pipeline: string[], buffer: Buffer) {
    let fuckedBuffer = buffer;
    const allImageProcessors: Record<string, (buffer: Buffer) => Awaitable<Buffer>> = {
      ...this.imageProcessorService.getProcessors(),
      ...this.threeDProcessorService.getProcessors(),
    };

    const functions = pipeline.map((name) => allImageProcessors[name]).filter((processor) => !!processor);
    const bar = this.logger.progress("Pipelines - ", functions.length);
    for (let i = 0; i < functions.length; i++) {
      const start = Date.now();
      const method = functions[i];
      fuckedBuffer = await method(fuckedBuffer);
      this.logger.setProgressValue(bar, i / functions.length);

      // This is to avoid exp thread blocking
      if (Date.now() - start > 10000) return fuckedBuffer;
    }
    return fuckedBuffer;
  }

  public get commandData(): CommandData {
    return {
      name: "transform",
      usage: "<processor_name>... [(<url> | <user_id>)]",
      category: "IMAGE_PROCESSORS",
      description: "Transform an image with a pipeline." + ImageProcessors.IMAGE_DETECTION_INFO,
      requiresProcessing: true,
    };
  }
}

@singleton()
class Stack extends AbstractCommand {
  private readonly DEFAULT_STACK_COUNT: Record<string, number> = {
    wasted: 90,
    vignette: 90,
    fuckyou: 90,
  } as const;

  constructor(
    private messageImageParser: ImageUtilService,
    private imageProcessors: ImageProcessorService,
    private logger: Logger
  ) {
    super();
  }

  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const args = payload.get("args");

    const processorFunctionName = args[0];
    if (!processorFunctionName) {
      return "Please enter the name of an image processor function";
    }

    const buffer = await this.messageImageParser.parseBufferFromMessage(message, args);
    const resultBuffer = await this.createStack(
      processorFunctionName,
      buffer,
      this.DEFAULT_STACK_COUNT[processorFunctionName]
    );

    const mimetype = await fileTypeFromBuffer(resultBuffer);
    const attachment = new AttachmentBuilder(resultBuffer, { name: `shit.${mimetype?.ext}` });
    return { files: [attachment] };
  }

  private async createStack(name: string, buffer: Buffer, iterations: number = 6): Promise<Buffer> {
    // Get the processor function
    const processorFunction = this.imageProcessors.getProcessors()[name];

    // if theres no image processor function found return the buffer
    if (!processorFunction) return buffer;

    const firstFrameBuffer = await Jimp.read(buffer);
    const firstFrame = await this.messageImageParser.getRGBAUintArray(firstFrameBuffer);
    const { width, height } = firstFrameBuffer.bitmap;
    const bufferFrames: Buffer[] = [buffer];
    const renderedFrames: Uint8Array[] = [firstFrame];

    const bar = this.logger.progress("Stacks - ", iterations);

    for (let i = 0; i < iterations; i++) {
      // Iterate through the frames one frame behind
      // if it's the starting frame then
      // pick the first frame
      bufferFrames[i] = await processorFunction(bufferFrames[i - 1] || bufferFrames[0]);

      // Get the clamp RGBA array of the current
      // frame and add it 1 frame ahead
      // of the first starting frame
      renderedFrames[i + 1] = await this.messageImageParser.getRGBAUintArray(await Jimp.read(bufferFrames[i]));

      this.logger.setProgressValue(bar, i / iterations);
    }

    return await this.messageImageParser.encodeFramesToGif(renderedFrames, width, height, ~~(1000 / 60));
  }

  public get commandData(): CommandData {
    return {
      name: "stack",
      category: "IMAGE_PROCESSORS",
      usage: `<processor_name> [(<url> | <user_id>)]`,
      description: "Stack an image processor and make a gif out of it." + ImageProcessors.IMAGE_DETECTION_INFO,

      requiresProcessing: true,
    };
  }
}

@singleton()
class SingleImageProcessor extends AbstractCommand {
  constructor(
    private messageImageParser: ImageUtilService,
    private imageProcessorService: ImageProcessorService,
    private threeDProcessorService: ThreeDProcessorService
  ) {
    super();
  }

  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const commandName = payload.get("commandName");
    const args = payload.get("args");

    const allImageProcessors = {
      ...this.imageProcessorService.getProcessors(),
      ...this.threeDProcessorService.getProcessors(),
    };
    const processor = allImageProcessors[commandName];
    if (!processor) {
      return `No precessor defined for ${commandName}`;
    }

    const buffer = await this.messageImageParser.parseBufferFromMessage(message, args);
    const resultBuffer = await processor(buffer, args.join(' '));
    const mimetype = await fileTypeFromBuffer(resultBuffer);
    const attachment = new AttachmentBuilder(resultBuffer, { name: `shit.${mimetype?.ext}` });
    return { files: [attachment] };
  }

  public get commandData(): CommandData {
    const allImageProcessors = {
      ...this.imageProcessorService.getProcessors(),
      ...this.threeDProcessorService.getProcessors(),
    };
    const processorNames = Object.keys(allImageProcessors);

    return {
      name: processorNames.shift()!,
      usage: `[(<url> | <user_id>)]`,
      category: "IMAGE_PROCESSORS",
      description: "Edit an image using a processor function. " + ImageProcessors.IMAGE_DETECTION_INFO,
      requiresProcessing: true,
      aliases: processorNames,
    };
  }
}

@plugin()
class ImageProcessors extends AbstractPlugin {
  public static readonly IMAGE_DETECTION_INFO =
    "The image will automaticly detected from replied message," + " attached image, sticker, emoji, user avatar or url";

  public get pluginData(): PluginData {
    return {
      name: "@geoxor/image-processors",
      version: "1.0.0",
      commands: [SingleImageProcessor, Stack, Transform],
    };
  }
}
