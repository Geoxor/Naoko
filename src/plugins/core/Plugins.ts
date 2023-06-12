import { inject, delay, singleton } from "@triptyk/tsyringe";
import { COMMAND_CATEGORIES, SHAII_LOGO } from "../../constants";
import plugin from "../../decorators/plugin";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { PluginManager } from "../PluginManager";
import Naoko from "../../naoko/Naoko";
import Discord, { EmbedBuilder, PermissionsBitField, bold, inlineCode } from 'discord.js';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import AbstractCommand, { CommandData } from "../AbstractCommand";

@singleton()
class Help extends AbstractCommand {
  constructor(
    @inject(delay(() => PluginManager)) private pluginManager: PluginManager,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');
    if (args.length === 0) {
      return this.createFullHelpEmbed();
    }

    const filterQuery = args.join("_");
    if (COMMAND_CATEGORIES.find((category) => category.categoryName === filterQuery.toLocaleUpperCase())) {
      return this.createCategoryCommandList(filterQuery);
    }

    return this.createCommandHelpEmbed(filterQuery);
  }

  private createFullHelpEmbed() {
    const helpEmbed = new EmbedBuilder();
    helpEmbed.setTitle("Listing all available commands");
    helpEmbed.setColor("#fca103");

    const categories = COMMAND_CATEGORIES;
    const embedFields = [];

    let totalCommands = 0;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const countInCategory = this.commandCountInCategory(category.categoryName);
      totalCommands += countInCategory;
      if (countInCategory > 0) {
        embedFields.push({
          name: `${category.categoryName} (${countInCategory})`,
          value: this.commandsStringFromCategory(category.categoryName),
        });
      }
    }

    helpEmbed.addFields(embedFields);
    helpEmbed.setFooter({ text: `${totalCommands} commands in total` })
    return helpEmbed;
  }

  private createCategoryCommandList(filterQuery: string) {
    const helpEmbed = new EmbedBuilder();

    const commandList = this.commandsStringFromCategory(filterQuery.toUpperCase());

    helpEmbed.setTitle(`Listing all available commands in ${filterQuery.toUpperCase()}`);
    helpEmbed.setColor("#fca103");
    helpEmbed.setDescription(commandList || "No commands found");
    return helpEmbed;
  }

  private createCommandHelpEmbed(filterQuery: string) {
    const helpEmbed = new EmbedBuilder();
    const commandName = filterQuery.toLowerCase();

    const command = this.pluginManager.getCommand(commandName, false);
    if (command) {
      const commandData = command.commandData;

      helpEmbed.setTitle(`Command: ${commandName}`);
      helpEmbed.setDescription(commandData.description);
      helpEmbed.setColor("#fca103");
      helpEmbed.setImage(SHAII_LOGO)
      if (commandData.usage) {
        helpEmbed.addFields({ name: "Usage", value: `\`${commandName} ${commandData.usage}\`` });
      } else {
        helpEmbed.addFields({ name: "Usage", value: 'This command does not accept any parameter' });
      }
      helpEmbed.addFields({ name: "Category", value: commandData.category, inline: true });
      helpEmbed.addFields({ name: "Requires processing?", value: commandData.requiresProcessing ? '✅' : '❌', inline: true });

      if (commandData.permissions) {
        const permissions = new PermissionsBitField(commandData.permissions);
        helpEmbed.addFields({ name: "Permissions", value: permissions.toArray().join(', '), inline: true });
      }

      return helpEmbed;
    }

    helpEmbed.setTitle("Command not found");
    helpEmbed.setColor("#fca103");
    helpEmbed.addFields({
      name: commandName + " not found",
      value: "Try using `help` to list all commands"
    });
    return helpEmbed;
  }

  private commandsStringFromCategory(category: string): string {
    const allCommands = this.pluginManager.getAllCommands();
    const commands = allCommands.filter((command) => command.commandData.category === category);

    const commandNames = [];
    for (const command of commands) {
      commandNames.push(command.commandData.name);
      if (command.commandData.aliases) {
        commandNames.push(...command.commandData.aliases);
      }
    }

    if (commandNames.length === 0) {
      return '';
    }

    const commandsString = commandNames.join('`, `');
    return inlineCode(commandsString);
  }

  private commandCountInCategory(category: string): number {
    const allCommands = this.pluginManager.getAllCommands();
    const commands = allCommands.filter((command) => command.commandData.category === category);

    let count = 0;
    for (const command of commands) {
      count++;
      if (command.commandData.aliases) {
        count += command.commandData.aliases.length;
      }
    }
    return count;
  }

  get commandData(): CommandData {
    return {
      name: "help",
      category: "UTILITY",
      usage: "[(<category> | <command>)]",
      description: "Show the list of all commands, info about a specific command or category",
    }
  }
}

