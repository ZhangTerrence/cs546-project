import ServerRepository from "../models/server.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/errors.js";
import mongoose from "mongoose";

export default class ServerService {
  /**
   * @description Gets a server by its id.
   * @param {string} serverId The given server id.
   * @returns Server.
   * @throws NotFoundError If the server is not found.
   */
  static getServerById = async (serverId) => {
    const server = await ServerRepository.findById(serverId);
    if (!server) {
      throw new NotFoundError(
        404,
        `serverId: ${serverId}`,
        "Server not found."
      );
    }

    return server;
  };

  /**
   * @description Gets a server by its name.
   * @param {string} name The given server name.
   * @returns Server.
   * @throws NotFoundError If the server is not found.
   */
  static getServerByName = async (name) => {
    const server = await ServerRepository.findOne({
      name: { $regex: name, $options: "i" }
    });
    if (!server) {
      throw new NotFoundError(404, `name: ${name}`, "Server not found.");
    }

    return server;
  };

  /**
   * @description Gets all servers whose names begin with the given name.
   * @param {string} name The given name.
   * @returns Server array.
   */
  static getSimilarServersByName = async (name) => {
    const servers = await ServerRepository.find({
      name: { $regex: name, $options: "i" }
    });

    return servers;
  };

  /**
   * @description Gets all the servers which an user is in.
   * @param {string} userId The given user id.
   * @returns Server array.
   */
  static getJoinedServers = async (userId) => {
    const joinedServers = await ServerRepository.find({
      users: { $elemMatch: { id: userId } }
    });

    return joinedServers;
  };

  /**
   * @description Generates a new MongoDB ObjectId.
   * @param {string} name The given server name.
   * @returns MongoDB ObjectId.
   * @throws BadRequestError If the name is taken.
   */
  static generateNewServerIdFromName = async (name) => {
    const serverExists = await ServerRepository.findOne({
      name: { $regex: name, $options: "i" }
    });
    if (serverExists) {
      throw new BadRequestError(
        400,
        `name: ${name}`,
        "Server name already taken."
      );
    }

    return new mongoose.Types.ObjectId();
  };

  /**
   * @description Creates a server.
   * @param {string} serverId The given server id.
   * @param {string} name The given server name.
   * @param {string} description The given server description.
   * @param {string} creatorId The given creator id.
   * @param {string} generalChannelId The given general channel id.
   * @throws BadRequestError If the name is taken.
   * @throws InternalServerError If it fails to create the server.
   */
  static createServer = async (
    serverId,
    name,
    description,
    creatorId,
    generalChannelId
  ) => {
    const serverExists = await ServerRepository.findOne({
      name: { $regex: name, $options: "i" }
    });
    if (serverExists) {
      throw new BadRequestError(400, `name: ${name}`, "Name is taken.");
    }

    const newServer = await ServerRepository.create({
      _id: serverId,
      name: name,
      description: description,
      creatorId: creatorId,
      users: [
        {
          id: creatorId,
          permissionLevel: 9
        }
      ],
      channels: [generalChannelId]
    });
    if (!newServer) {
      throw new InternalServerError(
        500,
        `create(): ${[serverId, name, creatorId, generalChannelId]}`,
        "Unable to create server."
      );
    }
  };

  /**
   * @description Deletes a server.
   * @param {string} serverId The given server id.
   * @throws NotFoundError If the server is not found.
   * @throws InternalServerError If it fails to delete the server.
   */
  static deleteServer = async (serverId) => {
    await this.getServerById(serverId);

    const deletedServer = await ServerRepository.findByIdAndDelete(serverId);

    if (!deletedServer) {
      throw new InternalServerError(
        500,
        `findByIdAndDelete(): ${serverId}`,
        "Unable to delete server."
      );
    }
  };

