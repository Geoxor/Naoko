import { ChannelType } from 'discord.js';
import { definePlugin } from "../naoko/Plugin";

export default definePlugin({
  name: "@geoxor/tunnel-tracker",
  version: "1.0.0",
  events: {
    messageCreate: (message) => {
      if (
        message.channel.type == ChannelType.PublicThread &&
        message.channel.id === "923126477610962964" &&
        message.attachments.size !== 0
      ) {
        message.channel.setName(`tunnel ${parseFloat(message.channel.name.replace(/[^0-9\.]+/g, "")) + 1}`);
        return;
      }
    },
  },
});
