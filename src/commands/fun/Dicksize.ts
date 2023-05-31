import { Readable } from "stream";
import { CommandExecuteResponse, IMessage } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';

@command()
class DickSize extends AbstractCommand {
  execute(message: IMessage): CommandExecuteResponse | Promise<CommandExecuteResponse> {
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

    return `
        8${"=".repeat(dickSize)}D ${dickSize}cm ${challenger}
        8${"=".repeat(enemyDickSize)}D ${enemyDickSize}cm ${target}
        diff: ${Math.abs(dickSize - enemyDickSize)}cm
        ${resultLastLine}
      `;
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
      usage: "dicksize ?<@user | user_id>",
      description: "Tells you your dicksize or battle against someone else's dicksize!",
    }
  }
}
