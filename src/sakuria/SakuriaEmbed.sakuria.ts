import { ColorResolvable, EmbedFieldData, MessageEmbed } from "discord.js"

export default class SakuriaEmbed extends MessageEmbed {
  public constructor(
    {
      title,
      description,
      url,
      timestamp,
      color = "#FF90E0",
      footer,
      image,
      thumbnail,
      author,
      fields,
    }: {
      title?: string,
      description?: string,
      url?: string,
      timestamp?: Date|number,
      color?: ColorResolvable
      footer?: { text: string, iconURL?: string }|string,
      image?: string,
      thumbnail?: string,
      author?: { name: string, iconURL?: string, url?: string },
      fields?: EmbedFieldData[],
    }
  ) {
    super();

    title && super.setTitle(title);
    description && super.setDescription(description);
    url && super.setURL(url);
    timestamp && super.setTimestamp(timestamp);
    color && super.setColor(color);
    typeof footer === "object" ? super.setFooter(footer.text, footer.iconURL) : super.setFooter(footer);
    image && super.setImage(image);
    thumbnail && super.setThumbnail(thumbnail);
    author && super.setAuthor(author.name, author.iconURL, author.url);
    fields && super.setFields(fields);
  }

  public static ZERO_WIDTH_SPACE = "\u200E";
  public static createBlankField(inline: boolean): EmbedFieldData {
    return {
      name: this.ZERO_WIDTH_SPACE,
      value: this.ZERO_WIDTH_SPACE,
      inline
    }
  }
}