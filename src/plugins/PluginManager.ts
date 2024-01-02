import { container, injectAll, singleton } from "tsyringe";
import AbstractPlugin from "./AbstractPlugin";
import { Client } from "discord.js";
import AbstractCommand from "./AbstractCommand";
import levenshtein from "js-levenshtein";

@singleton()
export class PluginManager {
  constructor(@injectAll("naokoPlugin") private plugins: AbstractPlugin[]) {}

  public getAll(onlyEnabled = true): AbstractPlugin[] {
    if (onlyEnabled) {
      return this.plugins.filter((plugin) => plugin.pluginData.enabled !== false);
    }
    return this.plugins;
  }

  public registerEventListener(client: Client): void {
    for (const plugin of this.getAll()) {
      if (!plugin.pluginData.events) {
        continue;
      }

      for (const [eventName, handler] of Object.entries(plugin.pluginData.events)) {
        const boundHandler = handler.bind(plugin);
        client.on(eventName, (...args) => {
          if (plugin.pluginData.enabled !== false) {
            // @ts-ignore
            boundHandler(...args);
          }
        });
      }
    }
  }

  public getCommand(commandName: string, onlyEnabled = true): AbstractCommand | null {
    for (const command of this.getAllCommands(onlyEnabled)) {
      if (command.commandData.name === commandName || command.commandData.aliases?.includes(commandName)) {
        return command;
      }
    }

    return null;
  }

  public getClosestCommand(searchString: string): AbstractCommand | undefined {
    let closest: { command: AbstractCommand | undefined; distance: number } = {
      command: undefined,
      distance: 4, // ld: levenshtein distance
    };
    for (const command of this.getAllCommands()) {
      const name = command.commandData.name;
      const currentCommandDistance = levenshtein(name, searchString);

      if (currentCommandDistance < closest.distance) {
        closest.command = command;
        closest.distance = currentCommandDistance;
      }
    }

    if (!closest.command || closest.distance > 2.5) {
      return;
    }

    return closest.command;
  }

  public getAllCommands(onlyEnabled = true): AbstractCommand[] {
    const commands = [];

    for (const plugin of this.getAll(onlyEnabled)) {
      commands.push(...this.resolvePluginCommands(plugin));
    }

    return commands;
  }

  public resolvePluginCommands(plugin: AbstractPlugin): AbstractCommand[] {
    if (!plugin.pluginData.commands) {
      return [];
    }

    return plugin.pluginData.commands.map((command) => container.resolve(command));
  }
}
