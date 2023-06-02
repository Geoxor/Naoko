import Discord, { ChannelType } from 'discord.js';
import AbstractPlugin, { PluginData } from '../AbstractPlugin';
import plugin from '../../decorators/plugin';

@plugin()
class TunnerTracker extends AbstractPlugin {
  private static TUNNER_CHANNEL_ID = "923126477610962964";

  public get pluginData(): PluginData {
    return {
      name: "@geoxor/tunnel-tracker",
      version: "1.0.0",
      enabled: false,
      events: {
        messageCreate: this.messageCreate,
      },
    }
  }

  private async messageCreate(message: Discord.Message) {
    if (
      message.channel.type == ChannelType.PublicThread &&
      message.channel.id === TunnerTracker.TUNNER_CHANNEL_ID &&
      message.attachments.size !== 0
    ) {
      await message.channel.setName(`tunnel ${parseFloat(message.channel.name.replace(/[^0-9\.]+/g, "")) + 1}`);
    }
  }
}

