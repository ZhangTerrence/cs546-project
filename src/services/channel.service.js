import ChannelRepository from "../models/channel.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/errors.js";

export default class ChannelService {
  static getChannels = async () => {
    return await ChannelRepository.find();
  };

  static getChannelById = async (channelId) => {
    const channel = await ChannelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundError(
        404,
        this.getChannelById.name,
        "Channel not found."
      );
    }
    return channel;
  };

  static createGeneralChannelForServer = async (server) => {
    const newChannel = await ChannelRepository.create({
      name: "general",
      description: "General channel.",
      serverId: server.id,
      permissionLevel: 0
    });
    if (!newChannel) {
      throw new InternalServerError(
        500,
        this.createGeneralChannelForServer.name,
        `Unable to create general channel for ${server.name}.`
      );
    }

    return newChannel;
  };

  static createChannel = async (name, description, server, permissionLevel) => {
    const channelExists = await ChannelRepository.findOne({
      $and: [{ name: { $regex: name, $options: "i" } }, { serverId: server.id }]
    });
    if (channelExists) {
      throw new BadRequestError(
        400,
        this.createChannel.name,
        `${name} already exists in ${server.name}.`
      );
    }

    const newChannel = await ChannelRepository.create({
      name: name,
      description: description,
      serverId: server.id,
      permissionLevel: permissionLevel
    });
    if (!newChannel) {
      throw new InternalServerError(
        500,
        this.createChannel.name,
        "Unable to create channel."
      );
    }

    return newChannel;
  };

  static deleteChannel = async (channelId) => {
    const channel = await this.getChannelById(channelId);

    if (channel.name === "general") {
      throw new BadRequestError(
        400,
        this.deleteChannel.name,
        "General channel cannot be deleted."
      );
    }

    const deletedChannel = await ChannelRepository.findByIdAndDelete(channelId);

    if (!deletedChannel) {
      throw new InternalServerError(
        500,
        this.deleteChannel.name,
        "Unable to delete channel."
      );
    }
  };

  static deleteServerChannels = async (server) => {
    const deleteChannels = await ChannelRepository.deleteMany({
      serverId: server.id
    });

    if (!deleteChannels) {
      throw new InternalServerError(
        500,
        this.deleteServerChannels.name,
        `Unable to delete ${server.name}'s channels.`
      );
    }
  };

  static addMessage = async (channel, message) => {
    channel.messages.push(message.id);
    const addedMessage = await channel.save();
    if (!addedMessage) {
      throw new InternalServerError(
        500,
        this.addMessage.name,
        `Unable to add message to ${channel.name}`
      );
    }
  };
}
