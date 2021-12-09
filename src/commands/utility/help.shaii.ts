import shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import Discord from "discord.js";

export default defineCommand({
  name: "help",
  aliases: ["h"],
  description: "The command you just did",
  requiresProcessing: false,
  execute: (message: Discord.Message) => {
    let commandArray = Array.from(shaii.commands)
      .map((command) => command[1])
      .map((command) => `${command.name} - ${command.description}`);

    return {
      files: [
        {
          name: "commands.txt",
          attachment: Readable.from(commandArray.join("\n")),
        },
      ],
    };
  },
});
