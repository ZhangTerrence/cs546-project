import ChannelRepository from "../models/channel.js";
import {
  AuthorizationError,
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/errors.js";

export default class ChannelService {
  static getChannels = async () => {
    return await ChannelRepository.find();
  };

  static getChannelsByServer = async (server) => {
    return await ChannelRepository.find({
      serverId: server.id
    });
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

  static updateChannel = async (
    server,
    channel,
    editorUser,
    name,
    description,
    permissionLevel
  ) => {
    const channelIndex = server.channels.indexOf(channel.id);
    if (channelIndex === -1) {
      throw new NotFoundError(
        404,
        this.updateChannel.name,
        `${channel.name} not found in ${server.name}.`
      );
    }

    const editorUserIndex = server.users
      .map((server) => server.id)
      .indexOf(editorUser.id);
    if (editorUserIndex === -1) {
      throw new NotFoundError(
        404,
        this.updateChannel.name,
        `${editorUser.username} not found in ${server.name}.`
      );
    }

    const channelPerms = channel.permissionLevel;
    const editorUserPerms = server.users[editorUserIndex].permissionLevel;

    if (channelPerms >= editorUserPerms || permissionLevel >= editorUserPerms) {
      throw new AuthorizationError(
        403,
        this.updateChannel.name,
        "Unsufficient permissions."
      );
    }

    if (
      channel.name === "general" &&
      (name != "general" || permissionLevel > 0)
    ) {
      throw new BadRequestError(
        400,
        this.updateChannel.name,
        "Can only edit general channel description."
      );
    }

    const updatedChannel = await ChannelRepository.findByIdAndUpdate(
      channel.id,
      {
        name: name,
        description: description,
        permissionLevel: permissionLevel
      }
    );
    if (!updatedChannel) {
      throw new InternalServerError(
        500,
        this.updateChannel.name,
        `Unable to update ${channel.name} in ${server.name}.`
      );
    }
  };

  static deleteChannel = async (channelId, force) => {
    const channel = await this.getChannelById(channelId);

    if (channel.name === "general" && !force) {
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

  static removeMessage = async (channel, message) => {
    const messageIndex = channel.messages.indexOf(message.id);
    if (messageIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeMessage.name,
        "Message not found in channel."
      );
    }

    channel.messages.splice(messageIndex, 1);
    const removedMessage = await channel.save();
    if (!removedMessage) {
      throw new InternalServerError(
        500,
        this.removeMessage.name,
        "Unable to delete message."
      );
    }
  };
}
