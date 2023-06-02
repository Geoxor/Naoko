import Discord from "discord.js";
import facts from "./facts.json" assert { type: 'json' };
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import plugin from "../../decorators/plugin";
import AbstractCommand, { CommandData } from "../../commands/AbstractCommand";
import { CommandExecuteResponse } from "../../types";
import { randomChoice } from "../../logic/logic";

class FunFactCommand extends AbstractCommand {
  public execute(): CommandExecuteResponse {
    const embed = new Discord.EmbedBuilder()
      .setColor("#d2185e")
      .setAuthor({ name: 'Fun Facts by azur' })
      .setThumbnail(randomChoice([
        'https://wiki.hypixel.net/images/0/0a/SkyBlock_items_enchanted_book_and_quill.gif',
        'https://wiki.hypixel.net/images/4/4e/SkyBlock_items_enchanted_book.gif'
      ]))
      .addFields({
        name: "Fun fact:",
        value: `${randomChoice(facts)}`,
        inline: true,
      })
      .setFooter({ text: `Total of ${facts.length} fun facts` });

    return { embeds: [embed] };
  }
  public get commandData(): CommandData {
    return {
      name: "funfact",
      category: "FUN",
      usage: "funfact",
      description: "Random fun fact",
    }
  }
}

@plugin()
class FunFacts extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@azur1s/fun-fact",
      version: "1.0.0",
      commands: [FunFactCommand],
    }
  }
}
