import { msToFullTime } from "../../logic/logic.shaii";
import Shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "uptime",
  category: "UTILITY",
  usage: "uptime",
  aliases: [],
  description: "Get api latency.",
  requiresProcessing: false,
  execute: async () => msToFullTime(Shaii.bot.uptime || 0),
});