@singleton()
class PluginList extends AbstractCommand {
  private static readonly PLUGIN_ICON = "https://cdn.discordapp.com/attachments/911762334979084368/923234119553519636/unknown.png";

  constructor(
    @inject(delay(() => PluginManager)) private pluginManager: PluginManager,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const plugins = this.pluginManager.getAll(false).sort((a, b) => a.pluginData.name > b.pluginData.name ? 1 : -1);

    const pluginName = payload.get('args')[0];
    if (pluginName) {
      return this.getPluginInfoEmbed(pluginName, plugins);
    }

    return this.getAllPluginsEmbed(plugins);
  }

  private getPluginInfoEmbed(pluginName: string, plugins: AbstractPlugin[]) {
    // The @ will cause the vendor e.g. geo to be pinged
    if (!pluginName.startsWith("@")) {
      pluginName = "@" + pluginName;
    }

    const plugin = plugins.find((plugin) => plugin.pluginData.name === pluginName);
    if (!plugin) {
      return `No plugin named ${pluginName} found!`;
    }

    const description = 
      `${bold("Version:")} ${plugin.pluginData.version} - ` +
      `${bold("Enabled:")} ${plugin.pluginData.enabled !== false ? '✅' : '❌'}`;

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Naoko v${Naoko.version}`, iconURL: SHAII_LOGO })
      .setThumbnail(PluginList.PLUGIN_ICON)
      .setTitle(`Plugin: ${plugin.pluginData.name}`)
      .setDescription(description)
      .setColor("#FF00B6");

    const commands = this.pluginManager.resolvePluginCommands(plugin);
    const commandNameList = [];
    for (const command of commands) {
      commandNameList.push(command.commandData.name);
      commandNameList.push(...command.commandData.aliases || []);
    }
    if (commandNameList) {
      const commandList = commandNameList.map((name) => `- ${name}`).join("\n")
      embed.addFields({ name: "Commands", value: commandList, inline: true })
    }

    if (plugin.pluginData.events) {
      const eventList = Object.keys(plugin.pluginData.events).map((event) => `- ${event}`).join("\n");
      embed.addFields({ name: "Event listener" , value: eventList, inline: true})
    }

    if (plugin.pluginData.timers) {
      const timerList = plugin.pluginData.timers.map((timer) => `- interval: ${timer.interval}ms`).join("\n");
      embed.addFields({ name: "Timer" , value: timerList, inline: true })
    }

    return embed;
  }

  private getAllPluginsEmbed(plugins: AbstractPlugin[]) {
    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Naoko v${Naoko.version}`, iconURL: SHAII_LOGO })
      .setThumbnail(PluginList.PLUGIN_ICON)
      .setColor("#FF00B6")
      .addFields({
        inline: true,
        name: "Plugins",
        value: plugins.map((plugin) => `🔌 ${plugin.pluginData.name}`).join("\n"),
      })
      .addFields({
        inline: true,
        name: "Version",
        value: plugins.map((plugin) => plugin.pluginData.version).join("\n"),
      })
      .addFields({
        inline: true,
        name: "Enabled?",
        value: plugins.map((plugin) => plugin.pluginData.enabled !== false ? '✅' : '❌').join("\n"),
      });

    return embed;
  }

  get commandData(): CommandData {
    return {
      name: "plugins",
      category: "UTILITY",
      usage: "[<plugin>]",
      description: "List all plugins or more info about a plugin",
    }
  };
}

@plugin()
class Plugins extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: '@core/plugins',
      version: "1.0.0",
      commands: [PluginList, Help],
    }
  }
}
