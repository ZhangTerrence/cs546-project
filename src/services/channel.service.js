import ChannelRepository from "../models/channel.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/errors.js";

export default class ChannelService {
  /**
   * Gets all channels.
   * @returns Channel array.
   */
  static getChannels = async () => {
    return await ChannelRepository.find();
  };

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
      description: "General channel.",
      serverId: serverId,
      permissionLevel: 0
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
   * @description Creates a new channel.
   * @param {string} name The given channel name.
   * @param {string} description The given channel description.
   * @param {string} serverId The server which the channel belongs to.
   * @param {number} permissionLevel The permission level this channel requires.
   * @returns Channel.
   * @throws BadRequestError If a channel with the given name already exists in a server.
   * @throw InternalServerError If it fails to create the channel.
   */
  static createChannel = async (
    name,
    description,
    serverId,
    permissionLevel
  ) => {
    const channelExists = await ChannelRepository.findOne({
      $and: [{ name: { $regex: name, $options: "i" } }, { serverId: serverId }]
    });
    if (channelExists) {
      throw new BadRequestError(
        400,
        `channel: ${name}`,
        "Channel name already being used in server."
      );
    }

    const newChannel = await ChannelRepository.create({
      name: name,
      description: description,
      serverId: serverId,
      permissionLevel: permissionLevel
    });
    if (!newChannel) {
      throw new InternalServerError(
        500,
        `create(): ${[name, description, serverId]}`,
        "Unable to create channel."
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

  /**
   * @description Deletes a channel.
   * @param {string} channelid The given channel id.
   * @throws NotFoundError If the channel is not found.
   * @throws InternalServerError If it fails to delete the channel.
   */
  static deleteChannel = async (channelId) => {
    const channel = await this.getChannelById(channelId);

    if (channel.name === "general") {
      throw new BadRequestError(
        400,
        `channel: ${channelId}`,
        "General channel cannot be deleted."
      );
    }

    const deletedChannel = await ChannelRepository.findByIdAndDelete(channelId);

    if (!deletedChannel) {
      throw new InternalServerError(
        500,
        `findByIdAndDelete(): ${channelId}`,
        "Unable to delete channel."
      );
    }
  };
}
