import { defineCommand } from "../../types";
import Discord from "discord.js";

const DOWNVOTE_EMOJI = "823666555123662888";
const UPVOTE_EMOJI = "834402501397577729";
const VOTE_TIME = 30000;

const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
  console.log(reaction);

  return reaction.emoji.id === DOWNVOTE_EMOJI || reaction.emoji.id === UPVOTE_EMOJI;
};

export default defineCommand({
  name: "vote",
  description: "Creates a vote",
  requiresProcessing: false,
  execute: async (message) => {
    const voteContext = message.args.join(" ");

    const embed = new Discord.MessageEmbed()
      .setColor("#ff00b6")
      .setTitle(voteContext)
      .setAuthor(
        `${message.author.username} asks...`,
        message.author.avatarURL() || message.author.defaultAvatarURL
      )
      .setFooter(`Vote with the reactions bellow, results in ${VOTE_TIME / 1000} seconds`);

    const vote = await message.channel.send({ embeds: [embed] });
    vote.react(DOWNVOTE_EMOJI);
    vote.react(UPVOTE_EMOJI);

    const collector = vote.createReactionCollector({ filter, time: VOTE_TIME });

    collector.on("end", (collected) => {
      const downvotes = collected.get(DOWNVOTE_EMOJI);
      const upvotes = collected.get(UPVOTE_EMOJI);

      if (downvotes && upvotes) {
        const winner = downvotes.count > upvotes.count ? downvotes : upvotes;

        if (downvotes.count + upvotes.count === 2)
          return vote.reply("Vote cancelled since no one decided to vote");
        if (downvotes.count === upvotes.count) return vote.reply("Votes tied so neither of them won");

        return vote.reply(`The majority voted ${winner.emoji} with ${winner.count - 1} votes`);
      }
    });
  },
});
