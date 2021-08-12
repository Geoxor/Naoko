import Jimp from "jimp";
import { ICommand, ImageProcessorFn, ImageProcessors, IMessage } from "../types";
import { getBufferFromUrl, getImageURLFromMessage } from "./logic.sakuria";
import Discord from "discord.js";
import logger from "../sakuria/Logger.sakuria";
import * as THREE from "three";
import GIFEncoder from "gifencoder";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import { createCanvas } from "node-canvas-webgl";
// @ts-ignore this has broken types :whyyyyyyyyyyy:
import fileType from 'file-type';

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
  obamaPrism,
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
    const attachment = new Discord.MessageAttachment(resultbuffer, `shit.${mimetype.ext}`)
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
      if (time > 1000) return fuckedBuffer;
    }
  }
  return fuckedBuffer;
}

class ProcessorScene {
  public width: number;
  public height: number;
  public fps: number;
  public camera: THREE.Camera;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public encoder: GIFEncoder;
  public canvas: HTMLCanvasElement;

  constructor(width: number = 1280, height: number = 720, fps: number = 10) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(this.width, this.height);

    this.encoder = new GIFEncoder(width, height);
    this.encoder.start();
    this.encoder.setRepeat(0);
    this.encoder.setDelay(~~(1000 / fps));
    this.encoder.setQuality(10);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.width, this.height);
  }

  public update() {
    throw new Error("must be implemented");
  }

  public addGeometry(mesh: THREE.Mesh) {
    this.scene.add(mesh);
  }

  /**
   * Renders a webgl scene
   * @author Geoxor
   */
  public render() {
    const frameCount = 5 * this.fps;
    // @ts-ignore

    for (let i = 0; i < frameCount; i++) {
      this.update();
      this.renderer.render(this.scene, this.camera);
      console.log(`Rendering frame ${i}`);
      // @ts-ignore
      this.encoder.addFrame(this.canvas.__ctx__);
    }
    this.encoder.finish();
    const result = this.encoder.out.getData();
    return result;
  }
}

class ObamaScene extends ProcessorScene {
  public cube: THREE.Mesh;

  constructor() {
    super();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.addGeometry(this.cube);
  }

  public update() {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
  }
}

export async function obamaPrism(buffer: Buffer) {
  const scene = new ObamaScene();
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
