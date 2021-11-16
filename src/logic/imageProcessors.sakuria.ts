import Jimp from "jimp";
import { ImageProcessors } from "../types";

// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import petPetGif from "pet-pet-gif";
import { getRGBAUintArray, encodeFramesToGif, bipolarRandom } from "./logic.sakuria";
import logger from "../sakuria/Logger.sakuria";

// This is so we cache the template files in RAM, performance++;
let trolleyImage: Jimp;
let bobbyImage: Jimp;
let wastedImage: Jimp;
Jimp.read("./src/assets/images/trolleyTemplate.png").then(async (image) => (trolleyImage = image));
Jimp.read("./src/assets/images/bobbyTemplate.png").then(async (image) => (bobbyImage = image));
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
  pat,
  haah,
  expert,
  flip,
  scale,
};

/**
 * Takes in a buffer and a pipeline string array and will applies
 * the processors sequantially
 *
 * If a method takes longer than 1000ms it will terminate the pipeline
 * at that point to prevent exponential n*n thread blocks
 * @param pipeline the order of functions to apply
 * @param buffer the initial buffer to start with
 * @returns {Buffer} the modified buffer
 * @author Geoxor
 */
export async function transform(pipeline: string[], buffer: Buffer) {
  let fuckedBuffer = buffer;

  const functions = pipeline.map((name) => imageProcessors[name]).filter((processor) => !!processor);
  const bar = logger.sakuria.progress("Pipelines - ", functions.length);
  for (let i = 0; i < functions.length; i++) {
    const start = Date.now();
    const method = functions[i];
    fuckedBuffer = await method(fuckedBuffer);
    logger.sakuria.setProgressValue(bar, i / functions.length);

    // This is to avoid exp thread blocking
    if (Date.now() - start > 10000) return fuckedBuffer;
  }
  return fuckedBuffer;
}

/**
 * Stacks image processors and creates a gif out of them
 * @param name the name of the image processor function to apply
 * @param buffer the initial buffer to start with
 * @returns {Buffer} the modified buffer
 * @author Geoxor
 */
export async function stack(name: string, buffer: Buffer, iterations: number = 6): Promise<Buffer> {
  // Get the processor function
  const processorFunction = imageProcessors[name];

  // if theres no image processor function found return the buffer
  if (!processorFunction) return buffer;

  const firstFrameBuffer = await Jimp.read(buffer);
  const firstFrame = await getRGBAUintArray(firstFrameBuffer);
  const { width, height } = firstFrameBuffer.bitmap;
  const bufferFrames: Buffer[] = [buffer];
  const renderedFrames: Uint8Array[] = [firstFrame];

  const bar = logger.sakuria.progress("Stacks - ", iterations);

  for (let i = 0; i < iterations; i++) {
    // Iterate through the frames one frame behind
    // if it's the starting frame then
    // pick the first frame
    bufferFrames[i] = await processorFunction(bufferFrames[i - 1] || bufferFrames[0]);

    // Get the clamp RGBA array of the current
    // frame and add it 1 frame ahead
    // of the first starting frame
    renderedFrames[i + 1] = await getRGBAUintArray(await Jimp.read(bufferFrames[i]));

    logger.sakuria.setProgressValue(bar, i / iterations);
  }

  return await encodeFramesToGif(renderedFrames, width, height, ~~(1000 / 60));
}

/**
 * Create a pat gif from an image
 * @param image the image buffer to pet
 * @author Geoxor
 */
export async function pat(image: Buffer): Promise<Buffer> {
  return await petPetGif(image);
}

/**
 * Inverts the colors of an image
 * @param texture the texture to process
 * @author Geoxor
 */
export async function invert(texture: Buffer) {
  const image = await Jimp.read(texture);
  return image.invert().getBufferAsync("image/jpeg");
}

/**
 * Removes color from an image buffer
 * @param texture the texture to process
 * @author Geoxor
 */
export async function grayscale(texture: Buffer) {
  const image = await Jimp.read(texture);
  return image.grayscale().getBufferAsync("image/png");
}

/**
 * Creates a trolley image with a given image buffer
 * @param texture the texture to process
 * @author Geoxor, Bluskript
 */
export async function trolley(texture: Buffer) {
  const trolley = trolleyImage.clone();
  const image = await Jimp.read(texture);
  const size = 48;
  image.resize(size * 2, size);
  const composite = trolley.composite(image, 4, 24).getBufferAsync("image/png");
  return composite;
}

/**
 * Creates a expert bobby
 * @param texture the texture to process
 * @author Geoxor
 */
export async function expert(texture: Buffer) {
  const bobby = bobbyImage.clone();
  const image = await Jimp.read(texture);
  const size = 66;
  image.scaleToFit(size, size);
  const composite = bobby.composite(image, 0, bobby.bitmap.height - size).getBufferAsync("image/png");
  return composite;
}

/**
 * Creates a wasted image with a given image buffer
 * @param texture the texture to process
 * @author Geoxor
 */
export async function wasted(texture: Buffer) {
  let wasted = wastedImage.clone();
  let image = await Jimp.read(texture);
  // Stretch the wasted template to match the image
  wasted = wasted.resize(Jimp.AUTO, image.bitmap.height);
  // Composite the wasted in the center of the image

  const centerX = image.bitmap.width / 2 - wasted.bitmap.width / 2;
  const centerY = image.bitmap.height / 2;

  const offsetX = centerX * bipolarRandom();

  const randomPositionX = centerX - offsetX;
  const randomPositionY = bipolarRandom() * centerY;
  const composite = image.grayscale().composite(wasted, randomPositionX, randomPositionY);
  return composite.getBufferAsync("image/png");
}

/**
 * Deepfry an image
 * @param texture the texture to process
 * @author azur1s
 */
export async function deepfry(texture: Buffer) {
  const image = await Jimp.read(texture);
  return image.contrast(1).quality(0).getBufferAsync("image/png");
}

/**
 * Stretches an image
 * @param texture the texture to process
 * @author Geoxor
 */
export async function stretch(texture: Buffer) {
  const image = await Jimp.read(texture);
  const { width, height } = image.bitmap;
  image.resize(width, height * 3);
  return await image.getBufferAsync("image/png");
}

/**
 * Squishes an image
 * @param texture the texture to process
 * @author Geoxor
 */
export async function squish(texture: Buffer) {
  const image = await Jimp.read(texture);
  const { width, height } = image.bitmap;
  image.resize(width * 3, height);
  return await image.getBufferAsync("image/png");
}

export async function flip(texture: Buffer) {
  const image = await Jimp.read(texture);
  return await image.flip(true, false).getBufferAsync("image/png");
}

export async function scale(texture: Buffer) {
  const image = await Jimp.read(texture);
  return await image.scale(4).getBufferAsync("image/png");
}

export async function haah(texture: Buffer) {
  const textureImage = await Jimp.read(texture);
  const { width, height } = textureImage.bitmap;

  const right = textureImage
    .clone()
    .flip(true, false)
    .crop(width / 2, 0, width / 2, height);

  const left = textureImage.crop(0, 0, width / 2, height);

  const image = await Jimp.create(width, height);

  image.blit(left, 0, 0).blit(right, width / 2, 0);
  return await image.getBufferAsync("image/png");
}

/**
 * Fisheye an image
 * @param texture the texture to process
 * @author Geoxor
 */
export async function fisheye(texture: Buffer) {
  const image = await Jimp.read(texture);
  // The type declerations say this is supposed to be "fishEye" instead of "fisheye"
  // @ts-ignore
  image.fisheye({ r: 2 });
  return await image.getBufferAsync("image/png");
}
