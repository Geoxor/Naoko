import { IMessage } from "../../types";

export default {
  name: "say",
  description: "Says what you tell it",
  requiresProcessing: false,
  execute: (message: IMessage): string => {
    if (message.mentions.everyone) return "you can't make me tag everyone idiot";
    message.delete();
    return message.args.join(" ");
  },
};
