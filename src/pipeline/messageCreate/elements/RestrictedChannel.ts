import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { MOD_ROLE_ID, ADMIN_ROLE_ID, GEOXOR_GENERAL_CHANNEL_ID, GEOXOR_DEV_ROLE_ID } from "../../../constants";
import { singleton } from "tsyringe";

@singleton()
export default class RestrictedChannel extends AbstractPipelineElement {
  private readonly RESTRICTED_CHANNELS = [GEOXOR_GENERAL_CHANNEL_ID];
  private readonly WHITELISTED_ROLES = [MOD_ROLE_ID, ADMIN_ROLE_ID, GEOXOR_DEV_ROLE_ID];

  execute(payload: MessageCreatePayload) {
    const message = payload.get("message");

    // Do not allow Commands in RestrictedChannels
    // Not Geoxor's guild or in a restricted channel -> Continue
    if (!message.member || !this.RESTRICTED_CHANNELS.includes(message.channel.id)) {
      return true;
    }

    // Check if user is a mod, admin or has admin perms if not, return
    if (
      message.member.roles.cache.some((role) => this.WHITELISTED_ROLES.includes(role.id)) ||
      message.member.permissions.has("Administrator")
    ) {
      return true;
    }
    return `"${message.member.displayName}" tried to execute a command in a restricted channel`;
  }
}
