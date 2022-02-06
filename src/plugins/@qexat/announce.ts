import Discord, { APIErrors } from "discord.js";
import logger from "../../shaii/Logger.shaii";
import { definePlugin } from "../../shaii/Plugin.shaii";
import { defineCommand } from "../../types";

export default definePlugin({
  name: "@qexat/announcer",
  version: "1.0.0",
  command: defineCommand({
    name: "announce",
    aliases: ["announcement"],
    category: "MODERATION",
    permissions: ["ADMINISTRATOR"],
    usage: "announce <channel> <doesMentionEveryone> <message>",
    description: "Make an embedded announcement in a chosen channel",
    execute: async (message) => {
      const announcementChannel = message.mentions.channels.first() || message.channel;
      let mention;
      // by default, it does not mention everyone
      if (message.args[0] === "true") {
        mention = "@everyone";
        message.args.shift(); // removes doesMentionEveryone if it is set
      }

      let announcementMessage = message.args.join(" ");

      const embed = new Discord.MessageEmbed()
        .setColor("#d2185e") // same color as fun fact command because i have no inspiration
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.avatarURL() || message.author.defaultAvatarURL,
        })
        .setDescription(announcementMessage)
        .setFooter("Generated with Announcer plugin made by Qexat");

      try {
        await announcementChannel.send({ content: mention, embeds: [embed] });
      } catch (err: any) {
        logger.error(err);
        return ":x: Could not create the announcement message.";
      }

      return `:white_check_mark: Successfully created the announcement message in <#${announcementChannel.id}>`;
    },
  }),
});
