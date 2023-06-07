import { logger } from "../../naoko/Logger";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import { codeBlock } from "discord.js";

@command()
class Logs extends AbstractCommand {
  execute(): CommandExecuteResponse {
    return codeBlock(logger.getLogHistory().substring(0, 1990));
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
