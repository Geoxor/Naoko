import Discord from "discord.js";
import packageJson from "../../../package.json" assert { type: 'json' };
import { SHAII_LOGO } from "../../constants";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import { PluginManager } from "../../plugins/PluginManager";
import { delay, inject } from "@triptyk/tsyringe";

@command()
class Plugins extends AbstractCommand {
  private static PLUGIN_ICON = "https://cdn.discordapp.com/attachments/911762334979084368/923234119553519636/unknown.png";

  constructor(
    @inject(delay(() => PluginManager)) private pluginManager: PluginManager,
  ) {
    super();
  }

  execute(): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const plugins = this.pluginManager.getAll();

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Naoko v${packageJson.version}`, iconURL: SHAII_LOGO })
      .setThumbnail(Plugins.PLUGIN_ICON)
      .setColor("#FF00B6")
      .addFields({
        inline: true,
        name: "Plugins",
        value: plugins.map((plugin) => `🔌 ${plugin.pluginData.name}`).join("\n"),
      })
      .addFields({
        inline: true,
        name: "Version",
        value: plugins.map((plugin) => plugin.pluginData.version).join("\n"),
      })
      .addFields({
        inline: true,
        name: "Enabled?",
        value: plugins.map((plugin) => plugin.pluginData.enabled ? '✅' : '❌').join("\n"),
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
