import Discord from "discord.js";
import packageJson from "../../../package.json" assert { type: 'json' };
import { SHAII_LOGO } from "../../constants";
import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

const PLUGIN_ICON = "https://cdn.discordapp.com/attachments/911762334979084368/923234119553519636/unknown.png";

@command()
class Plugins extends AbstractCommand {
  execute(): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Naoko v${packageJson.version}`, iconURL: SHAII_LOGO })
      .setThumbnail(PLUGIN_ICON)
      .setColor("#FF00B6")
      .addFields({
        inline: true,
        name: "Plugins",
        value: Naoko.plugins.map((plugin) => `🔌 ${plugin.name}`).join("\n"),
      })
      .addFields({
        inline: true,
        name: "Version",
        value: Naoko.plugins.map((plugin) => plugin.version).join("\n"),
      })
      .addFields({
        inline: true,
        name: "Enabled?",
        value: Naoko.plugins.map((plugin) => plugin.state === 1 ? '✅' : '❌').join("\n"),
      });

    return { embeds: [embed] };
  }

  get commandData(): CommandData {
    return {
      name: "plugins",
      category: "UTILITY",
      aliases: ["plug"],
      usage: "plugins",
      description: "See loaded plugins",
    }
  };
}
