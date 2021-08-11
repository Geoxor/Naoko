import Jimp from "jimp";

// This is so we cache the template files in RAM, performance++;
let trolleyImage: Jimp;
Jimp.read("./src/assets/images/trolleyTemplate.png").then(async image => trolleyImage = image);

export const imageProcessors: { [key: string]: Function } = {
  "stretch": stretch,
  "trolley": trolley,
  "invert": invert,
};

/**
 * Takes in a buffer and a pipeline string array and will applies 
 * the processors sequantially
 * @param pipeline the order of functions to apply as strubgs
 * @param buffer the initial buffer to start with
 * @returns {Buffer} the modified buffer
 */
export async function transform(pipeline: string[], buffer: Buffer): Promise<Buffer> {
  let fuckedBuffer = buffer;
  for (let method of pipeline) {
    if (Object.keys(imageProcessors).includes(method)) {
      console.log('Processing pipeline', method);
      fuckedBuffer = await imageProcessors[method](fuckedBuffer);
    };
  }
  return fuckedBuffer
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
 export async function trolley(image: Buffer, stretchAmount: number = 2): Promise<Buffer> {
  const trolley = trolleyImage.clone();
  const jimpImage = await Jimp.read(image);
  const size = 48;
  jimpImage.resize(size * stretchAmount, size);
  const composite = trolley.composite(jimpImage, 4, 24).getBufferAsync("image/png");
  return composite;
}

/**
 * Stretches an image
 * @param image the buffer to stretch
 * @param amount the amount to stretch by horizontally
 * @author Geoxor
 */
 export async function stretch(image: Buffer, stretchAmount: number = 3): Promise<Buffer> {
  const jimpImage = await Jimp.read(image);
  const {width, height} = jimpImage.bitmap;
  jimpImage.resize(width * stretchAmount, height);
  return await jimpImage.getBufferAsync('image/png');
}
