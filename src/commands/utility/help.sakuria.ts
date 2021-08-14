import sakuria from "../../sakuria/Sakuria.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "help",
  description: "The command you just did",
  requiresProcessing: false,
  execute: () => {
    let commandArray = Array.from(sakuria.commands)
      .map((command) => command[1])
      .map((command) => `${command.name} - ${command.description}`);
    return commandArray.join("\n");
  },
});
