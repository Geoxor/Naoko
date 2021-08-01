import sakuria from "../classes/Sakuria.sakuria";
export const command = {
  name: "help",
  requiresProcessing: false,
  execute: (): string => {
    let commandArray = Array.from(sakuria.commands).map(command => command[1]).map(command => command.name)
    return commandArray.join('\n');
  },
};
