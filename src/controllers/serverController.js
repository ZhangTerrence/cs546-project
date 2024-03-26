import Channel from "../models/channelModel.js";
import Server from "../models/serverModel.js";
import User from "../models/userModel.js";
import {
  validateServerCreationInput,
  validateUniqueServer,
  validateStringInput,
  validateMongoIdInput
} from "../utils/validators.js";
import mongoose from "mongoose";

/**
 * @description Renders a server's main page.
 * @route Get /server/:serverId
 * @access Public
 */
export const renderServerPage = async (req, res) => {
  const { serverId } = req.params;

  try {
    validateMongoIdInput(serverId, "Server id");
  } catch (error) {
    return res.render("error/400", {
      statusCode: 400,
      error: error.message
    });
  }

  if (!serverId) {
    return res.render("error/400", {
      statusCode: 404,
      error: "Server not found."
    });
  }

  const server = await Server.findById(serverId);
  if (!server) {
    return res.render("error/400", {
      statusCode: 404,
      error: "Server not found."
    });
  }

  const users = await Promise.all(
    server.users.map(async (userObj) => {
      const user = await User.findById(userObj.id);
      if (!userObj) {
        return res.status(404).render("error/400", {
          statusCode: 404,
          error: "User not found."
        });
      }

      return {
        id: user.id,
        username: user.username
      };
    })
  );

  if (
    req.session.user &&
    req.session.user.id &&
    req.session.user.id === server.creatorId
  ) {
    return res.render("server/server", {
      name: server.name,
      description: server.description,
      users: users,
      owner: true
    });
  } else {
    return res.render("server/server", {
      name: server.name,
      description: server.description,
      users: users,
      owner: false
    });
  }
};

/**
 * @description Gets servers by name.
 * @route GET /server/queryName/:serverName
 * @access Public
 */
export const getServersByName = async (req, res) => {
  const { serverName } = req.params;

  const servers = await Server.find({
    name: { $regex: serverName, $options: "i" }
  });

  return res.status(200).json({ success: servers ?? [] });
};

/**
 * @description Creates a server.
 * @route POST /server
 * @access Private
 */
