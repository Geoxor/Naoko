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
      if (time > 10000) return fuckedBuffer;
    }
  }
  return fuckedBuffer;
}

/**
 * Creates a spinning prism out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function prism(buffer: Buffer) {
  const geometry = new THREE.ConeGeometry(4, 4.5, 4);
  const cameraPosition = { y: -1, z: 7 };
  const geometryRotation = { x: 0 };
  const scene = new GeometryScene(geometry, geometryRotation);
  await scene.prepare(buffer, cameraPosition);
  return scene.render();
}

/**
 * Creates a torus knot out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function wtf(buffer: Buffer) {
  const geometry = new THREE.TorusKnotGeometry(1);
  const cameraPosition = { z: 3 };
  const geometryRotation = { x: Math.random() / 3 };
  const scene = new GeometryScene(geometry, geometryRotation);
  await scene.prepare(buffer, cameraPosition);
  return scene.render();
}

/**
 * Creates a spinning cube out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function cube(buffer: Buffer) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const geometryRotation = { x: 0.05, y: 0.0125 };
  const cameraPosition = { z: 1.3 };
  const scene = new GeometryScene(geometry, geometryRotation);
  await scene.prepare(buffer, cameraPosition);
  return scene.render();
}

/**
 * Creates a spinning donut out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author Bluskript & Geoxor
 */
export async function donut(buffer: Buffer) {
  const geometry = new THREE.TorusGeometry(1, 0.5, 16, 100);
  const scene = new GeometryScene(geometry, {});
  const cameraPosition = { z: 2.5 };
  await scene.prepare(buffer, cameraPosition);
  return scene.render();
}

/**
 * Creates a spinning sphere out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author azur1s, Geoxor
 */
export async function sphere(buffer: Buffer) {
  const geometry = new THREE.SphereGeometry(0.75, 32, 16);
  const geometryRotation = { x: 0 };
  const cameraPosition = { z: 1.25 };
  const scene = new GeometryScene(geometry, geometryRotation);
  await scene.prepare(buffer, cameraPosition);
  return scene.render();
}

/**
 * Creates a spinning cylinder out of a texture
 * @param buffer the immage buffer to use as a texture
 * @author azur1s, Geoxor
 */
export async function cylinder(buffer: Buffer) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  const cameraPosition = { z: 2 };
  const geometryRotation = { x: 0.01, y: 0.07 };
  const scene = new GeometryScene(geometry, geometryRotation);
  await scene.prepare(buffer, cameraPosition);
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
export async function trolley(buffer: Buffer): Promise<Buffer> {
  const trolley = trolleyImage.clone();
  const image = await Jimp.read(buffer);
  const size = 48;
  image.resize(size * 2, size);
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
export async function stretch(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  const { width, height } = image.bitmap;
  image.resize(width, height * 3);
  return await image.getBufferAsync("image/png");
}

/**
 * Squishes an image
 * @param image the buffer to stretch
 * @param amount the amount to stretch by vertically
 * @author Geoxor
 */
export async function squish(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  const { width, height } = image.bitmap;
  image.resize(width * 3, height);
  return await image.getBufferAsync("image/png");
}

/**
 * Fisheye an image
 * @param image the buffer to stretch
 * @param radius the radius to fisheye by
 * @author Geoxor
 */
export async function fisheye(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  // The type declerations say this is supposed to be "fishEye" instead of "fisheye"
  // @ts-ignore
  image.fisheye({ r: 2 });
  return await image.getBufferAsync("image/png");
}

/**
 * Creates spinning 3d text out of a texture and a sentence
 * @param buffer the immage buffer to use as a texture
 * @param text the text to render on the scene
 * @author N1kO23 & Geoxor
 */
export async function text(buffer: Buffer, text?: string) {
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
  const geometryRotation = { x: 0 };
  const cameraPosition = { z: 16 + (text?.length || 0) * Math.PI };
  const scene = new GeometryScene(geometry, geometryRotation);
  await scene.prepare(buffer, cameraPosition);
  return await scene.render();
}