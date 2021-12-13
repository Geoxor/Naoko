import { EmojiIdentifierResolvable } from "discord.js";
import { IWaifuRarityName } from "src/types";
export const SHAII_ID = "870496144881492069";
export const GEOXOR_GUILD_ID = "385387666415550474";
export const TESTING_GUILD_ID = "911762334538670160";
export const QBOT_DEV_GUILD_ID = "897185485313699891";
export const GEOXOR_GENERAL_CHANNEL_ID = "845328432715923487";
export const DOWNVOTE_EMOJI_ID = "823666555123662888";
export const UPVOTE_EMOJI_ID = "834402501397577729";
export const GEOXOR_ID = "153274351561605120";
export const TARDOKI_ID = "858340143131787274";
export const MUTED_ROLE_ID = "737011597217628231";
export const GHOSTS_ROLE_ID = "736285344659669003";
export const VOTE_TIME = 30000;

export const SLURS = [
  "idiot",
  "baka",
  "mennn",
  "cunt",
  "noob",
  "scrub",
  "dumbass",
  "fucker",
  "you dumb fucking twat",
  "asshat",
  "bobbyfucker",
];

export const IPV4_REGEX = /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g;

export const INVENTORY_ICON = "https://cdn.discordapp.com/attachments/806300597338767450/872917164091396126/unknown.png";
export const WINDOWS_LOGO = "https://cdn.discordapp.com/attachments/816028632269979668/878984332025397258/windows.png";
export const LINUX_LOGO = "https://cdn.discordapp.com/attachments/816028632269979668/878984391936847882/LINUX-LOGO.png";
export const SHAII_LOGO = "https://cdn.discordapp.com/avatars/870496144881492069/0d0f5a8cd8ad5e0e0a5eec0d40d2e2a5.webp";

export const HISTORY_TYPES = ["nickname_history", "username_history", "status_history"] as const;

export const COMMAND_CATEGORIES: { categoryName: string; categoryEmoji: EmojiIdentifierResolvable }[] = [
  {
    categoryName: "ECONOMY",
    categoryEmoji: "💰",
  },
  {
    categoryName: "FUN",
    categoryEmoji: "😆",
  },
  {
    categoryName: "IMAGE_PROCESSORS",
    categoryEmoji: "🖼️",
  },
  {
    categoryName: "MODERATION",
    categoryEmoji: "🔨",
  },
  {
    categoryName: "MUSIC",
    categoryEmoji: "🎵",
  },
  {
    categoryName: "TEXT_PROCESSORS",
    categoryEmoji: "📝",
  },
  {
    categoryName: "UTILITY",
    categoryEmoji: "🔧",
  },
];

export const COMMAND_CATEGORIES_RAW = COMMAND_CATEGORIES.map((category) => {
  return category.categoryName;
});

export const IWAIFU_RARITIES: { name: string; color: string; emoji: EmojiIdentifierResolvable }[] = [
  {
    name: "common",
    color: "#8F93A2",
    emoji: "👺",
  },
  {
    name: "uncommon",
    color: "#BDDE86",
    emoji: "🐉",
  },
  {
    name: "rare",
    color: "#C792EA",
    emoji: "🔮",
  },
  {
    name: "legendary",
    color: "#FFCB6B",
    emoji: "🌟",
  },
  {
    name: "mythical",
    color: "#F07178",
    emoji: "⚜️",
  },
];

// this is pretty cringe
let tmpName: string[] = [];
Object.values(IWAIFU_RARITIES).forEach((rarity) => {
  tmpName.push(rarity.name);
});

let tmpColor: string[] = [];
Object.values(IWAIFU_RARITIES).forEach((rarity) => {
  tmpColor.push(rarity.color);
});

let tmpEmoji: EmojiIdentifierResolvable[] = [];
Object.values(IWAIFU_RARITIES).forEach((rarity) => {
  tmpEmoji.push(rarity.emoji);
});

export const IWAIFU_RARITIES_NAME = [...tmpName] as const;
export const IWAIFU_RARITIES_COLOR = [...tmpColor] as const;
export const IWAIFU_RARITIES_EMOJI = [...tmpEmoji] as const;
