import Jimp from "jimp";
import { ICommand, ImageProcessorFn, ImageProcessors, IMessage } from "../types";
import { getBufferFromUrl, getImageURLFromMessage } from "./logic.sakuria";
import Discord from "discord.js";
import logger from "../sakuria/Logger.sakuria";

// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { CubeScene, ObamaScene, WTFScene } from "./3DRenderer.sakuria";

// This is so we cache the template files in RAM, performance++;
let trolleyImage: Jimp;
let wastedImage: Jimp;
Jimp.read("./src/assets/images/trolleyTemplate.png").then(async (image) => (trolleyImage = image));
Jimp.read("./src/assets/images/wasted.png").then(async (image) => (wastedImage = image));

export const imageProcessors: ImageProcessors = {
  stretch,
  trolley,
  invert,
  fisheye,
  squish,
  grayscale,
  wasted,
  deepfry,
  cube,
  obamaprism: obamaPrism,
  wtf
};

/**
 * Returns an execute function to use in a image process command
 * @param process the image processor function
 * @author Bluskript
 */
export function imageProcess(process: ImageProcessorFn) {
  return async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    const resultbuffer = await process(targetBuffer);
    const mimetype = await fileType(resultbuffer);
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`);
    return { files: [attachment] };
  };
}

/**
 * Creates commands for the image processor functions
 * @param fns all the image processor functions
 * @author Bluskript
 */
export function genCommands(fns: ImageProcessorFn[]): ICommand[] {
  return fns.map((fn) => {
    const cmdName = fn.name.toLowerCase();
    logger.command.print(`Generated command ${cmdName}`);
    return {
      name: cmdName,
      description: `${cmdName} image processor`,
      requiresProcessing: true,
      execute: imageProcess(fn),
    };
  });
}

/**
 * Takes in a buffer and a pipeline string array and will applies
 * the processors sequantially
 *
 * If a method takes longer than 1000ms it will terminate the pipeline
 * at that point to prevent exponential n*n thread blocks
 * @param pipeline the order of functions to apply as strubgs
 * @param buffer the initial buffer to start with
 * @returns {Buffer} the modified buffer
 * @author Geoxor
 */
export async function transform(pipeline: string[], buffer: Buffer): Promise<Buffer> {
  let fuckedBuffer = buffer;
  for (let method of pipeline) {
    if (Object.keys(imageProcessors).includes(method)) {
      let timeStart = Date.now();
      fuckedBuffer = await imageProcessors[method](fuckedBuffer);
      let timeEnd = Date.now();
      const time = timeEnd - timeStart;
      logger.command.print(
        `${time}ms - Processed pipeline ${method} - Buffer: ${(fuckedBuffer.byteLength / 1000).toFixed(2)} KB`
      );

      // This is to avoid exp thread blocking
      if (time > 60000) return fuckedBuffer;
    }
  }
  return fuckedBuffer;
}

/**
 * Creates a spinning obamaprism out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function obamaPrism(buffer: Buffer) {
  const scene = new ObamaScene();
  await scene.prepare(buffer);
  return scene.render();
}

/**
 * Creates a torus knot out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
 export async function wtf(buffer: Buffer) {
  const scene = new WTFScene;
  await scene.prepare(buffer);
  return scene.render();
}

/**
 * Creates a spinning cube out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function cube(buffer: Buffer) {
  const scene = new CubeScene();
  await scene.prepare(buffer);
  return scene.render();
}

/**
 * Inverts the colors of an image
 * @param image the image buffer you wanna invert
 * @returns a buffer of the inverted image
 * @author Geoxor
 */
export async function invert(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  return image.invert().getBufferAsync("image/jpeg");
}

/**
 * LRemoves color from an image buffer
 * @param image the image buffer you wanna grayscale
 * @returns a buffer of the grayscaled image
 * @author Geoxor
 */
export async function grayscale(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  return image.grayscale().getBufferAsync("image/png");
}

/**
 * Creates a trolley image with a given image buffer
 * @param image the buffer to composite to the trolley
 * @author Geoxor, Bluskript
 */
export async function trolley(buffer: Buffer, stretchAmount: number = 2): Promise<Buffer> {
  const trolley = trolleyImage.clone();
  const image = await Jimp.read(buffer);
  const size = 48;
  image.resize(size * stretchAmount, size);
  const composite = trolley.composite(image, 4, 24).getBufferAsync("image/png");
  return composite;
}

/**
 * Creates a wasted image with a given image buffer
 * @param image the buffer to composite to the wasted
 * @author Geoxor
 */
export async function wasted(buffer: Buffer): Promise<Buffer> {
  let wasted = wastedImage.clone();
  let image = await Jimp.read(buffer);
  // Stretch the wasted template to match the image
  wasted = wasted.resize(Jimp.AUTO, image.bitmap.height);
  // Composite the wasted in the center of the image
  const composite = image.grayscale().composite(wasted, -(image.bitmap.width / 2.5), 0);
  return composite.getBufferAsync("image/png");
}

/**
 * Deepfry an image
 * @param image the buffer to fry
 * @author azur1s
 */
export async function deepfry(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  return image.contrast(1).quality(0).getBufferAsync("image/png");
}

/**
 * Stretches an image
 * @param image the buffer to stretch
 * @param amount the amount to stretch by vertically
 * @author Geoxor
 */
export async function stretch(buffer: Buffer, stretchAmount: number = 3): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  const { width, height } = image.bitmap;
  image.resize(width, height * stretchAmount);
  return await image.getBufferAsync("image/png");
}

/**
 * Squishes an image
 * @param image the buffer to stretch
 * @param amount the amount to stretch by vertically
 * @author Geoxor
 */
export async function squish(buffer: Buffer, squishAmount: number = 3): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  const { width, height } = image.bitmap;
  image.resize(width * squishAmount, height);
  return await image.getBufferAsync("image/png");
}

/**
 * Fisheye an image
 * @param image the buffer to stretch
 * @param radius the radius to fisheye by
 * @author Geoxor
 */
export async function fisheye(buffer: Buffer, radius: number = 2): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  // The type declerations say this is supposed to be "fishEye" instead of "fisheye"
  // @ts-ignore
  image.fisheye({ r: radius });
  return await image.getBufferAsync("image/png");
}
