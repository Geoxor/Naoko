import { IMessage } from "../types";

export function isDiscordInvite(message: IMessage) {
  return (
    message.content.includes("discord.gg") &&
    !(message.content.includes("discord.gg/geoxor") && (message.content.match(/discord.gg/g) || []).length == 1)
  );
}
