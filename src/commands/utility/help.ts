import { Readable } from "stream";
import naoko from "../../naoko/Naoko";
import { defineCommand } from "../../types";
import { MessageEmbed } from "discord.js";
import { logger } from "../../naoko/Logger";

function commandsStringFromCategory(category: string): string {
  const commands = Array.from(naoko.commands.filter((command) => command.category === category));
  let commandsString = "";
  for (let z = 0; z < commands.length; z++) {
    commandsString += `\`${commands[z][1].name}\`` + (commands.length - 1 === z ? "" : ", ");
  }
  return commandsString;
}

function commandCountInCategory(category: string): number {
  return Array.from(naoko.commands.filter((command) => command.category === category)).length;
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
    
    let embedFields = [];
    
    if (message.args.length === 0) {
      helpEmbed.setTitle("Listing all available commands");
      helpEmbed.setColor("#fca103");

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        embedFields.push({
          name: `${category} (${commandCountInCategory(category)})`,
          value: commandsStringFromCategory(category).length > 0 ? commandsStringFromCategory(category) : "No commands in this category",
        });
      }
      helpEmbed.addFields(embedFields);
    } else {
      const filterQuery = message.args.join("_");
      if (categories.includes(filterQuery.toUpperCase())) {
        helpEmbed.setTitle(`Listing all available commands in ${filterQuery.toUpperCase()}`);
        helpEmbed.setColor("#fca103");
        helpEmbed.setDescription(commandsStringFromCategory(filterQuery.toUpperCase()) || "No commands found");
      } else {
        const command = naoko.commands.get(filterQuery.toLowerCase());
        if (command) {
          helpEmbed.setTitle(`${command.name}`);
          helpEmbed.setDescription(`${command.description}`);
          helpEmbed.setColor("#fca103");
          embedFields.push({
            name: "Usage",
            value: `\`${command.usage}\``
          });
          if (command.aliases.length > 0) embedFields.push({
            name: "Aliases",
            value: `\`${command.aliases.join(", ")}\``
          });

          helpEmbed.addFields(embedFields);
        } else {
          helpEmbed.setTitle("Command not found");
          helpEmbed.setColor("#fca103");
          embedFields.push({
            name: filterQuery.toLowerCase() + " not found",
            value: "Try using `help` to list all commands"
          });

          helpEmbed.addFields(embedFields);
        }
      }
    }
    
    return {
      embeds: [helpEmbed],
    };
  },
});
