import { CommandType, defineCommand, ICommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedFieldData } from "discord.js";
import sakuria from "../../sakuria/Sakuria.sakuria";
import SakuriaEmbed, { createInlineBlankField } from "../../sakuria/SakuriaEmbed.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder().setName("help").setDescription("See all possible commands sakuria has!"),
  type: CommandType.UTILITY,
  execute: () => {
    const commandArray = Array.from(sakuria.commands)
      .map((command) => command[1]);

    // Creates a Map that holds every CommandType value as key, and an empty array as value.
    const commandMap = new Map<CommandType, [string, string][]>(Object.values(CommandType).map((commandType) => [commandType, []]));
    const embedFields: EmbedFieldData[] = [];

    // Inserts every commands into it's referring commandMap key.
    commandArray.forEach((command) => {
      commandMap.get(command.type)?.push([command.data.name, command.data.description]);
    });
    
    // Filter out the empty CommandType entry
    commandMap.filter((stringArray) => stringArray.length);

    // Makes the command alphabetical ordered. (https://canary.discord.com/channels/385387666415550474/823647553680703529/877873819161862195)
    commandMap.forEach((stringArray) => {
      stringArray.sort(([cmdAName], [cmdBName]) => cmdAName.localeCompare(cmdBName));
    });

    // Formats all elements of commandMap into EmbedFieldData and inserts it into embedFields.
    commandMap.forEach((nameDescriptionArray, commandType) => {
      const fieldValue = nameDescriptionArray
        .map(([name, description]) => `**${name}**:\n${description}`)
        .join("\n");

      embedFields.push({
        name: commandType,
        value: fieldValue,
        inline: true,
      });
    });

    return {
      embeds: [
        new SakuriaEmbed({
          title: "\\~\\~ Commands \\~\\~",
          fields: [
            ...embedFields,
            ...createInlineBlankField(commandArray.length % 3),
          ],
        })
      ]
    };
  },
});
