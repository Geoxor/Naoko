import Discord from "discord.js";
import { DOWNVOTE_EMOJI_ID, UPVOTE_EMOJI_ID, VOTE_TIME } from "../../constants";
import { defineCommand } from "../../types";

const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
  return reaction.emoji.id === DOWNVOTE_EMOJI_ID || reaction.emoji.id === UPVOTE_EMOJI_ID;
};

export default defineCommand({
  name: "vote",
  category: "FUN",
  usage: "vote <topic>",
  description: "Creates a vote",
  execute: async message => {
    const voteContext = message.args.join(" ").trim();

    if (!voteContext) return "Please write what your vote is about";

    const embed = new Discord.MessageEmbed()
      .setColor("#ff00b6")
      .setTitle(voteContext)
      .setAuthor(`${message.author.username} asks...`, message.author.avatarURL() || message.author.defaultAvatarURL)
      .setFooter(`Vote with the reactions bellow, results in ${VOTE_TIME / 1000} seconds`);

    try {
      var vote = await message.channel.send({ embeds: [embed] });
      vote.react(DOWNVOTE_EMOJI_ID);
      vote.react(UPVOTE_EMOJI_ID);
    } catch (error) {
      return;
    }

    const collector = vote.createReactionCollector({ time: VOTE_TIME });

    collector.on("collect", (reaction, user) => filter(reaction, user) || reaction.remove());

    collector.on("end", collected => {
      const downvotes = collected.get(DOWNVOTE_EMOJI_ID);
      const upvotes = collected.get(UPVOTE_EMOJI_ID);

      if (downvotes && upvotes) {
        const winner = downvotes.count > upvotes.count ? downvotes : upvotes;

        if (downvotes.count + upvotes.count === 2) return vote.reply("Vote cancelled since no one decided to vote");
        if (downvotes.count === upvotes.count) return vote.reply("Votes tied so neither of them won");

        return vote.reply(`The majority voted ${winner.emoji} with ${winner.count - 1} votes`);
      }
    });
  },
});
