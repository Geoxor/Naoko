import { Readable } from "stream";
import shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";
import { MessageEmbed } from "discord.js";

function commandsStringFromCategory(category: string): string {
  const commands = Array.from(shaii.commands.filter((command) => command.category === category));
  let commandsString = "";
  for (let z = 0; z < commands.length; z++) {
    commandsString += `\`${commands[z][1].name}\`` + (commands.length - 1 === z ? "" : ", ");
  }
  return commandsString;
}

function commandCountInCategory(category: string): number {
  return Array.from(shaii.commands.filter((command) => command.category === category)).length;
}

export default defineCommand({
  name: "help",
  category: "UTILITY",
  usage: "help",
  aliases: ["h"],
  description: "The command you just did",
  execute: (message) => {
    const helpString = [];

    const categories = ["ECONOMY", "FUN", "IMAGE_PROCESSORS", "MODERATION", "MUSIC", "UTILITY"];
    const helpEmbed = new MessageEmbed();
    if (message.args.length === 0) {
      helpEmbed.setTitle("Listing all available commands");
      helpEmbed.setColor("#fca103");

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        helpEmbed.addField(
          `${category.replace(/_/g, " ")} (${commandCountInCategory(category)})`,
          `${commandsStringFromCategory(category)}`
        );
      }
    } else {
      const filterQuery = message.args.join("_");
      if (categories.includes(filterQuery.toUpperCase())) {
        helpEmbed.setTitle(`Listing all available commands in ${filterQuery.toUpperCase()}`);
        helpEmbed.setColor("#fca103");
        helpEmbed.setDescription(commandsStringFromCategory(filterQuery.toUpperCase()) || "No commands found");
      } else {
        const command = shaii.commands.get(filterQuery.toLowerCase());
        if (command) {
          helpEmbed.setTitle(`${command.name}`);
          helpEmbed.setDescription(`${command.description}`);
          helpEmbed.setColor("#fca103");
          helpEmbed.addField("Category", `${command.category}`);
          helpEmbed.addField("Usage", `${command.usage}`);
          if (command.aliases.length > 0) helpEmbed.addField("Aliases", `${command.aliases.join(", ")}`);
        } else {
          helpEmbed.setTitle("Command not found");
          helpEmbed.setColor("#fca103");
          helpEmbed.addField(`${filterQuery.toLowerCase()}`, `No matching commands found`);
        }
      }
    }
    return {
      embeds: [helpEmbed],
    };
  },
});
