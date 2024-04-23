import ServerRepository from "../models/server.js";
import {
  AuthorizationError,
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/errors.js";

export default class ServerService {
  static minKickPerms = 5;

  static getServers = async () => {
    return await ServerRepository.find();
  };

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

  static getServerByName = async (name) => {
    const server = await ServerRepository.findOne({
      name: { $regex: name, $options: "i" }
    });
    if (!server) {
      throw new NotFoundError(404, `name: ${name}`, "Server not found.");
    }

    return server;
  };

  static getSimilarServersByName = async (name) => {
    const servers = await ServerRepository.find({
      name: { $regex: `^${name}`, $options: "i" }
    });

    return servers;
  };

  static getJoinedServers = async (userId) => {
    const joinedServers = await ServerRepository.find({
      users: { $elemMatch: { id: userId } }
    });

    return joinedServers;
  };

  static createServer = async (name, description, creatorId) => {
    const serverExists = await ServerRepository.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });
    if (serverExists) {
      throw new BadRequestError(
        400,
        this.createServer.name,
        `${name} is taken.`
      );
    }

    const newServer = await ServerRepository.create({
      name: name,
      description: description,
      creatorId: creatorId,
      users: [
        {
          id: creatorId,
          permissionLevel: 9
        }
      ]
    });
    if (!newServer) {
      throw new InternalServerError(
        500,
        this.createServer.name,
        "Unable to create server."
      );
    }

    return newServer;
  };

  static updateServer = async (serverId, name, description, userId) => {
    const server = await this.getServerById(serverId);

    if (server.creatorId !== userId) {
      throw new AuthorizationError(
        403,
        this.updateServer.name,
        "Unauthorized to update server."
      );
    }

    if (server.name === name && server.description === description) {
      throw new BadRequestError(
        400,
        this.updateServer.name,
        "Nothing has changed."
      );
    } else {
      if (server.name !== name) {
        const serverExists = await ServerRepository.findOne({
          name: { $regex: `^${name}$`, $options: "i" }
        });
        if (serverExists) {
          throw new BadRequestError(
            400,
            this.updateServer.name,
            `${name} is taken.`
          );
        }
      }
    }

    const updatedServer = await ServerRepository.findByIdAndUpdate(serverId, {
      name: name,
      description: description
    });
    if (!updatedServer) {
      throw new InternalServerError(
        500,
        this.updateServer.name,
        "Unable to update server."
      );
    }
  };

  static updateUser = async (
    server,
    editedUser,
    editorUser,
    permissionLevel
  ) => {
    const editedUserIndex = server.users
      .map((server) => server.id)
      .indexOf(editedUser.id);
    if (editedUserIndex === -1) {
      throw new NotFoundError(
        404,
        this.updateUser.name,
        `${editedUser.username} not found in ${server.name}.`
      );
    }

    const editorUserIndex = server.users
      .map((server) => server.id)
      .indexOf(editorUser.id);
    if (editorUserIndex === -1) {
      throw new NotFoundError(
        404,
        this.updateUser.name,
        `${editorUser.username} not found in ${server.name}.`
      );
    }

    const editedUserPerms = server.users[editedUserIndex].permissionLevel;
    const editorUserPerms = server.users[editorUserIndex].permissionLevel;

    if (
      editedUserPerms >= editorUserPerms ||
      permissionLevel >= editorUserPerms
    ) {
      throw new AuthorizationError(
        403,
        this.updateUser.name,
        "Unsufficient permissions."
      );
    }

    server.users[editedUserIndex].permissionLevel = permissionLevel;
    const updatedUser = await server.save();
    if (!updatedUser) {
      throw new InternalServerError(
        500,
        this.updateUser.name,
        `Unable to update ${editedUser.username} in ${server.name}.`
      );
    }
  };

  static deleteServer = async (server, user) => {
    if (server.creatorId !== user.id) {
      throw new AuthorizationError(
        403,
        this.deleteServer.name,
        "Unauthorized to delete server."
      );
    }

    const deletedServer = await ServerRepository.findByIdAndDelete(server.id);
    if (!deletedServer) {
      throw new InternalServerError(
        500,
        this.deleteServer.name,
        "Unable to delete server."
      );
    }
  };

  static addUser = async (server, user) => {
    if (server.blacklist.includes(user.id)) {
      throw new AuthorizationError(
        403,
        this.addUser.name,
        `${user.username} is blacklisted from ${server.name}.`
      );
    }

    if (server.creatorId === user.id) {
      throw new BadRequestError(
        400,
        this.addUser.name,
        `${user.username} is already in ${server.name}.`
      );
    }

    if (server.users.map((userObj) => userObj.id).includes(user.id)) {
      throw new BadRequestError(
        400,
        this.addUser.name,
        `${user.username} is already in ${server.name}.`
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
        this.addUser.name,
        `Unable to add ${user.username} to ${server.name}'s users.`
      );
    }
  };

  static removeUser = async (server, user) => {
    const userIndex = server.users.map((server) => server.id).indexOf(user.id);
    if (userIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeUser.name,
        `${user.username} not found in ${server.name}'s users.`
      );
    }

    if (server.creatorId === user.id) {
      throw new BadRequestError(
        400,
        this.blacklistUser.name,
        `${user.username} is ${server.name}'s creator. They cannot be removed without deleting the server.`
      );
    }

    server.users.splice(userIndex, 1);
    const removedUser = await server.save();
    if (!removedUser) {
      throw new InternalServerError(
        500,
        this.removeUser.name,
        `Unable to remove ${user.username} from ${server.name}'s users.`
      );
    }
  };

  static blacklistUser = async (server, kicked, kicker) => {
    if (server.creatorId === kicked.id) {
      throw new BadRequestError(
        400,
        this.blacklistUser.name,
        `${kicked.username} is ${server.name}'s creator. They cannot be kicked without deleting the server.`
      );
    }

    const kickedIndex = server.users
      .map((server) => server.id)
      .indexOf(kicked.id);
    if (kickedIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeUser.name,
        `${kicked.username} not found in ${server.name}'s users.`
      );
    }

    const kickerIndex = server.users
      .map((server) => server.id)
      .indexOf(kicker.id);
    if (kickerIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeUser.name,
        `${kicker.username} not found in ${server.name}'s users.`
      );
    }

    const kickedPerms = server.users.find(
      (userObj) => userObj.id === kicked.id
    ).permissionLevel;
    const kickerPerms = server.users.find(
      (userObj) => userObj.id === kicker.id
    ).permissionLevel;

    if (kickerPerms < this.minKickPerms || kickedPerms >= kickerPerms) {
      throw new AuthorizationError(
        403,
        this.blacklistUser.name,
        `Unauthorized to kick ${kicked.username}.`
      );
    }

    server.users.splice(kickedIndex, 1);
    const kickedUser = await server.save();
    if (!kickedUser) {
      throw new InternalServerError(
        500,
        this.removeUser.name,
        `Unable to remove ${kicked.username} from ${server.name}'s users.`
      );
    }

    server.blacklist.push(kicked.id);
    const blacklistedUser = await server.save();
    if (!blacklistedUser) {
      throw new InternalServerError(
        500,
        this.blacklistUser.name,
        `Unable to add ${kicked.username} to ${server.name}'s blacklist.`
      );
    }
  };

  static unblacklistUser = async (server, user) => {
    const kickedIndex = server.blacklist.indexOf(user.id);
    if (kickedIndex === -1) {
      throw new NotFoundError(
        404,
        this.unblacklistUser.name,
        `${user.username} not found in ${server.name}'s users.`
      );
    }

    server.blacklist.splice(kickedIndex, 1);
    const unblacklistedUser = await server.save();
    if (!unblacklistedUser) {
      throw new InternalServerError(
        500,
        this.unblacklistUser.name,
        `Unable to remove ${user.username} to ${server.name}'s blacklist.`
      );
    }
  };

  static addChannel = async (server, channel) => {
    if (server.channels.includes(channel.id)) {
      throw new BadRequestError(
        400,
        this.addChannel.name,
        `${channel.name} already exists in ${server.name}.`
      );
    }

    server.channels.push(channel.id);
    const addedChannel = await server.save();
    if (!addedChannel) {
      throw new InternalServerError(
        500,
        this.channel.name,
        `Unable to add ${channel.name} to ${server.name}'s channels.`
      );
    }
  };

  static removeChannel = async (server, channel, user) => {
    const channelIndex = server.channels.indexOf(channel.id);
    if (channelIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeChannel.name,
        `${channel.name} not found in ${server.name}'s channels.`
      );
    }

    if (channel.name === "general") {
      throw new BadRequestError(
        400,
        this.removeChannel.name,
        "General channel cannot be deleted."
      );
    }

    const userIndex = server.users
      .map((userObj) => userObj.id)
      .indexOf(user.id);
    if (userIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeChannel.name,
        `${user.username} not found in ${server.name}'s users.`
      );
    }

    const userPerms = server.users[userIndex].permissionLevel;
    if (userPerms < channel.permissionLevel) {
      throw new AuthorizationError(
        403,
        this.removeChannel.name,
        `Unauthorized to delete ${channel.name}.`
      );
    }

    server.channels.splice(channelIndex, 1);
    const removedChannel = await server.save();
    if (!removedChannel) {
      throw new InternalServerError(
        500,
        this.removeChannel.name,
        `Unable to delete ${channel.name} from ${server.name}'s channels.`
      );
    }
  };
}
