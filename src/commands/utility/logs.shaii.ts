import { markdown } from "../../logic/logic.shaii";
import logger from "../../shaii/Logger.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "logs",
  usage: "logs",
  category: "UTILITY",
  permissions: ["ADMINISTRATOR"],
  description: "Shows latest console logs.",
  execute: async message => markdown(logger.getLogHistory().substring(0, 1990)),
});
