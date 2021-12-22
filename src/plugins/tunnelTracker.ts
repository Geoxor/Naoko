import { Message } from "discord.js";

export default function (message: Message) {
  if (
    message.channel.type == "GUILD_PUBLIC_THREAD" &&
    message.channel.id === "923126477610962964" &&
    message.attachments.size !== 0
  ) {
    return message.channel.setName(`tunnel ${parseFloat(message.channel.name.replace(/[^0-9\.]+/g, "")) + 1}`);
  }
}
