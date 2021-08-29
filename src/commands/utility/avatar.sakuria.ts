import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a user or yours")
    .addUserOption((option) =>
      option.setName("user").setDescription("the user to fetch the avatar of").setRequired(false)
    ),
  execute: (interaction) => {
    const otherUser = interaction.options.getUser("user");
    const link =
      (otherUser ? otherUser.avatarURL() : interaction.user.avatarURL()) || interaction.user.defaultAvatarURL;
    return link + "?size=2048";
  },
});
