import { IMessage } from "../types";

export const command = {
  name: "clear",
  requiresProcessing: false,
  execute: (message: IMessage): string => {
    // blukDelete can't be used in direct message channel.
    if (message.channel.type == "dm") return `You can't use clear in a DM channel!`;

    let count = parseInt(message.args[0]) + 1;
    // Will return if count is not a string.
    if (isNaN(count)) return `⚠️ when not number`

    message.channel.bulkDelete(count)
    return `Cleared ${count} messages!`;
  },
};