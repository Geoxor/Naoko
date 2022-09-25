import { msToFullTime } from "../../logic/logic";
import Naoko from "../../naoko/Naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "uptime",
  category: "UTILITY",
  usage: "uptime",
  description: "Get api latency.",
  execute: async () => msToFullTime(Naoko.bot.uptime || 0),
});
