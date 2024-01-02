import Discord from "discord.js";
import facts from "./facts.json" assert { type: "json" };
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import plugin from "../../decorators/plugin";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from "../AbstractCommand";
import CommonUtils from "../../service/CommonUtils";
import { singleton } from "tsyringe";

@singleton()
class FunFactCommand extends AbstractCommand {
  constructor(private commonUtils: CommonUtils) {
    super();
  }

  public execute(): CommandExecuteResponse {
    const embed = new Discord.EmbedBuilder()
      .setColor("#d2185e")
      .setAuthor({ name: "Fun Facts by azur" })
      .setThumbnail(
        this.commonUtils.randomChoice([
          "https://wiki.hypixel.net/images/0/0a/SkyBlock_items_enchanted_book_and_quill.gif",
          "https://wiki.hypixel.net/images/4/4e/SkyBlock_items_enchanted_book.gif",
        ]),
      )
      .addFields({
        name: "Fun fact:",
        value: `${this.commonUtils.randomChoice(facts)}`,
        inline: true,
      })
      .setFooter({ text: `Total of ${facts.length} fun facts` });

    return { embeds: [embed] };
  }
  public get commandData(): CommandData {
    return {
      name: "funfact",
      category: "FUN",
      usage: "",
      description: "Random fun fact",
    };
  }
}

@plugin()
class FunFacts extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@azur1s/fun-fact",
      version: "1.0.0",
      commands: [FunFactCommand],
    };
  }
}
