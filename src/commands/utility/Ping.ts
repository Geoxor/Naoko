import Naoko from "../../naoko/Naoko";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";

@command()
class Ping extends AbstractCommand {
  async execute(payload: MessageCreatePayload): Promise<CommandExecuteResponse> {
    const message = payload.get('message');
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
