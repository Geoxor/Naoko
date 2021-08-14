import { defineCommand } from "../../types";

export default defineCommand({
  name: "invite",
  description: "Gives you an invite link for sakuria",
  requiresProcessing: false,
  execute: () => {
    return "Oh? You want to have me on your server? Here you go:\nhttps://discord.com/oauth2/authorize?client_id=870496144881492069&permissions=8&scope=bot";
  },
});
