import { msToFullTime } from "../../logic/logic";
import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Uptime extends AbstractCommand {
  execute(): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    return msToFullTime(Naoko.bot.uptime || 0);
  }

  getCommandData(): CommandData {
    return {
      name: 'uptime',
      category: 'UTILITY',
      usage: 'uptime',
      description: 'Returns the bots uptime',
    };
  }
}