  /**
   * @description Adds an user to a server.
   * @param {ServerDocument} server The server which the user will join.
   * @param {UserDocument} user The user who will join the server.
   * @throws BadRequestError If the user is blacklisted or is already in the server.
   * @throws InternalServerError If it fails to update either the server or the user.
   */
  static addUser = async (server, user) => {
    if (server.blacklist.includes(user.id)) {
      throw new BadRequestError(
        400,
        `user: ${[server.blacklist, user.id]}`,
        "User is blacklisted from server."
      );
    }

    if (server.creatorId === user.id) {
      throw new BadRequestError(
        400,
        `user: ${[server.creatorId, user.id]}`,
        "User is already in server."
      );
    }

    if (server.users.map((userObj) => userObj.id).includes(user.id)) {
      throw new BadRequestError(
        400,
        `user: ${[server.users, user.id]}`,
        "User is already in server."
      );
    }

    if (user.servers.includes(server.id)) {
      throw new BadRequestError(
        400,
        `user: ${[user.servers, server.id]}`,
        "User is already in server."
      );
    }

    user.servers.push(server.id);

    const addedServer = await user.save();
    if (!addedServer) {
      throw new InternalServerError(
        500,
        `save(): ${[user.servers, server.id]}`,
        "Unable to join server."
      );
    }

    server.users.push({
      id: user.id,
      permissionLevel: 0
    });

    const savedUser = await server.save();
    if (!savedUser) {
      throw new InternalServerError(
        500,
        `save(): ${[server.users, user.id]}`,
        "Unable to join server."
      );
    }
  };

  /**
   * @description Removes an user from a server.
   * @param {ServerDocument} server The server which the user will leave.
   * @param {string} userId The id of the user who will leave the server.
   * @throws InternalServerError If it fails to update the server.
   */
  static removeUser = async (server, userId) => {
    const userIndex = server.users.map((server) => server.id).indexOf(userId);
    if (userIndex === -1) {
      throw new NotFoundError(
        404,
        `user:${[server.users, userId]}`,
        "User not found."
      );
    }

    server.users.splice(userIndex, 1);

    const removedUser = await server.save();
    if (!removedUser) {
      throw new InternalServerError(
        500,
        `save(): ${[server, userId]}`,
        "Unable to delete user from server."
      );
    }
  };

  /**
   * @description Blacklists an user from a server.
   * @param {ServerDocument} server The server which the user will be blacklisted from.
   * @param {string} userId The id of the user who will be blacklisted.
   * @throws BadRequestError If the user is the creator.
   * @throws InternalServerError If it fails to update the server.
   */
  static blacklistUser = async (server, userId) => {
    if (server.creatorId === userId) {
      throw new BadRequestError(
        400,
        `user: ${[server.creatorId, userId]}`,
        "You are the owner. Delete server instead."
      );
    }

    await this.removeUser(server, userId);

    server.blacklist.push(userId);

    const blacklistedUser = await server.save();
    if (!blacklistedUser) {
      throw new InternalServerError(
        500,
        `save(): ${[server.blacklist, userId]}`,
        "Unable to blacklist user from server."
      );
    }
  };

  /**
   * @description Adds a channel to a server.
   * @param {ServerDocument} server The server which the channel will be added to.
   * @param {string} channelId The id of the channel which will be added.
   * @throws BadRequestError If the channel already exists in the server.
   * @throws InternalServerError If it fails to update the server.
   */
  static addChannel = async (server, channelId) => {
    if (server.channels.includes(channelId)) {
      throw new BadRequestError(
        400,
        `server: ${[server.channels, channelId]}`,
        "Channel already exists in server."
      );
    }

    server.channels.push(channelId);

    const addedChannel = await server.save();
    if (!addedChannel) {
      throw new InternalServerError(
        500,
        `save(): ${[server.channels, channelId]}`,
        "Unable to add channel to server."
      );
    }
  };

  /**
   * @description Deletes a channel from a server.
   * @param {ServerDocument} server The server which the channel will be deleted from.
   * @param {string} channelId The id of the channel which will be deleted.
   * @throws NotFoundError If the channel is not found.
   * @throws InternalServerError If it fails to update the server.
   */
  static deleteChannel = async (server, channelId) => {
    const channelIndex = server.channels.indexOf(channelId);
    if (channelIndex === -1) {
      throw new NotFoundError(
        404,
        `channel: ${[server.channels, channelId]}`,
        "Channel not found."
      );
    }

    server.channels.splice(channelIndex, 1);

    const removedChannel = await server.save();
    if (!removedChannel) {
      throw new InternalServerError(
        500,
        `save(): ${[server.channels, channelId]}`,
        "Unable to delete channel from server."
      );
    }
  };
}
