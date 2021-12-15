import { IMessage } from "../types";

export function isDiscordInvite(message: IMessage) {
  return message.content.includes("discord.gg");
}
