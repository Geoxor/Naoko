import { getShipName } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";
import Discord from "discord.js";

export default defineCommand({
  name: "match",
  category: "FUN",
  usage: "match <@user | user_id> ?<@user | user_id>",
  aliases: [],
  description: "See how much you and another user match!",
  requiresProcessing: false,
  execute: (message) => {
    if (!message.mentions.members?.size) return "Tag the person you wanna match with!";

    let matcher: Discord.User;
    let matchee: Discord.User;

    // Check if they mentions 2 users or not
    if (message.mentions.users?.size >= 2) {
      matcher = message.mentions.users.at(0)!;
      matchee = message.mentions.users.at(1)!;
    } else {
      matcher = message.author;
      matchee = message.mentions.users.first()!;
    }

    const matcherValue = parseFloat(matcher.id);
    const matcheeValue = parseFloat(matchee.id as string);
    const matchValue = (matcherValue + matcheeValue) % 22;
    const matchCalculation = ((22 - matchValue) / 22) * 100;

    const shipName = getShipName(matcher.username, matchee.username);

    const perfectMatchString = `You perfectly match ${~~matchCalculation}% ${shipName}`;
    const matchString = `You match ${~~matchCalculation}% ${shipName}`;
    return matchCalculation == 100 ? perfectMatchString : matchString;
  },
});
