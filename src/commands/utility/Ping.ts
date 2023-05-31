import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Ping extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    const timestampMessage = await message.channel.send("🏓 Getting ping...");
    const latency = timestampMessage.createdTimestamp - message.createdTimestamp;
    await timestampMessage.edit(`🏓 Pong! Latency is ${latency}ms. API Latency is ${~~Naoko.bot.ws.ping}ms`);
  }

  get commandData(): CommandData {
    return {
      name: "ping",
      category: "UTILITY",
      usage: "ping",
      description: "Get api latency.",
    };
  }
}
