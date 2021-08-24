import Jimp from "jimp";
import { ICommand, ImageProcessorFn, ImageProcessors, IMessage } from "../types";
import { getBufferFromUrl, getImageURLFromMessage } from "./logic.sakuria";
import Discord from "discord.js";
import logger from "../sakuria/Logger.sakuria";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import { GeometryScene } from "./3DRenderer.sakuria";
import * as THREE from "three";
import comicSans from "../assets/comic_sans_font.json";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import cache from "../sakuria/Cache.sakuria";

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
  prism,
  wtf,
  sphere,
  cylinder,
  donut,
  text,
  cart,
  car,
  amogus,
  miku,
  trackmania,
};

/**
 * Gets the RGBA values of an image
 * @param buffer the buffer to get the values from
 * @author Geoxor & Bluskript
 * @returns a tuple array containing RGBA pairs
 */
export async function getRGBAUintArray(image: Jimp) {
  const texels = 4; /** Red Green Blue and Alpha */
  const data = new Uint8Array(texels * image.bitmap.width * image.bitmap.height);
  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      let color = image.getPixelColor(x, y);
      let r = (color >> 24) & 255;
      let g = (color >> 16) & 255;
      let b = (color >> 8) & 255;
      let a = (color >> 0) & 255;
      const stride = texels * (x + y * image.bitmap.width);
      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = a;
    }
  }
  return data;
}

/**
 * Encodes a GIF out of an array of png buffers
 * @param frames an array of buffers to make a gif from
 * @author Geoxor & Bluskript
 * @returns {Promise<Buffer>} the gif as a buffer
 */
export async function encodeFramesToGif(frames: ImageData[], delay: number) {
  const gif = GIFEncoder();
  const palette = quantize(frames[0].data, 256);
  const bar = logger.sakuria.progress("Encoding  - ", frames.length);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const idx = applyPalette(frame.data, palette);
    gif.writeFrame(idx, frame.width, frame.height, { transparent: true, delay, palette });
    logger.sakuria.setProgressValue(bar, i / frames.length);
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

/**
 * Returns an execute function to use in a image process command
 * @param process the image processor function
 * @author Bluskript
 */
export function imageProcess(process: ImageProcessorFn) {
  return async (message: IMessage): Promise<string | Discord.ReplyMessageOptions> => {
    const imageURL = await getImageURLFromMessage(message);
    const targetBuffer = await getBufferFromUrl(imageURL);
    const resultbuffer = await process(targetBuffer, message.args.join(" "));
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
 * Creates a spinning prism out of a texture
 * @param texture the image buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function prism(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0 },
    camera: { y: -1, z: 7 },
    geometry: new THREE.ConeGeometry(4, 4.5, 4),
    texture,
  });
  return scene.render();
}

/**
 * Creates a torus knot out of a texture
 * @param texture the image buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function wtf(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: Math.random() / 3 },
    camera: { z: 3 },
    shading: true,
    geometry: new THREE.TorusKnotGeometry(1),
    texture,
  });
  return scene.render();
}

/**
 * Creates a spinning cube out of a texture
 * @param texture the image buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function cube(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.05, y: 0.0125 },
    camera: { z: 1.3 },
    geometry: new THREE.BoxGeometry(1, 1, 1),
    texture,
  });
  return scene.render();
}

/**
 * Creates a spinning donut out of a texture
 * @param texture the image buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function donut(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.05, y: 0.0125 },
    shading: true,
    camera: { z: 2.5 },
    geometry: new THREE.TorusGeometry(1, 0.5, 16, 100),
    texture,
  });
  return scene.render();
}

/**
 * Creates a spinning sphere out of a texture
 * @param texture the image buffer to use as a texture
 * @author azur1s, Geoxor
 */
export async function sphere(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0 },
    camera: { z: 1.25 },
    geometry: new THREE.SphereGeometry(0.75, 32, 16),
    texture,
  });
  return scene.render();
}

/**
 * Creates a spinning cylinder out of a texture
 * @param texture the image buffer to use as a texture
 * @author azur1s, Geoxor
 */
export async function cylinder(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.01, y: 0.07 },
    camera: { z: 2 },
    geometry: new THREE.CylinderGeometry(1, 1, 1, 32),
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning 3d text out of a texture and a sentence
 * @param texture the image buffer to use as a texture
 * @param text the text to render on the scene
 * @author N1kO23 & Geoxor
 */
export async function text(texture: Buffer, text?: string) {
  const loader = new THREE.FontLoader();
  const font = loader.parse(comicSans);
  const geometry = new THREE.TextGeometry(text || "your mom", {
    font: font,
    size: 12,
    height: 4,
    curveSegments: 12,
    bevelEnabled: false,
  });
  geometry.center();
  const scene = await GeometryScene.create({
    rotation: { x: 0 },
    shading: true,
    camera: { z: 16 + (text?.length || 0) * Math.PI },
    geometry,
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning cart out of a texture and a sentence
 * @param texture the image buffer to use as a texture
 * @param text the text to render on the scene
 * @author N1kO23 & Geoxor
 */
export async function cart(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.05, y: 0.05 },
    camera: { z: 10 },
    shading: true,
    geometry: cache.objects.cart,
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning car out of a texture
 * @param texture the image buffer to use as a texture
 * @author N1kO23 & Geoxor
 */
export async function car(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.0, y: 0.05 },
    camera: { z: 6 },
    shading: true,
    geometry: cache.objects.car,
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning miku out of a texture
 * @param texture the image buffer to use as a texture
 * @author N1kO23 & Geoxor
 */
export async function miku(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.0, y: 0.05 },
    camera: { y: 10, z: 16 },
    shading: true,
    geometry: cache.objects.miku,
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning amogus out of a texture
 * @param texture the image buffer to use as a texture
 * @author N1kO23 & Geoxor
 */
export async function amogus(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.025, y: 0.05 },
    camera: { z: 4 },
    shading: true,
    geometry: cache.objects.amogus,
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning trackmania car out of a texture
 * @param texture the image buffer to use as a texture
 * @author N1kO23 & Geoxor
 */
export async function trackmania(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.05, y: 0.05 },
    camera: { z: 4 },
    shading: true,
    geometry: cache.objects.trackmania,
    texture,
  });
  return scene.render();
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
  const composite = image.grayscale().composite(wasted, -(image.bitmap.width / 2.5), 0);
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
