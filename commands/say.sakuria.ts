import { IMessage } from "../types";

export const command = {
  name: "say",
  requiresProcessing: false,
  execute: (message: IMessage): string => {
    return message.args.join('');
  },
};
