// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import Jimp from "jimp";
import logger from "../sakuria/Logger.sakuria";

/**
 * Gets the RGBA values of an image
 * @param buffer the buffer to get the values from
 * @author Geoxor & Bluskript
 * @returns a tuple array containing RGBA pairs
 * @pure
 */
export async function getRGBAUintArray(image: Jimp) {
  const TEXELS = 4; /** Red Green Blue and Alpha */
  const data = new Uint8Array(TEXELS * image.bitmap.width * image.bitmap.height);
  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      let color = image.getPixelColor(x, y);
      let r = (color >> 24) & 255;
      let g = (color >> 16) & 255;
      let b = (color >> 8) & 255;
      let a = (color >> 0) & 255;
      const stride = TEXELS * (x + y * image.bitmap.width);
      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = a;
    }
  }
  return data;
}

/**
 * Encodes a GIF out of an array of an RGBA texel array
 * @param frames an RGBA texel array of frames
 * @param delay the delay between each frame in ms
 * @author Geoxor & Bluskript
 * @returns {Promise<Buffer>} the gif as a buffer
 * @pure
 */
export async function encodeFramesToGif(
  frames: Uint8ClampedArray[] | Uint8Array[],
  width: number,
  height: number,
  delay: number
) {
  const gif = GIFEncoder();
  const palette = quantize(frames[0], 256);
  const bar = logger.sakuria.progress("Encoding  - ", frames.length);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const idx = applyPalette(frame, palette);
    gif.writeFrame(idx, width, height, { transparent: true, delay, palette });
    logger.sakuria.setProgressValue(bar, i / frames.length);
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

/**
 * Preprocesses an image so it eliminates huge images from developing
 * @returns a 256x256 png buffer
 * @author Geoxor
 * @pure
 */
export async function preProcessBuffer(buffer: Buffer) {
  const image = await Jimp.read(buffer);
  if (image.bitmap.width > 512) {
    image.resize(512, Jimp.AUTO);
    return image.getBufferAsync("image/png");
  }
  return buffer;
}