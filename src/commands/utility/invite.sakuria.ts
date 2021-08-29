import { defineCommand } from "../../types";
import { SlashCommandBuilder } from "@discordjs/builders";

export default defineCommand({
  data: new SlashCommandBuilder().setName("invite").setDescription("Gives you an invite link for sakuria"),
  execute: async () =>
    "Oh? You want to have me on your server? Here you go:\nhttps://discord.com/oauth2/authorize?client_id=870496144881492069&scope=bot+applications.commands",
});
