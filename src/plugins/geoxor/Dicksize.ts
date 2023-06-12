import { Readable } from "stream";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import plugin from "../../decorators/plugin";
import AbstractCommand, { CommandData } from "../AbstractCommand";

class DickSizeCommand extends AbstractCommand {
  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const message = payload.get('message');

    const target = message.mentions.users?.first();
    if (target && message.author.id !== target.id) {
      return this.calculateDickSizeBattle(message.author.username, target.username)
    }

    return this.calculateSingleDickSize();
  }

  private calculateDickSizeBattle(challenger: string, target: string) {
    const dickSize = this.randomDickSize();
    const enemyDickSize = this.randomDickSize();

    let resultLastLine = "It's a draw!";
    if (dickSize !== enemyDickSize) {
      resultLastLine = `Winner: ${dickSize > enemyDickSize ? challenger : target}`;
    }

    if (dickSize + enemyDickSize > 1900) {
      return {
        content:
          `This battle of the dongs is too much to just say as is, so here's the brief:\n` +
          `${challenger}: ${dickSize}cm\n` +
          `${target}: ${enemyDickSize}cm` +
          `diff: ${Math.abs(dickSize - enemyDickSize)}cm` +
          `${resultLastLine}`,
        files: [
          {
            name: "battle.txt",
            attachment: Readable.from(
              `${challenger}'s long dong:\n 8${"=".repeat(dickSize)}D\n\n` +
              `${target}'s long dong:\n 8${"=".repeat(enemyDickSize)}D\n`
            ),
          },
        ],
      };
    }

    return `8${"=".repeat(dickSize)}D ${dickSize}cm ${challenger}\n` +
        `8${"=".repeat(enemyDickSize)}D ${enemyDickSize}cm ${target}\n` +
        `diff: ${Math.abs(dickSize - enemyDickSize)}cm\n` +
        `${resultLastLine}`;
  }

  private calculateSingleDickSize() {
    const dicksize = this.randomDickSize();
    const response = `8${"=".repeat(dicksize)}D ${dicksize}cm`;

    if (response.length > 2000) {
      return {
        content: "My goodness that's some schlong",
        files: [{ name: "magnum.txt", attachment: Readable.from(response) }],
      };
    }

    return response;
  }

  randomDickSize(): number {
    const x = Math.random();
    return Math.min(~~(1 / (1 - x) + 30 * x), 1_000_000);
  }

  get commandData(): CommandData {
    return {
      name: "dicksize",
      category: "FUN",
      usage: "[<@user>]",
      description: "Tells you your dicksize or battle against someone else's dicksize!",
    }
  }
}

@plugin()
class DickSize extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@geoxor/dick-size",
      version: "1.0.0",
      commands: [DickSizeCommand],
    }
  }
}
