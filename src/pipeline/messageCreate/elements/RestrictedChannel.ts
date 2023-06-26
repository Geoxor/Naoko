import { Awaitable } from "discord.js";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { MOD_ROLE_ID, ADMIN_ROLE_ID, RESTRICT_BYPASS_ROLE_ID, GEOXOR_GENERAL_CHANNEL_ID } from "../../../constants";
import { singleton } from "@triptyk/tsyringe";

@singleton()
export default class RestrictedChannel extends AbstractPipelineElement {
  private readonly RESTRICTED_CHANNELS = [GEOXOR_GENERAL_CHANNEL_ID];

  execute(payload: MessageCreatePayload): Awaitable<boolean> {
    const message = payload.get("message");

    // Do not allow Commands in RestrictedChannels
    // Not Geoxor's guild or in a restricted channel -> Continue
    if (!message.member || !this.RESTRICTED_CHANNELS.includes(message.channel.id)) {
      return true;
    }

    // Check if user is a mod, admin has bypass role or admin perms if not, return
    if (
      message.member.roles.cache.some((role) => role.id === MOD_ROLE_ID || role.id === ADMIN_ROLE_ID || role.id === RESTRICT_BYPASS_ROLE_ID) ||
      message.member.permissions.has("Administrator")
    ) {
      return true;
    }
    return false;
  }
}
