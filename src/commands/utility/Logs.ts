import { markdown } from "../../logic/logic";
import { logger } from "../../naoko/Logger";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Logs extends AbstractCommand {
  execute(): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    return markdown(logger.getLogHistory().substring(0, 1990));
  }

  get commandData(): CommandData {
    return {
      name: "logs",
      usage: "logs",
      category: "UTILITY",
      permissions: ["Administrator"],
      description: "Shows latest console logs.",
    };
  }
}
