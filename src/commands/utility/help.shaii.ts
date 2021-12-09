import config from "../../shaii/Config.shaii";
import { Collection, GuildMember, Message, MessageEmbed } from "discord.js";
import { defineCommand, ICommand, IMessage } from "../../types";
import shaii from "../../shaii/Shaii.shaii";

const categories = ["ECONOMY", "FUN", "IMAGE_PROCESSORS", "MODERATION", "MUSIC", "UTILITY"];

// the keys are categories, the values are command helps
const categoryCommands = shaii.commands
    .reduce((acc: Collection<string, ICommand[]>, command: ICommand) => { acc.get(command.category).push(command); return acc; },
        categories.reduce((acc: Collection<string, ICommand[]>, cur: string) => { acc.set(cur, []); return acc; }, new Collection()));

export default defineCommand({
    name: "help",
    category: "UTILITY",
    aliases: ["h"],
    description: "The command you just did",
    requiresProcessing: false,
    execute(message: IMessage) {
        const categoryName = message.content.match(RegExp(`${config.prefix}${this.name}\s*(?<arg>.*)$`))!.groups!.arg!;
        const category = categoryCommands.get(categoryName.toUpperCase());

        const defaultReply = {
            embeds: [
                new MessageEmbed({
                    title: "List of Command Categories",
                    description: categories
                        .map(categoryName => `\`${config.prefix}${this.name} ${categoryName.toLowerCase()}\``)
                        .join("\n"),
                }),
            ],
        };

        return category ? createCategoryHelpMessage(message.member, categoryName.toUpperCase(), category) : defaultReply;
    },
});

function createCategoryHelpMessage(member: GuildMember, category: string, commands: ICommand[]): { embeds: MessageEmbed[] } {
    return {
        embeds: [
            new MessageEmbed({
                title: `Category: ${category.toLowerCase()}`,
                description: commands.map(command => {
                    // ✅ means the user can execute the command, ❌ means the user can't execute the command
                    const emoji = command.permission ? command.permissions.every(member.permissions.has) ? "✅" : "❌" : "✅";

                    return `> ${emoji} **${command.name}** - ${command.description}${'aliases' in command ? `\n  aliases: ${command.aliases.join(', ')}` : ''}`
                }).join("\n"),
                footer: { text: "✅ means you can execute the command, ❌ means you can't execute the command" },
                color: 'LUMINOUS_VIVID_PINK',
            })
        ],
    };
}
