import {ColorResolvable, EmbedFieldData, MessageEmbed} from "discord.js";

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
    footer && (typeof footer === "object"
      ? super.setFooter(footer.text, footer.iconURL)
      : super.setFooter(footer as string));
    image && super.setImage(image);
    thumbnail && super.setThumbnail(thumbnail);
    author && super.setAuthor(author.name, author.iconURL, author.url);
    fields && super.setFields(fields);
  }
}

export const ZERO_WIDTH_SPACE = "\u200E";

export function createErrorEmbed(description: string, extraTitle?: string): SakuriaEmbed {
  return new SakuriaEmbed({
    title: `❌ ${extraTitle}`,
    description,
    color: "RED"
  })
}

export function createNotInlineBlankField(amount = 1): EmbedFieldData[] {
  const arr: EmbedFieldData[] = [];

  for (let i = 0; i < amount; i++) {
    arr.push(createBlankField(false))
  }

  return arr;
}

export function createInlineBlankField(amount = 1): EmbedFieldData[] {
  const arr: EmbedFieldData[] = [];

  for (let i = 0; i < amount; i++) {
    arr.push(createBlankField(true));
  }

  return arr;
}

export function createBlankField(inline: boolean): EmbedFieldData {
  return {
    value: ZERO_WIDTH_SPACE,
    name: ZERO_WIDTH_SPACE,
    inline
  };
}
