import Discord, { APIErrors } from "discord.js";
import { definePlugin } from "../naoko/Plugin";
import { defineCommand } from "../types";

export default definePlugin({
  name: "@otiskujawa/amethyst",
  version: "1.0.0",
  command: defineCommand({
    name: "amethyst",
    aliases: ["amethyst", "ame"],
    category: "UTILITY",
    usage: "amethyst",
    description: "Create an embed with information about amethyst",
    execute: async (message) => {
      const embed = new Discord.MessageEmbed();
      embed
        .setFooter(
          "Used by " + message.author.username + ". Plugin made by otiskujawa.",
          message.author.avatarURL() || message.author.defaultAvatarURL
        )
        .setColor("#424681");

      // default
      embed
        .setTitle("Amethyst")
        .setURL("https://github.com/Geoxor/amethyst")
        .setDescription(
          "An electron-based audio player with a node-based audio routing system"
        )
        .addField("GitHub", "https://github.com/Geoxor/amethyst")
        .setImage("https://camo.githubusercontent.com/2b8bfd96500c342aeb89839e2f68177a1b556148ddb36d9c64aa991e33601b19/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3834353332383433323731353932333438372f3937383836303439373537373334303932382f6c6f676f2e706e673f77696474683d313932266865696768743d313932");

      return { embeds: [embed] };
    },
  }),
});
