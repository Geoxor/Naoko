import { singleton } from "tsyringe";
import { Awaitable } from "discord.js";
import Jimp from "jimp";
import { ColorActionName } from "@jimp/plugin-color";
import { join } from "path";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import petPetGif from "pet-pet-gif";
import { fileURLToPath } from "url";
import CommonUtils from "./CommonUtils";

@singleton()
export default class ImageProcessorService {
  private assetCache: Record<string, Jimp> = {};
  private processors: Record<string, (buffer: Buffer) => Awaitable<Buffer>>;

  constructor(private commonUtils: CommonUtils) {
    this.processors = {
      autocrop: this.autoCrop.bind(this),
      pat: this.pat.bind(this),
      invert: this.invert.bind(this),
      grayscale: this.grayScale.bind(this),
      trolley: this.trolley.bind(this),
      expert: this.expert.bind(this),
      wasted: this.wasted.bind(this),
      fuckyou: this.fuckYou.bind(this),
      vignette: this.vignette.bind(this),
      shy: this.shy.bind(this),
      deepfry: this.deepFry.bind(this),
      stretch: this.stretch.bind(this),
      squish: this.squish.bind(this),
      flip: this.flip.bind(this),
      scale: this.scale.bind(this),
      haah: this.haah.bind(this),
      fisheye: this.fishEye.bind(this),
      jolly: this.jolly.bind(this),
    };
  }

  public getProcessors() {
    return this.processors;
  }

  private async loadAsset(assetName: string): Promise<Jimp> {
    if (!this.assetCache[assetName]) {
      const assetPath = fileURLToPath(new URL("../assets/images", import.meta.url));
      this.assetCache[assetName] = await Jimp.read(join(assetPath, assetName));
    }
    return this.assetCache[assetName];
  }

  private bipolarRandom() {
    return Math.random() * 2 - 1;
  }

  async autoCrop(texture: Buffer) {
    const image = await Jimp.read(texture);
    return image.autocrop(0.01).getBufferAsync("image/jpeg");
  }

  async pat(image: Buffer): Promise<Buffer> {
    return petPetGif(image);
  }

  async invert(texture: Buffer) {
    const image = await Jimp.read(texture);
    return image.invert().getBufferAsync("image/jpeg");
  }

  async grayScale(texture: Buffer) {
    const image = await Jimp.read(texture);
    return image.grayscale().getBufferAsync("image/png");
  }

  async trolley(texture: Buffer) {
    const trolleyImage = await this.loadAsset("trolleyTemplate.png");
    const trolley = trolleyImage.clone();
    const image = await Jimp.read(texture);
    const size = 48;
    image.resize(size * 2, size);
    const composite = trolley.composite(image, 4, 24).getBufferAsync("image/png");
    return composite;
  }

  async expert(texture: Buffer) {
    const bobbyImage = await this.loadAsset("bobbyTemplate.png");
    const bobby = bobbyImage.clone();
    const image = await Jimp.read(texture);
    const size = 66;
    image.scaleToFit(size, size);
    const composite = bobby.composite(image, 0, bobby.bitmap.height - size).getBufferAsync("image/png");
    return composite;
  }

  async wasted(texture: Buffer) {
    const wastedImage = await this.loadAsset("wasted.png");
    let wasted = wastedImage.clone();
    let image = await Jimp.read(texture);
    // Stretch the wasted template to match the image
    wasted = wasted.resize(Jimp.AUTO, image.bitmap.height);
    // Composite the wasted in the center of the image

    const centerX = image.bitmap.width / 2 - wasted.bitmap.width / 2;
    const centerY = image.bitmap.height / 2;

    const offsetX = centerX * this.bipolarRandom();

    const randomPositionX = centerX - offsetX;
    const randomPositionY = this.bipolarRandom() * centerY;
    const composite = image.grayscale().composite(wasted, randomPositionX, randomPositionY);
    return composite.getBufferAsync("image/png");
  }

  async fuckYou(texture: Buffer) {
    const fuckyouImage = await this.loadAsset("fuckyou.png");
    let fuckyou = fuckyouImage.clone();
    const image = await Jimp.read(texture);
    // Stretch the fuckyou template to match the image
    fuckyou = fuckyou.resize(Jimp.AUTO, image.bitmap.height / 4);
    // Composite the fuckyou in the center of the image

    const centerX = image.bitmap.width / 2;
    const centerY = image.bitmap.height / 2 + image.bitmap.height / 4;

    const offsetX = centerX * this.bipolarRandom();

    const randomPositionX = centerX - offsetX;
    const randomPositionY = this.bipolarRandom() * centerY;
    const composite = image.grayscale().composite(fuckyou, randomPositionX, randomPositionY);
    return composite.getBufferAsync("image/png");
  }

