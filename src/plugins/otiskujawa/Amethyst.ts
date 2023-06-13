import Discord from "discord.js";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import { singleton } from "@triptyk/tsyringe";

@singleton()
class AmethystInfoCommand extends AbstractCommand {
  public execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const message = payload.get('message');

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

    return embed;
  }

  public get commandData(): CommandData {
    return {
      name: "amethyst",
      aliases: ["ame"],
      category: "UTILITY",
      usage: "",
      description: "Create an embed with information about amethyst",
    }
  }
}

@plugin()
class Amethyst extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@otiskujawa/amethyst",
      version: "1.0.0",
      commands: [AmethystInfoCommand],
    }
  }
}

