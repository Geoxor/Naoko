import Jimp from "jimp";
import logger from "../sakuria/Logger.sakuria";

// This is so we cache the template files in RAM, performance++;
let trolleyImage: Jimp;
Jimp.read("./src/assets/images/trolleyTemplate.png").then(async (image) => (trolleyImage = image));

export const imageProcessors: { [key: string]: (buffer: Buffer) => Promise<Buffer> } = {
  stretch,
  trolley,
  invert,
  fisheye,
  squish,
};

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
      if (time > 1000) return fuckedBuffer;
    }
  }
  return fuckedBuffer;
}

/**
 * Inverts the colors of an image
 * @param image the image buffer you wanna invert
 * @returns a buffer of the inverted image
 * @author Geoxor
 */
export async function invert(image: Buffer): Promise<Buffer> {
  const JimpImage = await Jimp.read(image);
  return JimpImage.invert().getBufferAsync("image/png");
}

/**
 * Creates a trolley image with a given image buffer
 * @param image the buffer to composite to the trolley
 * @author Geoxor, Bluskript
 */
export async function trolley(buffer: Buffer, stretchAmount: number = 2): Promise<Buffer> {
  const trolley = trolleyImage.clone();
  const jimpImage = await Jimp.read(buffer);
  const size = 48;
  jimpImage.resize(size * stretchAmount, size);
  const composite = trolley.composite(jimpImage, 4, 24).getBufferAsync("image/png");
  return composite;
}

/**
 * Stretches an image
 * @param image the buffer to stretch
 * @param amount the amount to stretch by vertically
 * @author Geoxor
 */
export async function stretch(buffer: Buffer, stretchAmount: number = 3): Promise<Buffer> {
  const jimpImage = await Jimp.read(buffer);
  const { width, height } = jimpImage.bitmap;
  jimpImage.resize(width, height * stretchAmount);
  return await jimpImage.getBufferAsync("image/png");
}

/**
 * Squishes an image
 * @param image the buffer to stretch
 * @param amount the amount to stretch by vertically
 * @author Geoxor
 */
export async function squish(buffer: Buffer, squishAmount: number = 3): Promise<Buffer> {
  const jimpImage = await Jimp.read(buffer);
  const { width, height } = jimpImage.bitmap;
  jimpImage.resize(width * squishAmount, height);
  return await jimpImage.getBufferAsync("image/png");
}

/**
 * Fisheye an image
 * @param image the buffer to stretch
 * @param radius the radius to fisheye by
 * @author Geoxor
 */
export async function fisheye(buffer: Buffer, radius: number = 2): Promise<Buffer> {
  const jimpImage = await Jimp.read(buffer);
  // The type declerations say this is supposed to be "fishEye" instead of "fisheye"
  // @ts-ignore
  jimpImage.fisheye({ r: radius });
  return await jimpImage.getBufferAsync("image/png");
}
