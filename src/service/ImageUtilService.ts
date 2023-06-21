import { singleton } from "@triptyk/tsyringe";
import axios from "axios";
import { ImageURLOptions, Message } from "discord.js";
import Jimp from "jimp";
// @ts-expect-error
import replaceLast from "replace-last";
// @ts-ignore this doesn't have types :whyyyyyyyyyyy:
import gifenc from "gifenc";
import Logger from "../naoko/Logger";

@singleton()
export default class ImageUtilService {
  constructor(private logger: Logger) {}

  private readonly DEFAULT_IMAGE_OPTIONS: ImageURLOptions = { extension: "png", size: 512 };

  /**
   * Gets an image url from attachments > stickers > first emoji > mentioned user avatar > author avatar > default avatar
   */
  private getMostRelevantImageURL(message: Message, args: string[]) {
    return (
      message.attachments.first()?.url ||
      message.stickers.first()?.url ||
      this.getFirstEmojiURL(message.content) ||
      this.getUserProfilePicture(message, args)
    );
  }

  private getFirstEmojiURL(message: string) {
    const emoteRegex = /<:.+:(\d+)>/gm;
    const animatedEmoteRegex = /<a:.+:(\d+)>/gm;
    const staticEmoji = message.split(emoteRegex)[1];
    const animatedEmoji = message.split(animatedEmoteRegex)[1];
    if (staticEmoji) return "https://cdn.discordapp.com/emojis/" + staticEmoji + ".png?v=1";
    if (animatedEmoji) return "https://cdn.discordapp.com/emojis/" + animatedEmoji + ".gif?v=1";
  }

  private getUserProfilePicture(message: Message, args: string[]): string {
    const otherUser = message.mentions.users.first() || message.client.users.cache.get(args[0]) || message.author;

    if (message.guild) {
      const member = message.guild.members.cache.get(otherUser.id);
      if (member && member.avatar) {
        member.avatarURL(this.DEFAULT_IMAGE_OPTIONS);
      }
    }

    return otherUser.displayAvatarURL(this.DEFAULT_IMAGE_OPTIONS);
  }

  public async parseBufferFromMessage(message: Message, args: string[]): Promise<Buffer> {
    const imageURL = await this.getImageURLFromMessage(message, args);
    const targetBuffer = await this.getBufferFromUrl(imageURL);
    const preProccessed = await this.preProcessBuffer(targetBuffer);
    return preProccessed;
  }

  private async getImageURLFromMessage(message: Message, args: string[]): Promise<string> {
    const arg = args[this.findIndexOfURL(args)];
    if (arg && this.isValidHttpUrl(arg)) {
      if (arg.startsWith("https://tenor") && !arg.endsWith(".gif")) {
        return arg + ".gif";
      }
      return replaceLast(arg, ".webp", ".png");
    }

    // If theres a reply
    if (message.reference && message.reference.messageId) {
      try {
        const reference = await message.channel.messages.fetch(message.reference.messageId);
        if (reference) {
          const referenceArgs = reference.content.trim().split(/ +/);
          return replaceLast(this.getMostRelevantImageURL(reference, referenceArgs), ".webp", ".png");
        }
      } catch {
        this.logger.print("Failed to fetch reference from message ($message.)");
      }
    }

    // this is a hack...
    const userMention = message.mentions.users.first();
    if (!/[0-9]{18}$/g.test(arg) || userMention || message.content.includes("<:")) {
      return this.getMostRelevantImageURL(message, args);
    }

    const user = await message.client.users.fetch("153274351561605120");
    return user.displayAvatarURL(this.DEFAULT_IMAGE_OPTIONS);
  }

  private async getBufferFromUrl(url: string) {
    const response = await axios({ method: "GET", url, responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  private async preProcessBuffer(buffer: Buffer) {
    const image = await Jimp.read(buffer);
    if (image.bitmap.width > 512) {
      image.resize(512, Jimp.AUTO);
      return image.getBufferAsync("image/png");
    }
    return buffer;
  }

  private findIndexOfURL(array: string[]) {
    for (let i = 0; i < array.length; i++) {
      if (this.isValidHttpUrl(array[i])) return i;
    }
    return -1;
  }

  private isValidHttpUrl(string: string) {
    let url;
    try {
      url = new URL(string);
    } catch {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  async getRGBAUintArray(image: Jimp) {
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

  async encodeFramesToGif(frames: Uint8ClampedArray[] | Uint8Array[], width: number, height: number, delay: number) {
    const gif = gifenc.GIFEncoder();
    const palette = gifenc.quantize(frames[0], 256);
    const bar = this.logger.progress("Encoding  - ", frames.length);
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const idx = gifenc.applyPalette(frame, palette);
      gif.writeFrame(idx, width, height, { transparent: true, delay, palette });
      this.logger.setProgressValue(bar, i / frames.length);
    }

    gif.finish();
    return Buffer.from(gif.bytes());
  }
}
