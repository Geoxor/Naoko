import { msToFullTime } from "../../logic/logic.shaii";
import Shaii from "../../shaii/Shaii.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "uptime",
  category: "UTILITY",
  usage: "uptime",
  description: "Get api latency.",
  execute: async () => msToFullTime(Shaii.bot.uptime || 0),
});
