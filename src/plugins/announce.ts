import Discord from "discord.js";
import { defineCommand } from "../types";
import { definePlugin } from "../shaii/Plugin.shaii";
import { url } from "inspector";
import logger from "../shaii/Logger.shaii";

export default definePlugin({
  name: "@qexat/announce",
  version: "1.0.0",
  command: defineCommand({
    name: "announce",
    category: "MODERATION",
    permissions: ["ADMINISTRATOR"],
    usage: "announce <channel> <doesMentionEveryone> <message>",
    description: "Make an embedded announcement in a chosen channel",
    execute: async (message) => {
      const announcementChannel = message.mentions.channels.first() || message.channel;
      
      // by default, it does not mention everyone
      let mention: string = "";
      if (message.args[0] === "true") mention = "@everyone";
      // removes doesMentionEveryone argument if it exists
      if (["true", "false"].includes(message.args[0])) message.args.shift();

      let announcementMessage = message.args.join(" ");

      
      const embed = new Discord.MessageEmbed()
        .setColor("#d2185e") // same color as fun fact command because i have no inspiration
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.avatarURL() || message.author.defaultAvatarURL
        })
        .setDescription(announcementMessage)
        .setFooter("Generated with `Announce` plugin made by Qexat")

      await announcementChannel.send({ content: mention, embeds: [embed] })
        .catch((err) => {
          logger.error(err);
          return ":x: Could not create the announcement message."
        })
      
      return `:white_check_mark: Successfully created the announcement message in <#${announcementChannel.id}>`
    }
  })
})