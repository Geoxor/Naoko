import AbstractPipelineElement from "../../AbstractPipelineElement";
import MessageCreatePayload from "../MessageCreatePayload";
import { GEOXOR_GUILD_ID, GHOSTS_ROLE_ID } from "../../../constants";
import { logger } from "../../../naoko/Logger";
import { singleton } from "@triptyk/tsyringe";

@singleton()
export default class EnsureGhostRole extends AbstractPipelineElement {
  async execute(payload: MessageCreatePayload): Promise<boolean> {
    const message = payload.get('message');

    if (message.member && message.guild?.id === GEOXOR_GUILD_ID) {
      if (!message.member.roles.cache.has(GHOSTS_ROLE_ID)) {
        try {
          await message.member.roles.add(GHOSTS_ROLE_ID);
        } catch (error) {
          logger.error(`Couldn't give Ghosts role to the member: ${error}`);
        }
      }
    }

    return true;
  }
}
