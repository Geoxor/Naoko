import { EmojiIdentifierResolvable } from "discord.js";

export const SHAII_ID = "870496144881492069";
export const GEOXOR_GUILD_ID = "385387666415550474";
export const TESTING_GUILD_ID = "911762334538670160";
export const QBOT_DEV_GUILD_ID = "897185485313699891";
export const GEOXOR_GENERAL_CHANNEL_ID = "845328432715923487";
export const GEOXOR_STAFF_CHANNEL_ID = "553776591910600714";
export const DOWNVOTE_EMOJI_ID = "823666555123662888";
export const UPVOTE_EMOJI_ID = "834402501397577729";
export const GEOXOR_ID = "153274351561605120";
export const TARDOKI_ID = "858340143131787274";
export const SVRGE_ID = "148295829810053120";
export const QEXAT_ID = "439424425780183040";
export const N1KO_ID = "251270690160771072";
export const MOD_ROLE_ID = "438797772414648320";
export const ADMIN_ROLE_ID = "385391699293372429"
export const OVERPERM_ROLE_ID = "422444741527994368";
export const MUTED_ROLE_ID = "737011597217628231";
export const GHOSTS_ROLE_ID = "736285344659669003";
export const GEOBOTS_ROLE_ID = "720006137151488121";
export const VOTE_TIME = 30000;

export const restrictedChannels: string[] = [
  "845328432715923487"
];

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
  "neanderthal",
  "python dev",
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
