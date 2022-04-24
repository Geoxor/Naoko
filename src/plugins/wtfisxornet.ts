import Discord, { APIErrors } from "discord.js";
import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";

export default definePlugin({
  name: "@otiskujawa/wtfisxornet",
  version: "1.0.0",
  command: defineCommand({
    name: "wtfisxornet",
    aliases: ["xornet", "wtfxornet"],
    category: "UTILITY",
    usage: "wtfisxornet",
    description: "Create an embed with information about Xornet",
    execute: async (message) => {

      const embed = new Discord.MessageEmbed()
        .setTitle("Xornet-cloud")
        .setColor("#00abff") 
        .setFooter( "Plugin made by otiskujawa. Used by " + message.author.username, message.author.avatarURL() || message.author.defaultAvatarURL )
        .setDescription("Xornet is a management dashboard for people to easily view & control their servers from anywhere in the world!")
        .addField("Web page", "https://xornet.cloud/")
        .addField("GitHub", "https://github.com/xornet-cloud/")
        .setImage("https://cdn.discordapp.com/attachments/762063073807958029/967819062006657044/unknown.png");

      return { embeds: [embed] };
    },
  }),
});
