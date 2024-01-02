import { singleton } from "tsyringe";
import AbstractPipelineElement from "../../AbstractPipelineElement";
import { User } from "../../../naoko/Database";
import MessageCreatePayload from "../MessageCreatePayload";

@singleton()
export default class LoadDbUser extends AbstractPipelineElement {
  async execute(payload: MessageCreatePayload): Promise<boolean> {
    const message = payload.get("message");
    if (message.member) {
      payload.set("dbUser", await User.findOneOrCreate(message.member!));
    }

    return true;
  }
}
