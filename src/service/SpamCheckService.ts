import { singleton } from "tsyringe";

type SpamCheckResult = {
  isSpam: boolean;
  failedCheck: string | null;
};

@singleton()
export default class SpamCheckService {
  private checkFunctions = [this.isDiscordInvite, this.isFreeNitro];

  public checkForSpam(content: string): SpamCheckResult {
    for (const checkFunction of this.checkFunctions) {
      if (checkFunction(content)) {
        return { isSpam: true, failedCheck: checkFunction.name };
      }
    }

    return { isSpam: false, failedCheck: null };
  }

  private isDiscordInvite(content: string) {
    return (
      content.includes("discord.gg") &&
      !(content.includes("discord.gg/geoxor") && (content.match(/discord.gg/g) || []).length == 1)
    );
  }

  private isFreeNitro(content: string) {
    return content.includes("nitro") && content.includes("http");
  }
}
