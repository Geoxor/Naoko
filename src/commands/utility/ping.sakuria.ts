import Sakuria from "../../sakuria/Sakuria.sakuria";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "ping",
  description: "Get api latency.",
  requiresProcessing: false,
  execute: async (message) => {
    const timestampMessage = await message.channel.send("🏓 Getting ping...");
    timestampMessage.edit(
      `🏓 Pong! Latency is ${
        (timestampMessage.createdTimestamp - message.createdTimestamp)
      }ms. API Latency is ${~~Sakuria.bot.ws.ping}ms`
    );
  },
});
