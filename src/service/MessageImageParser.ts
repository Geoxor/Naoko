import { singleton } from "@triptyk/tsyringe";
import axios from "axios";
import { ImageURLOptions, Message } from "discord.js";
import Jimp from "jimp";
// @ts-expect-error
import replaceLast from 'replace-last';

@singleton()
export default class MessageImageParser {
  private readonly DEFAULT_IMAGE_OPTIONS: ImageURLOptions = { extension: "png", size: 512 };

  /**
   * Gets an image url from attachments > stickers > first emoji > mentioned user avatar > author avatar > default avatar
   */
  public getMostRelevantImageURL(message: Message, args: string[]) {
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
    const userMention = message.mentions.users.first();

    if (this.isValidHttpUrl(arg)) {
      if (arg.startsWith("https://tenor") && !arg.endsWith(".gif")) {
        return arg + ".gif";
      }
      return replaceLast(arg, ".webp", ".png");
    }

    // If theres a reply
    if (message.reference) {
      const reference = await message.fetchReference();
      const referenceArgs = reference.content.trim().split(/ +/);
      return replaceLast(this.getMostRelevantImageURL(message, referenceArgs), ".webp", ".png");
    }

    // this is a hack...
    if (!/[0-9]{18}$/g.test(arg) || userMention || message.content.includes("<:")) {
      return this.getMostRelevantImageURL(message, args);
    }

    const user = await message.client.users.fetch(arg);
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
}
