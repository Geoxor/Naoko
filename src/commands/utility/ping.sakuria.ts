import Sakuria from "../../sakuria/Sakuria.sakuria";
import { CommandType, defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("ping").setDescription("Get Sakuria's and API latencies"),
  type: CommandType.UTILITY,
  execute: async (interaction) => {
    if (!interaction.channel) return "Can't test latency here";
    const startMessage = await interaction.channel.send("🏓 Getting ping...");
    const { createdTimestamp: endTime } = startMessage;
    const { createdTimestamp: startTime } = interaction;
    startMessage.delete();
    return `🏓 Pong! round-trip is ${endTime - startTime}ms. websocket latency is ${~~Sakuria.bot.ws.ping}ms`;
  },
});
