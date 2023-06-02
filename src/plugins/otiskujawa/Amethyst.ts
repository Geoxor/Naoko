import Discord from "discord.js";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import AbstractCommand, { CommandData } from "../../commands/AbstractCommand";
import plugin from "../../decorators/plugin";

class AmethystInfoCommand extends AbstractCommand {
  public execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const embed = new Discord.EmbedBuilder()
      .setFooter({
        text: `Used by ${message.author.username} Plugin made by otiskujawa.`,
        iconURL: message.author.avatarURL() || message.author.defaultAvatarURL,
      })
      .setColor("#424681")
      .setTitle("Amethyst")
      .setURL("https://github.com/Geoxor/amethyst")
      .setDescription("An electron-based audio player with a node-based audio routing system")
      .addFields({ name: "GitHub", value: "https://github.com/Geoxor/amethyst" })
      .setImage("https://camo.githubusercontent.com/1dfc85269fc7d15c0cd1bb5cc466fc596c55fe9423aad87c725460711ef7da01/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3636373436343433313536323635333730362f313032353733323035363132343233353832362f69636f6e2e706e673f77696474683d313932266865696768743d313932");

    return { embeds: [embed] };
  }

  public get commandData(): CommandData {
    return {
      name: "amethyst",
      aliases: ["amethyst", "ame"],
      category: "UTILITY",
      usage: "amethyst",
      description: "Create an embed with information about amethyst",
    }
  }
}

@plugin()
class Amethyst extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@otiskujawa/Amethyst",
      version: "1.0.0",
      commands: [AmethystInfoCommand],
    }
  }
}

