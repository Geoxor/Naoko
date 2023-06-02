import AbstractCommand, { CommandData } from '../AbstractCommand';
import { CommandExecuteResponse, IMessage } from "../../types";
import { parseBufferFromMessage } from '../../logic/logic';
import { fileTypeFromBuffer } from 'file-type';
import Discord from 'discord.js';
import { autocrop, deepfry, expert, fisheye, flip, fuckyou, grayscale, haah, invert, pat, scale, shy, squish, stretch, trolley, vignette, wasted } from '../../logic/imageProcessors';
import { commands3D } from "../../logic/3DRenderer";
import command from '../../decorators/command';

// TODO: Register aliase for all functions and then dynamicly call the ImageProcessingService
abstract class AbstractGenericImageProcessors extends AbstractCommand {
  async execute(message: IMessage): Promise<CommandExecuteResponse> {
    const buffer = await parseBufferFromMessage(message);
    const resultBuffer = await this.doProcess(buffer, message.args.join(" "));
    const mimetype = await fileTypeFromBuffer(resultBuffer);
    const attachment = new Discord.AttachmentBuilder(resultBuffer, { name: `shit.${mimetype?.ext}` });
    return { files: [attachment] };
  }

  get commandData(): CommandData {
    const commandName = this.getProcessorName();
    return {
      name: commandName,
      usage: `${commandName} <image | url | reply | user_id>`,
      category: "IMAGE_PROCESSORS",
      description: `${commandName} an image`,
      requiresProcessing: true,
    };
  }

  abstract getProcessorName(): string;
  abstract doProcess(buffer: Buffer, ...args: any): Buffer | Promise<Buffer>;
}

// ImageProcessing
@command()
class AutoCrop extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'autocrop';
  }
  doProcess = autocrop;
}

@command()
class Stretch extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'stretch';
  }
  doProcess = stretch;
}

@command()
class Trolley extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'trolley';
  }
  doProcess = trolley;
}

@command()
class Invert extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'invert';
  }
  doProcess = invert;
}

@command()
class FishEye extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'fisheye';
  }
  doProcess = fisheye;
}

@command()
class FuckYou extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'fuckyou';
  }
  doProcess = fuckyou;
}

@command()
class Shy extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'shy';
  }
  doProcess = shy;
}

@command()
class Squish extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'squish';
  }
  doProcess = squish;
}

@command()
class GrayScale extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'grayscale';
  }
  doProcess = grayscale;
}

@command()
class Wasted extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'wasted';
  }
  doProcess = wasted;
}

@command()
class Vignette extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'vignette';
  }
  doProcess = vignette;
}

@command()
class Deepfry extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'deepfry';
  }
  doProcess = deepfry;
}

@command()
class Pat extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'pat';
  }
  doProcess = pat;
}

@command()
class Haah extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'haah';
  }
  doProcess = haah;
}

@command()
class Expert extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'expert';
  }
  doProcess = expert;
}

@command()
class Flip extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'flip';
  }
  doProcess = flip;
}

@command()
class Scale extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'scale';
  }
  doProcess = scale;
}

// 3dRendering
@command()
class Prism extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'prism';
  }
  doProcess = commands3D.prism;
}

@command()
class Wtf extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'wtf';
  }
  doProcess = commands3D.wtf;
}

@command()
class Cube extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'cube';
  }
  doProcess = commands3D.cube;
}

@command()
class Donut extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'donut';
  }
  doProcess = commands3D.donut;
}

@command()
class Sphere extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'sphere';
  }
  doProcess = commands3D.sphere;
}

@command()
class Cylinder extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'cylinder';
  }
  doProcess = commands3D.cylinder;
}

@command()
class Text extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'text';
  }
  doProcess = commands3D.text;
}

@command()
class Cart extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'cart';
  }
  doProcess = commands3D.cart;
}

@command()
class Car extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'car';
  }
  doProcess = commands3D.car;
}

@command()
class Miku extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'miku';
  }
  doProcess = commands3D.miku;
}

@command()
class Amogus extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'amogus';
  }
  doProcess = commands3D.amogus;
}

@command()
class TrackMania extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'trackmania';
  }
  doProcess = commands3D.trackmania;
}

@command()
class Troll extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'troll';
  }
  doProcess = commands3D.troll;
}

@command()
class TrollCart extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'trollcart';
  }
  doProcess = commands3D.trollcart;
}

@command()
class TrollMask extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'trollmask';
  }
  doProcess = commands3D.trollmask;
}

@command()
class Geoxor extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'geoxor';
  }
  doProcess = commands3D.geoxor;
}

@command()
class Helicopter extends AbstractGenericImageProcessors {
  getProcessorName(): string {
    return 'helicoptor';
  }
  doProcess = commands3D.helicopter;
}
