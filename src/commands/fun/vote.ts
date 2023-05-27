import Discord from "discord.js";
import { DOWNVOTE_EMOJI_ID, GEOXOR_GUILD_ID, UPVOTE_EMOJI_ID } from "../../constants";
import { defineCommand } from "../../types";

const DOWNVOTE_EMOJI_ALT = '⬇️';
const UPVOTE_EMOJI_ALT = '⬆️';

const VOTE_TIME = 30000;

const filter = (reaction: Discord.MessageReaction, isGeoxorGuild: boolean) => {
  if (isGeoxorGuild) {
    return reaction.emoji.id === DOWNVOTE_EMOJI_ID || reaction.emoji.id === UPVOTE_EMOJI_ID;
  }
  return reaction.emoji.name === DOWNVOTE_EMOJI_ALT || reaction.emoji.name === UPVOTE_EMOJI_ALT;
};

export default defineCommand({
  name: "vote",
  category: "FUN",
  usage: "vote <topic>",
  description: "Creates a vote",
  execute: async (message) => {
    const voteContext = message.args.join(" ").trim();

    if (!voteContext) return "Please write what your vote is about";

    const embed = new Discord.EmbedBuilder()
      .setColor("#ff00b6")
      .setTitle(voteContext)
      .setAuthor({ name: `${message.author.username} asks...`, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setFooter({ text: `Vote with the reactions bellow, results in ${VOTE_TIME / 1000} seconds` });

    // Check if were in the Geoxor guild, Emojis missing in other guild
    const isGeoxorGuild = message.guild?.id === GEOXOR_GUILD_ID;

    const vote = await message.channel.send({ embeds: [embed] });
    const collector = vote.createReactionCollector({ time: VOTE_TIME });
    if (isGeoxorGuild) {
      await Promise.all([
        vote.react(DOWNVOTE_EMOJI_ID),
        vote.react(UPVOTE_EMOJI_ID),
      ]);
    } else {
      await Promise.all([
        vote.react(DOWNVOTE_EMOJI_ALT),
        vote.react(UPVOTE_EMOJI_ALT),
      ]);
    }

    collector.on("collect", (reaction) => filter(reaction, isGeoxorGuild) || reaction.remove());

    collector.on("end", (collected) => {
      let downvotes, upvotes;
      if (isGeoxorGuild) {
        downvotes = collected.get(DOWNVOTE_EMOJI_ID);
        upvotes = collected.get(UPVOTE_EMOJI_ID);
      } else {
        downvotes = collected.get(DOWNVOTE_EMOJI_ALT);
        upvotes = collected.get(UPVOTE_EMOJI_ALT);
      }

      if (downvotes && upvotes) {
        const winner = downvotes.count > upvotes.count ? downvotes : upvotes;

        if (downvotes.count + upvotes.count === 2) return vote.reply("Vote cancelled since no one decided to vote");
        if (downvotes.count === upvotes.count) return vote.reply("Votes tied so neither of them won");

        return vote.reply(`The majority voted ${winner.emoji} with ${winner.count - 1} votes`);
      }
    });
  },
});
