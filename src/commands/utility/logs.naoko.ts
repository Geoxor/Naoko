import { markdown } from "../../logic/logic.naoko";
import logger from "../../naoko/Logger.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "logs",
  usage: "logs",
  category: "UTILITY",
  permissions: ["ADMINISTRATOR"],
  description: "Shows latest console logs.",
  execute: async (message) => markdown(logger.getLogHistory().substring(0, 1990)),
});
