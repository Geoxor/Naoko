import sakuria from "../classes/Sakuria.sakuria";
export default {
  name: "help",
  description: "The command you just did",
  requiresProcessing: false,
  execute: (): string => {
    let commandArray = Array.from(sakuria.commands)
      .map((command) => command[1])
      .map((command) => `${command.name} - ${command.description}`);
    return commandArray.join("\n");
  },
};
