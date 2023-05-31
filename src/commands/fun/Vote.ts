import Discord from "discord.js";
import { GEOXOR_GUILD_ID } from "../../constants";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class Vote extends AbstractCommand {
  private static VOTE_TIME = 30000;

  private static DOWNVOTE_EMOJI_ID = "823666555123662888";
  private static UPVOTE_EMOJI_ID = "834402501397577729";

  private static DOWNVOTE_EMOJI_ALT = '⬇️';
  private static UPVOTE_EMOJI_ALT = '⬆️';

  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    const voteContext = message.args.join(" ").trim();

    if (!voteContext) return "Please write what your vote is about";

    const embed = new Discord.EmbedBuilder()
      .setColor("#ff00b6")
      .setTitle(voteContext)
      .setAuthor({ name: `${message.author.username} asks...`, iconURL: message.author.avatarURL() || message.author.defaultAvatarURL })
      .setFooter({ text: `Vote with the reactions bellow, results in ${Vote.VOTE_TIME / 1000} seconds` });

    // Check if were in the Geoxor guild, Emojis missing in other guild
    const isGeoxorGuild = message.guild?.id === GEOXOR_GUILD_ID;

    const vote = await message.channel.send({ embeds: [embed] });
    const collector = vote.createReactionCollector({ time: Vote.VOTE_TIME });
    if (isGeoxorGuild) {
      await Promise.all([
        vote.react(Vote.DOWNVOTE_EMOJI_ID),
        vote.react(Vote.UPVOTE_EMOJI_ID),
      ]);
    } else {
      await Promise.all([
        vote.react(Vote.DOWNVOTE_EMOJI_ALT),
        vote.react(Vote.UPVOTE_EMOJI_ALT),
      ]);
    }

    collector.on("collect", (reaction) => this.reactionFilter(reaction, isGeoxorGuild) || reaction.remove());

    collector.on("end", (collected) => {
      let downvotes, upvotes;
      if (isGeoxorGuild) {
        downvotes = collected.get(Vote.DOWNVOTE_EMOJI_ID);
        upvotes = collected.get(Vote.UPVOTE_EMOJI_ID);
      } else {
        downvotes = collected.get(Vote.DOWNVOTE_EMOJI_ALT);
        upvotes = collected.get(Vote.UPVOTE_EMOJI_ALT);
      }

      if (downvotes && upvotes) {
        const winner = downvotes.count > upvotes.count ? downvotes : upvotes;

        if (downvotes.count + upvotes.count === 2) return vote.reply("Vote cancelled since no one decided to vote");
        if (downvotes.count === upvotes.count) return vote.reply("Votes tied so neither of them won");

        return vote.reply(`The majority voted ${winner.emoji} with ${winner.count - 1} votes`);
      }
    });
  }

  private reactionFilter(reaction: Discord.MessageReaction, isGeoxorGuild: boolean): boolean {
    if (isGeoxorGuild) {
      return reaction.emoji.id === Vote.DOWNVOTE_EMOJI_ID || reaction.emoji.id === Vote.UPVOTE_EMOJI_ID;
    }
    return reaction.emoji.name === Vote.DOWNVOTE_EMOJI_ALT || reaction.emoji.name === Vote.UPVOTE_EMOJI_ALT;
  }

  get commandData(): CommandData {
    return {
      name: "vote",
      category: "FUN",
      usage: "vote <topic>",
      description: "Creates a vote",
    }
  }
}
