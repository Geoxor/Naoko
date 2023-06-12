import { Readable } from "stream";
import plugin from "../../decorators/plugin";
import MessageCreatePayload from "../../pipeline/messageCreate/MessageCreatePayload";
import TextProcessingService from "../../service/TextProcessingService";
import { CommandExecuteResponse } from "../../types";
import AbstractPlugin, { PluginData } from "../AbstractPlugin";
import { singleton } from "@triptyk/tsyringe";
import AbstractCommand, { CommandData } from "../AbstractCommand";

@singleton()
class SingleTextProcessors extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  public execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const commandName = payload.get('commandName');
    const args = payload.get('args');
    if (args.length === 0) {
      return this.getMissingSenteceText(commandName);
    }

    const response = this.transformText(args.join(' '), commandName);

    if (response.length > 2000) {
      return {
        content: "Bro the result is too big gonna put it in a file",
        files: [{ name: `shit.${commandName === 'brainfuck' ? 'bf' : 'txt'}`, attachment: Readable.from(response) }],
      };
    }
    return response;
  }

  private transformText(sentence: string, commandName: string): string {
    switch (commandName) {
      case 'uwufy':
        return this.textProcessingService.uwufy(sentence);
      case 'brainfuck':
        return this.textProcessingService.brainfuck(sentence);
      case 'britify':
        return this.textProcessingService.britify(sentence);
      case 'spongify':
        return this.textProcessingService.spongify(sentence);
      default:
        throw new Error(`No textProcessor defined for ${commandName}`);
    }
  }

  private getMissingSenteceText(commandName: string): string {
    switch (commandName) {
      case 'uwufy':
        return "b-baka!! you need to give me s-something! uwu";
      case 'brainfuck':
        return 'What to you want to translate?';
      case 'britify':
        return "Tell me whad u wan' in bri'ish cunt?";
      case 'spongify':
        return 'What do you want to SpOnGiFy?';
      default:
        throw new Error(`No missing sentence defined for ${commandName}`);
    }
  }

  public get commandData(): CommandData {
    return {
      name: "uwufy",
      aliases: ['brainfuck', 'britify', 'spongify'],
      category: "TEXT_PROCESSORS",
      usage: "<sentence>...",
      description: "Transforms your sentence",
    }
  }
}

@singleton()
class Textify extends AbstractCommand {
  constructor(
    private textProcessingService: TextProcessingService,
  ) {
    super();
  }

  execute(payload: MessageCreatePayload): CommandExecuteResponse | Promise<CommandExecuteResponse> {
    const args = payload.get('args');

    const pipeline = [];
    while (true) {
      const arg = args.shift() || '';
      if (this.textProcessingService.isTextProcessor(arg)) {
        pipeline.push(arg);
      } else {
        args.unshift(arg);
        break;
      }
    }

    if (pipeline.length === 0) return 'Pipeline cannot be empty';
    if (pipeline.length > 10) return "Pipeline can't be longer than 10 iterators";

    const userSentence = args.join(' ');
    if (userSentence.length === 0) return "What do you want to textify?";

    return this.textProcessingService.textify(pipeline, userSentence);
  }

  get commandData(): CommandData {
    return {
      name: "textify",
      usage: "<processor-name>... <text>",
      category: "TEXT_PROCESSORS",
      description: "Transform a sentence with a pipeline",
      requiresProcessing: true,
    }
  }
}

@plugin()
class TextProcessors extends AbstractPlugin {
  public get pluginData(): PluginData {
    return {
      name: "@geoxor/text-processors",
      version: "1.0.0",
      commands: [SingleTextProcessors, Textify],
    };
  }
}
