import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";
import sakuria from "../../sakuria/Sakuria.sakuria";

export default defineCommand({
  data: new SlashCommandBuilder().setName("help").setDescription("See all possible commands sakuria has!"),
  execute: () => {
    let commandArray = Array.from(sakuria.commands)
      .map((command) => command[1])
      .map((command) => `${command.data.name} - ${command.data.description}`);
    return commandArray.join("\n");
  },
});
