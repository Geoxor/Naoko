import { injectAll, singleton } from '@triptyk/tsyringe';
import AbstractCommand from './AbstractCommand';
import levenshtein from 'js-levenshtein';

@singleton()
export default class CommandManager {
  constructor(
    @injectAll('naokoCommand') private commands: AbstractCommand[],
  ) {}

  public getCommand(commandName: string): AbstractCommand | undefined {
    // TODO: Also Check in Plugins
    return this.commands.find((command) => {
      return (
        command.commandData.name === commandName ||
        command.commandData.aliases?.includes(commandName)
      );
    });
  }

  public getClosestCommand(searchString: string): AbstractCommand | undefined {
    let closest: { command: AbstractCommand | undefined; distance: number } = {
      command: undefined,
      distance: 4, // ld: levenshtein distance
    };
    for (const command of this.commands) {
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

  public getAll(): AbstractCommand[] {
    return this.commands;
  }
}
