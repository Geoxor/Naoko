import Jimp from "jimp";
import { ImageProcessors } from "../types";
import { GeometryScene } from "./3DRenderer.sakuria";
import * as THREE from "three";
import comicSans from "../assets/comic_sans_font.json";
import cache from "../sakuria/Cache.sakuria";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import petPetGif from "pet-pet-gif";
import { getRGBAUintArray, encodeFramesToGif, bipolarRandom } from "./logic.sakuria";
import logger from "../sakuria/Logger.sakuria";
import fs from "fs";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from "file-type";
import config from "../sakuria/Config.sakuria";
import child_process from "child_process";

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
  trollcart,
  troll,
  wasted,
  deepfry,
  cube,
  pat,
  prism,
  wtf,
  sphere,
  cylinder,
  donut,
  text,
  cart,
  car,
  amogus,
  waifu2x,
  miku,
  trackmania,
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

export async function waifu2x(buffer: Buffer): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const curData = Date.now();
    const mime = await fileType(buffer);
    const inputPath = `./src/cache/${curData}-in-randomFile.${mime.ext}`;
    const outputPath = `./src/cache/${curData}-out-randomFile.png`;
    await fs.promises.writeFile(inputPath, buffer).catch(err => reject(err));

    // Creates a new subprocess
    var subprocess = child_process.execFile(config.WAIFU_2X_PATH, [`-i`, inputPath, `-o`, outputPath], async (err) => {
      err && subprocess.removeAllListeners('close') && reject(err);
    });

    // Triggers when subprocess is finished
    subprocess.on('close', async () => {
      // Removes the source file
      fs.promises.unlink(inputPath);

      const file = await fs.promises.readFile(outputPath).catch(err => reject(err));
      if (!file) return reject(`${file} was not found!`);

      // Removes the output file
      fs.promises.unlink(outputPath);
      
      resolve(file);
    });
  });
}

/**
 * Stacks image processors and creates a gif out of them
 * @param name the name of the image processor function to apply
 * @param buffer the initial buffer to start with
 * @returns {Buffer} the modified buffer
 * @author Geoxor
 */
export async function stack(
  name: string,
  buffer: Buffer,
  iterations: number = 6,
  fps: number = 60
): Promise<Buffer> {
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

  return await encodeFramesToGif(renderedFrames, width, height, ~~(1000 / fps));
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
 * Creates spinning trollface out of a texture
 * @param texture the image buffer to use as a texture
 * @author N1kO23 & Geoxor
 */
export async function troll(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.0, y: 0.05 },
    camera: { z: 3, y: 1 },
    shading: true,
    geometry: cache.objects.troll,
    texture,
  });
  return scene.render();
}

/**
 * Creates spinning trolley out of a texture
 * @param texture the image buffer to use as a texture
 * @author N1kO23 & Geoxor
 */
export async function trollcart(texture: Buffer) {
  const scene = await GeometryScene.create({
    rotation: { x: 0.0, y: 0.05 },
    camera: { z: 6 },
    shading: true,
    geometry: cache.objects.trolley,
    texture,
  });
  return scene.render();
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
