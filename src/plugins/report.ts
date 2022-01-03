import Discord from "discord.js";
import { GEOXOR_GUILD_ID, GEOXOR_STAFF_CHANNEL_ID } from "../constants";
import commandMiddleware from "../middleware/commandMiddleware.shaii";
import { userMiddleware } from "../middleware/userMiddleware.shaii";
import { definePlugin } from "../shaii/Plugin.shaii";
import { defineCommand } from "../types";

const report = defineCommand({
  name: "report",
  description: "Report an user",
  usage: "~report <user_id> <reason>",
  category: "UTILITY",
  execute: async (message) => {
    if (message.args.length === 0) return "You need an user to report and a reason.";
    let targetUser = message.client.guilds.cache.get(GEOXOR_GUILD_ID)!.members.cache.get(message.args[0]);
    if (!targetUser) return `User with ID ${message.args[0]} is not in the guild.`;
    if (targetUser.id === message.author.id) return "You cannot report yourself.";
    message.args.shift();
    if (message.args.length === 0) return "You cannot report an user without reason.";
    const reason = message.args.join(" ");
    let attachments: string[] = [];
    let content;

    if (message.attachments) {
      message.attachments.forEach((attachment) => attachments.push(attachment.url));
      content = attachments.join("\n");
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.avatarURL() || message.author.defaultAvatarURL,
      })
      .setTitle(`Report ${targetUser.user.username}`)
      .setDescription(`ID: ${targetUser.id}`)
      .addField("Reason", reason)
      .setFooter("Report abuse will be punished")
      .setColor("#FFAF2F");

    const out = { content: content || "No file was attached.", embeds: [embed] };
    (
      message.client.guilds.cache
        .get(GEOXOR_GUILD_ID)!
        .channels.cache.get(GEOXOR_STAFF_CHANNEL_ID) as Discord.TextChannel
    ).send(out);
    return out;
  },
});

export default definePlugin({
  name: "@qexat/report",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      if (!(message.channel instanceof Discord.DMChannel)) return;
      userMiddleware(message, (message) => {
        commandMiddleware(message, async (message) => {
          // ignore if the command is not report
          if (message.command !== "report") return;
          try {
            const result = await report.execute(message);
            return message.reply(result!);
          } catch (err) {
            console.error(err);
          }
        });
      });
    },
  },
});
