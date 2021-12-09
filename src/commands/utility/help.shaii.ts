import shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";
import { Readable } from "stream";

export default defineCommand({
  name: "help",
  category: "UTILITY",
  aliases: ["h"],
  description: "The command you just did",
  requiresProcessing: false,
  execute: () => {
    const helpString = [];

    const categories = ["ECONOMY", "FUN", "IMAGE_PROCESSORS", "MODERATION", "MUSIC", "UTILITY"];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const commands = Array.from(shaii.commands.filter((command) => command.category === category));

      let categoryCommands = commands
        .map((command) => command[1])
        .map((command) =>
          command.aliases.length
            ? `${command.name}: ${command.description} # [${command.aliases.join(", ")}]`
            : `${command.name}: ${command.description}`
        )
        .join("\n");

      helpString.push(`\n# ${category.replace(/_/g, " ")}\n`);
      helpString.push(`${categoryCommands}\n`);
    }

    return {
      files: [
        {
          name: "commands.yml",
          attachment: Readable.from(helpString.join("").trim()),
        },
      ],
    };
  },
});
