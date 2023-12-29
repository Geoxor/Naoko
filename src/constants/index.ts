import { EmojiIdentifierResolvable } from "discord.js";

export const GEOXOR_GUILD_ID = "385387666415550474";

// Channel
export const GEOXOR_GENERAL_CHANNEL_ID = "1018685216317001738";
export const GEOXOR_STAFF_CHANNEL_ID = "553776591910600714";
export const GEOXOR_CHAT_LOG_CHANNEL_ID = "393914221693239298";
export const GEOXOR_LEAVE_LOG_CHANNEL_ID = "823403109522866217";
export const GEOXOR_VOICE_CHAT_LOG_CHANNEL_ID = "755597803102928966";

// User
export const NAOKO_ID = "870496144881492069";

export const GEOXOR_ID = "153274351561605120";
export const N1KO_ID = "251270690160771072";

// Roles
export const MOD_ROLE_ID = "438797772414648320";
export const ADMIN_ROLE_ID = "385391699293372429";
export const OVERPERM_ROLE_ID = "422444741527994368";
export const MUTED_ROLE_ID = "737011597217628231";
export const GHOSTS_ROLE_ID = "736285344659669003";
export const GEOBOTS_ROLE_ID = "720006137151488121";
export const GEOXOR_DEV_ROLE_ID = "834695360387612683";

export const WINDOWS_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Windows_logo_-_2012.png/438px-Windows_logo_-_2012.png";
export const LINUX_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/405px-Tux.svg.png";
export const NAOKO_LOGO =
  "https://cdn.discordapp.com/avatars/870496144881492069/fcb2aa2c14ca602c662f5d6a2c511bc8.webp?size=256";

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
