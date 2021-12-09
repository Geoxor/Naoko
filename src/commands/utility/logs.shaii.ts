import logger from "../../shaii/Logger.shaii";
import { defineCommand } from "../../types";
import { markdown } from "../../logic/logic.shaii";

export default defineCommand({
  name: "logs",
  aliases: [],
  permissions: ["ADMINISTRATOR"],
  description: "Shows latest console logs.",
  requiresProcessing: false,
  execute: async (message) => {
    return markdown(logger.shaii.getLogHistory().substr(0, 1990));
  },
});
