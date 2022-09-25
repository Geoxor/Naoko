import Naoko from "../../naoko/Naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "ping",
  category: "UTILITY",
  usage: "ping",
  description: "Get api latency.",
  execute: async (message) => {
    try {
      const timestampMessage = await message.channel.send("🏓 Getting ping...");
      timestampMessage.edit(
        `🏓 Pong! Latency is ${timestampMessage.createdTimestamp - message.createdTimestamp}ms. API Latency is ${~~Naoko.bot
          .ws.ping}ms`
      );
    } catch (error) { }
  },
});
