import Discord from "discord.js";
import { defineCommand } from "../../types";
import { SHAII_LOGO } from "../../constants";
import Shaii from "../../shaii/Shaii.shaii";
import { version } from "../../../package.json";

const PLUGIN_ICON = "https://cdn.discordapp.com/attachments/911762334979084368/923233176145518633/unknown.png";

export default defineCommand({
  name: "plugins",
  category: "UTILITY",
  aliases: ["plug"],
  usage: "plugins",
  description: "See loaded plugins",
  requiresProcessing: false,
  execute: (message) => {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`Shaii v${version}`, SHAII_LOGO)
      .setThumbnail(PLUGIN_ICON)
      .setColor("#FF00B6")
      .addFields({ inline: true, name: "Plugins", value: Shaii.plugins.map((plugin) => plugin.name).join("\n") })
      .addFields({ inline: true, name: "Version", value: Shaii.plugins.map((plugin) => plugin.version).join("\n") });

    return { embeds: [embed] };
  },
});