export const createServer = async (req, res) => {
  const { name } = req.body;

  try {
    validateServerCreationInput(name);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    await validateUniqueServer(name);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const serverId = new mongoose.Types.ObjectId();

  const channel = await Channel.create({
    name: "general",
    serverId
  });
  if (!channel) {
    return res.status(500).json({ error: "Unable to create general channel." });
  }

  const server = await Server.create({
    _id: serverId,
    name,
    creatorId: user._id,
    users: [
      {
        id: user._id,
        permissionLevel: 9
      }
    ],
    channels: [channel._id]
  });
  if (!server) {
    return res.status(500).json({ error: "Unable to create server." });
  }

  user.servers.push(server._id);
  const userSaved = await user.save();
  if (!userSaved) {
    return res.status(500).json({ error: "Unable to update user servers." });
  }

  return res.status(201).json({ success: `/server/${server._id}` });
};

/**
 * @description Deletes a server.
 * @route DELETE /server
 * @access Private
 */
export const deleteServer = async (req, res) => {
  const { serverId } = req.body;

  try {
    validateMongoIdInput(serverId, "Server id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const server = await Server.findById(serverId);
  if (!server) {
    return res.status(404).json({ error: "Server not found." });
  }

  const deletedChannels = await Channel.deleteMany({
    serverId: server.id
  });
  if (!deletedChannels) {
    return res.status(500).json({ error: "Unable to delete channels." });
  }

  const users = await User.find({
    servers: { $in: server.id }
  });
  users.forEach(async (user) => {
    user.servers.splice(user.servers.indexOf(server.id), 1);

    const savedUser = await user.save();
    if (!savedUser) {
      return res.status(500).json({ error: "Unable to save user." });
    }
  });

  const deletedServer = await Server.findByIdAndDelete(server.id);
  if (!deletedServer) {
    return res.status(500).json({ error: "Unable to delete server." });
  }

  return res.status(200).json({ success: "Successfully deleted server." });
};

/**
 * @description Joins a server.
 * @route POST /server/join
 * @access Private
 */
export const joinServer = async (req, res) => {
  const { serverId } = req.body;

  try {
    validateStringInput(serverId, "Server id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const server = await Server.findById(serverId);
  if (!server) {
    return res.status(404).json({ error: "Server not found." });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (server.blacklist.includes(req.session.user.id)) {
    return res
      .status(403)
      .json({ error: `You are banned from ${server.name}.` });
  }

  if (
    server.creatorId === req.session.user.id ||
    server.users.map((userObj) => userObj.id).includes(req.session.user.id)
  ) {
    return res.status(400).json({ error: "Already joined server." });
  }

  user.servers.push(server.id);
  const savedUser = await user.save();
  if (!savedUser) {
    return res.status(500).json({ error: "Unable to join server." });
  }

  server.users.push({
    id: req.session.user.id,
    permissionLevel: 0
  });

  const savedServer = await server.save();
  if (!savedServer) {
    return res.status(500).json({ error: "Unable to join server." });
  }

  return res.status(200).json({ success: "Successfully joined server." });
};

/**
 * @description Leaves a server.
 * @route DELETE /server/leave
 * @access Private
 */
export const leaveServer = async (req, res) => {
  const { serverId } = req.body;

  try {
    validateStringInput(serverId, "Server id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  console.log(serverId, typeof serverId);

  const server = await Server.findById(serverId);
  console.log(server);
  if (!server) {
    return res.status(404).json({ error: "Server not found." });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.servers.splice(user.servers.splice(server.id), 1);
  const savedUser = await user.save();
  if (!savedUser) {
    return res.status(500).json({ error: "Unable to leave server." });
  }

  if (user.id === server.creatorId) {
    const deletedChannels = await Channel.deleteMany({
      serverId: server.id
    });
    if (!deletedChannels) {
      return res.status(500).json({ error: "Unable to delete channels." });
    }

    const users = await User.find({
      servers: { $in: server.id }
    });
    users.forEach(async (user) => {
      user.servers.splice(user.servers.indexOf(server.id), 1);

      const savedUser = await user.save();
      if (!savedUser) {
        return res
          .status(500)
          .json({ error: "Unable to remove server from user servers." });
      }
    });

    const deletedServer = await Server.findByIdAndDelete(server.id);
    if (!deletedServer) {
      return res.status(500).json({ error: "Unable to delete server." });
    }
  } else {
    const index = server.users.map((userObj) => userObj.id).indexOf(user.id);
    server.users.splice(index, 1);

    const savedServer = await server.save();
    if (!savedServer) {
      return res.status(500).json({ error: "Unable to leave server." });
    }
  }

  return res.status(200).json({ success: "Successfully left server." });
};

/**
 * @description Kicks user from a server.
 * @route POST /server/blacklist
 * @access Private
 */
export const kickUser = async (req, res) => {
  const { serverId, userId } = req.body;

  try {
    validateStringInput(serverId, "Server id");
    validateStringInput(userId, "User id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const server = await Server.findById(serverId);
  if (!server) {
    return res.status(404).json({ error: "Server not found." });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (user.id === server.creatorId) {
    return res
      .status(400)
      .json({ error: "You are the owner. Delete instead." });
  }

  user.servers.splice(user.servers.indexOf(server.id), 1);

  const savedUser = await user.save();
  if (!savedUser) {
    return res.status(500).json({ error: "Unable to kick user." });
  }

  const index = server.users.map((userObj) => userObj.id).indexOf(user.id);
  server.users.splice(index, 1);
  server.blacklist.push(user.id);

  const savedServer = await server.save();
  if (!savedServer) {
    return res.status(500).json({ error: "Unable to kick user." });
  }

  return res.status(200).json({ success: "Successfully kicked user." });
};
