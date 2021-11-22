import sakuria from "../../sakuria/Sakuria.sakuria";
import { defineCommand } from "../../types";
import { Readable } from "stream";
import Discord from "discord.js";

export default defineCommand({
  name: "help",
  description: "The command you just did",
  requiresProcessing: false,
  execute: (message: Discord.Message) => {
    let commandArray = Array.from(sakuria.commands)
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
