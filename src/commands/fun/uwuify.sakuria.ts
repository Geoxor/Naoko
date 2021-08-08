import { uwufy } from "../../logic/logic.sakuria";
import { IMessage } from "../../types";

export default {
  name: "uwufy",
  description: "Transforms your sentence to uwu",
  requiresProcessing: false,
  execute: async (message: IMessage): Promise<string> => {
    if (message.args.length === 0) return "b-baka!! you need to give me s-something! uwu";
    return uwufy(message.args.join(" "));
  },
};
