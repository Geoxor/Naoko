import { GuildMember, PartialGuildMember } from "discord.js";
import plugin from "../../decorators/plugin";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { User } from "../../naoko/Database.js";
import Logger from "../../naoko/Logger";

@plugin()
class MemorizeRoles extends AbstractPlugin {
  constructor(private logger: Logger) {
    super();
  }

  public get pluginData(): PluginData {
    return {
      name: "@geoxor/memorize-roles",
      version: "1.0.0",
      events: {
        guildMemberRemove: this.saveOldRoles,
        guildMemberAdd: this.applyOldRoles,
      },
    };
  }

  private async saveOldRoles(member: GuildMember | PartialGuildMember) {
    if (member.user.bot) {
      return;
    }

    const user = await User.findOneOrCreate(member);
    console.log(member.roles.cache.keys());
    await user.updateRoles(Array.from(member.roles.cache.keys()));
  }

  private async applyOldRoles(member: GuildMember) {
    const user = await User.findOneOrCreate(member);
    const addedRoles: string[] = [];
    for (const roleId of user.roles) {
      // TODO: Should we also check if the role has moderation permissions and not give them those roles?
      const role = member.guild.roles.cache.get(roleId);
      if (role && role.name !== "@everyone") {
        try {
          await member.roles.add(role);
          addedRoles.push(role.name);
        } catch (error) {
          console.log(`Could not give member old role: "${role.name}"`, error);
        }
      }
    }

    if (addedRoles.length > 0) {
      this.logger.print(`Added ${addedRoles.length} old roles to ${member.displayName}. Roles: "${addedRoles.join(", ")}"`);
    }
  }
}
