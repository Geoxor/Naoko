import { IMessage } from "../types";

export const command = {
  name: "say",
  description: "Says what you tell it",
  requiresProcessing: false,
  execute: (message: IMessage): string => {
    message.delete();
    return message.args.join(" ");
  },
};
