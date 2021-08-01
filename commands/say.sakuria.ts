import { IMessage } from "../types";

export const command = {
  name: "say",
  requiresProcessing: false,
  execute: (message: IMessage): string => {
    message.delete();
    return message.args.join(' ');
  },
};