  async vignette(texture: Buffer) {
    const vignetteImage = await this.loadAsset("vignette.png");
    let vignette = vignetteImage.clone();
    let image = await Jimp.read(texture);
    // Stretch the vignette template to match the image
    vignette = vignette.resize(image.bitmap.width, image.bitmap.height);
    // Composite the vignette in the center of the image
    const composite = image.grayscale().composite(vignette, 0, 0);
    return composite.getBufferAsync("image/png");
  }

  async shy(texture: Buffer) {
    const pointingHandImage = await this.loadAsset("finger.png");
    let image = await Jimp.read(texture);
    let pointingRight = pointingHandImage.clone();
    let pointingLeft = pointingHandImage.clone().mirror(true, false);

    pointingRight.resize(Jimp.AUTO, image.bitmap.height / 3);
    pointingLeft.resize(Jimp.AUTO, image.bitmap.height / 3);

    const verticalOffset = image.bitmap.height - pointingLeft.bitmap.height;

    const center = image.bitmap.width / 2 - pointingLeft.bitmap.width;

    const composite = image
      .composite(pointingRight, center, verticalOffset)
      .composite(pointingLeft, center + pointingLeft.bitmap.width, verticalOffset);

    return composite.getBufferAsync("image/png");
  }

  async deepFry(texture: Buffer) {
    const image = await Jimp.read(texture);
    return image.contrast(1).quality(0).getBufferAsync("image/png");
  }

  async stretch(texture: Buffer) {
    const image = await Jimp.read(texture);
    const { width, height } = image.bitmap;
    image.resize(width, height * 3);
    return image.getBufferAsync("image/png");
  }

  async squish(texture: Buffer) {
    const image = await Jimp.read(texture);
    const { width, height } = image.bitmap;
    image.resize(width * 3, height);
    return image.getBufferAsync("image/png");
  }

  async flip(texture: Buffer) {
    const image = await Jimp.read(texture);
    return image.flip(true, false).getBufferAsync("image/png");
  }

  async scale(texture: Buffer) {
    const image = await Jimp.read(texture);
    return image.scale(4).getBufferAsync("image/png");
  }

  async haah(texture: Buffer) {
    const textureImage = await Jimp.read(texture);
    const { width, height } = textureImage.bitmap;

    const halfWidth = Math.floor(width / 2);

    const right = textureImage.clone().flip(true, false).crop(halfWidth, 0, halfWidth, height);

    const left = textureImage.crop(0, 0, halfWidth, height);

    const image = await Jimp.create(width, height);

    image.blit(left, 0, 0).blit(right, halfWidth, 0);
    return image.getBufferAsync("image/png");
  }

  async fishEye(texture: Buffer) {
    const image = await Jimp.read(texture);
    // The type declerations say this is supposed to be "fishEye" instead of "fisheye"
    // @ts-ignore
    image.fisheye({ r: 2 });
    return image.getBufferAsync("image/png");
  }

  async jolly(texture: Buffer) {
    const christmasFramePath = "christmas/frames/" + this.commonUtils.randomChoice([
      "border1.png",
      "border2.png",
      "border3.png",
      "border4.png",
      "border5.png",
      "border6.png",
    ])
    const snowOverlayPath = "christmas/snowflakes/" + this.commonUtils.randomChoice([
      "overlay1.png",
      "overlay2.png",
    ])
    const spriteCount = Math.floor(Math.random() * 8)
    const spritePaths = Array.from({ length: spriteCount }, () =>
      `christmas/sprites/${this.commonUtils.randomChoice([
        "sprite1.png",
        "sprite2.png",
        "sprite3.png",
      ])}`
    )
    let image = await Jimp.read(texture);
    const width = image.getWidth()
    const height = image.getHeight()
    let border = await this.loadAsset(christmasFramePath);
    let overlay = await this.loadAsset(snowOverlayPath);
    border = border.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);

    console.log(spritePaths)
    // composite each sprite in a random part of the image
    for (let i = 0; i < spritePaths.length; i++) {
      let spriteAsset = await this.loadAsset(spritePaths[i])
      const spriteH = spriteAsset.getHeight()
      const spriteW = spriteAsset.getWidth()
      const minH = height / 4
      const maxH = height / 2
      const newH = Math.floor(Math.random() * (maxH - minH) + minH)
      // scale based on aspect ratio
      const newW = Math.floor(spriteW * (newH / spriteH))
      spriteAsset = spriteAsset.resize(newW, newH, Jimp.RESIZE_BILINEAR)
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)
      console.log({ newH, newW, x, y })
      image = image.composite(spriteAsset, x, y)
    }

    image = image.composite(border, 0, 0);
    image = image.composite(overlay, 0, 0);
    image = image.color([{ apply: ColorActionName.TINT, params: [10] }]);
    return image.getBufferAsync("image/png");
  }
}
