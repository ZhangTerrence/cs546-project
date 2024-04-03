import ChannelRepository from "../models/channel.js";
import { InternalServerError } from "../utils/errors.js";

export default class ChannelService {
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
