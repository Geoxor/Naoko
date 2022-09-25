import { msToFullTime } from "../../logic/logic.naoko";
import Naoko from "../../naoko/Naoko.naoko";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "uptime",
  category: "UTILITY",
  usage: "uptime",
  description: "Get api latency.",
  execute: async () => msToFullTime(Naoko.bot.uptime || 0),
});
