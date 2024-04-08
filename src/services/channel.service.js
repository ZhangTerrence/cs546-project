import ChannelRepository from "../models/channel.js";
import { InternalServerError, NotFoundError } from "../utils/errors.js";

export default class ChannelService {
  /**
   * @description Gets a channel by its id.
   * @param {string} userId The given channel id.
   * @returns Channel.
   * @throws NotFoundError If the channel is not found.
   */
  static getChannelById = async (channelId) => {
    const channel = await ChannelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundError(
        404,
        `channelId: ${channelId}`,
        "Channel not found."
      );
    }

    return channel;
  };

  /**
   * @description Creates the general channel for a server.
   * @param {string} serverId The given server id.
   * @returns Channel.
   * @throws InternalServerError If it fails to create the general channel.
   */
  static createGeneralChannelForServer = async (serverId) => {
    const newChannel = await ChannelRepository.create({
      name: "general",
      serverId
    });
    if (!newChannel) {
      throw new InternalServerError(
        500,
        `create(): ${serverId}`,
        "Unable to create general channel."
      );
    }

    return newChannel;
  };

  /**
   * @description Deletes all the server's channels.
   * @param {string} serverId The given server id.
   * @throws InternalServerError If it fails to delete the channels.
   */
  static deleteServerChannels = async (serverId) => {
    const deleteChannels = await ChannelRepository.deleteMany({
      serverId: serverId
    });

    if (!deleteChannels) {
      throw new InternalServerError(
        500,
        `deleteMany(): ${serverId}`,
        "Unable to delete channels."
      );
    }
  };
}
