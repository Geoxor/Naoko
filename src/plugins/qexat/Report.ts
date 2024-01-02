import Discord from "discord.js";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { CommandExecuteResponse } from "../../types";
import { GEOXOR_GUILD_ID, GEOXOR_STAFF_CHANNEL_ID } from "../../constants";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import { singleton } from "tsyringe";

@singleton()
class ReportCommand extends AbstractCommand {
  public async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get("message");
    const args = payload.get("args");

    if (args.length === 0) return "You need an user to report and a reason.";
    let targetUser = message.client.guilds.cache.get(GEOXOR_GUILD_ID)!.members.cache.get(args[0]);
    if (!targetUser) return `User with ID ${args[0]} is not in the guild.`;
    if (targetUser.id === message.author.id) return "You cannot report yourself.";
    args.shift();

    if (args.length === 0) return "You cannot report an user without reason.";
    const reason = args.join(" ");
    let attachments: string[] = [];
    let content;

    if (message.attachments) {
      message.attachments.forEach((attachment) => attachments.push(attachment.url));
      content = attachments.join("\n");
    }

    const embed = new Discord.EmbedBuilder()
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.avatarURL() || message.author.defaultAvatarURL,
      })
      .setTitle(`Report ${targetUser.user.username}`)
      .setDescription(`ID: ${targetUser.id}`)
      .addFields([{ name: "Reason", value: reason }])
      .setFooter({ text: "Report abuse will be punished" })
      .setColor("#FFAF2F");

    const out = { content: content || "No file was attached.", embeds: [embed] };
    // This is kinda scuff
    await (message.client.channels.cache.get(GEOXOR_STAFF_CHANNEL_ID) as Discord.TextChannel).send(out);
    return out;
  }

  public get commandData(): CommandData {
    return {
      name: "report",
      description: "Report an user",
      usage: "<user_id> <reason>",
      category: "UTILITY",
    };
  }
}

@plugin()
class Report extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@qexat/report",
      version: "1.0.0",
      commands: [ReportCommand],
      enabled: false,
    };
  }
}
