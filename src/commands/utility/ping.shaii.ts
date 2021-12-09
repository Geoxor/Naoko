import Shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "ping",
  category: "UTILITY",
  aliases: [],
  description: "Get api latency.",
  requiresProcessing: false,
  execute: async (message) => {
    try {
      const timestampMessage = await message.channel.send("🏓 Getting ping...");
      timestampMessage.edit(
        `🏓 Pong! Latency is ${
          timestampMessage.createdTimestamp - message.createdTimestamp
        }ms. API Latency is ${~~Shaii.bot.ws.ping}ms`
      );
    } catch (error) {}
  },
});
