import Discord, { APIErrors } from "discord.js";
import { definePlugin } from "../naoko/Plugin";
import { defineCommand } from "../types";

export default definePlugin({
  name: "@otiskujawa/xornet",
  version: "1.0.0",
  command: defineCommand({
    name: "wtfisxornet",
    aliases: ["xornet", "wtfxornet"],
    category: "UTILITY",
    usage: "wtfisxornet <reporter/links>",
    description: "Create an embed with information about Xornet",
    execute: async (message) => {
      const embed = new Discord.MessageEmbed();
      embed
        .setFooter(
          "Used by " + message.author.username + ". Plugin made by otiskujawa.",
          message.author.avatarURL() || message.author.defaultAvatarURL
        )
        .setColor("#00abff");

      if (message.args[0] === "reporter") {
        // reporter howto
        embed
          .setTitle("How to install xornet-reporter/How to add machine to xornet")
          .setURL("https://github.com/xornet-cloud/Reporter")
          .setDescription(
            "If you have xornet.cloud account, you can add your machine by installing xornet-reporter. \n\n\n\n "
          )
          .addField(
            "To install Reporter on Linux, open terminal and run:",
            "curl https://raw.githubusercontent.com/xornet-cloud/Reporter/main/scripts/install.sh | sudo bash \n\n "
          )
          .addField(
            "To install Reporter on WIndows, open powershell and run:",
            "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser\n iwr -useb get.scoop.sh | iex\n scoop install https://raw.githubusercontent.com/xornet-cloud/Reporter/main/scripts/xornet-reporter.json"
          )
          .addField(
            "To get token:",
            'Open web page https://xornet.cloud/ or open client and click "Add machine". \n Copy token and paste it into installer.'
          )
          .setImage("https://cdn.discordapp.com/attachments/762063073807958029/967864873453240410/unknown.png"); //add add machine gif
      } else if (message.args[0] === "links") {
        // links
        embed
          .setThumbnail("https://cdn.discordapp.com/attachments/762063073807958029/967861605306097785/unknown.png")
          .addField("Tutorials:", "(todo)")
          .addField("Page:", "https://xornet.cloud/")
          .addField("Status:", "https://xornet.statuspage.io/")
          .addField("Github:", "https://github.com/xornet-cloud")
          .addField("Client:", "https://github.com/xornet-cloud/Client")
          .addField("Reporter:", "https://github.com/xornet-cloud/Reporter")
          .addField("Backend:", "https://github.com/xornet-cloud/Backend");
      } else {
        // default
        embed
          .setTitle("Xornet-cloud")
          .setURL("https://github.com/xornet-cloud/Reporter")
          .setDescription(
            "Xornet is a management dashboard for people to easily view & control their servers from anywhere in the world!"
          )
          .addField("Web page", "https://xornet.cloud/")
          .addField("GitHub", "https://github.com/xornet-cloud/")
          .setImage("https://cdn.discordapp.com/attachments/762063073807958029/967819062006657044/unknown.png");
      }
      return { embeds: [embed] };
    },
  }),
});
