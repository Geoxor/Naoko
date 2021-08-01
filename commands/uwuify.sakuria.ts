import { uwuify } from "../logic/logic.sakuria";
import { IMessage } from "../types";

export const command = {
    name: "uwuify",
    requiresProcessing: false,
    execute: async (message: IMessage): Promise<string> => {
        if (message.args.length === 0) return "b-baka!! you need to give me s-something! uwu"
        return uwuify(message.args.join(" "));
    },
}