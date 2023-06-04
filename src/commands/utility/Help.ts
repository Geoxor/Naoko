import { CommandExecuteResponse, IMessage } from "../../types";
import { EmbedBuilder } from "discord.js";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import { delay, inject, injectable } from '@triptyk/tsyringe';
import CommandManager from '../CommandManager';
import command from '../../decorators/command';
import { COMMAND_CATEGORIES } from '../../constants';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";

// Help has circular Dependency (Help -> naokoCommands -> CommandManager -> Help)
// We must use a delay and the @injectable here for it to work.
@command()
class Help extends AbstractCommand {
  constructor(
    @inject(delay(() => CommandManager)) private commandManager: CommandManager,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    const categories = COMMAND_CATEGORIES;
    const helpEmbed = new EmbedBuilder();

    let embedFields = [];

    // TODO: Refactor this
    if (args.length === 0) {
      helpEmbed.setTitle("Listing all available commands");
      helpEmbed.setColor("#fca103");

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (this.commandsStringFromCategory(category.categoryName).length > 0){
          embedFields.push({
            name: `${category.categoryName} (${this.commandCountInCategory(category.categoryName)})`,
            value: this.commandsStringFromCategory(category.categoryName),
          });
        }
      }
      helpEmbed.addFields(embedFields);
    } else {
      const filterQuery = args.join("_");
      if (categories.find((category) => category.categoryName === filterQuery.toLocaleUpperCase())) {
        helpEmbed.setTitle(`Listing all available commands in ${filterQuery.toUpperCase()}`);
        helpEmbed.setColor("#fca103");
        helpEmbed.setDescription(this.commandsStringFromCategory(filterQuery.toUpperCase()) || "No commands found");
      } else {
        const command = this.commandManager.getCommand(filterQuery.toLowerCase());
        if (command) {
          const commandData = command.commandData;

          helpEmbed.setTitle(commandData.name);
          helpEmbed.setDescription(commandData.name);
          helpEmbed.setColor("#fca103");
          embedFields.push({ name: "Usage", value: `\`${commandData.name}\`` });
          if (commandData.aliases) {
            embedFields.push({
              name: "Aliases",
              value: `\`${commandData.aliases?.join(", ")}\``
            });
          }

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
  }

  private commandsStringFromCategory(category: string): string {
    const allCommands = this.commandManager.getAll();
    const commands = allCommands.filter((command) => command.commandData.category === category);
    let commandsString = "";
    for (let z = 0; z < commands.length; z++) {
      commandsString += `\`${commands[z].commandData.name}\`` + (commands.length - 1 === z ? "" : ", ");
    }
    return commandsString;
  }

  private commandCountInCategory(category: string): number {
    const allCommands = this.commandManager.getAll();
    return allCommands.filter((command) => command.commandData.category === category).length;
  }

  get commandData(): CommandData {
    return {
      name: "help",
      category: "UTILITY",
      usage: "help",
      aliases: ["h"],
      description: "The command you just did",
    }
  }
}
