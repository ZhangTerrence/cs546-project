import ChannelService from "../services/channel.service.js";
import MessageService from "../services/message.service.js";
import ServerService from "../services/server.service.js";
import UserService from "../services/user.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { ChannelValidator, ServerValidator } from "../utils/validators.js";

export default class ServerController {
  /**
   * @route GET /server/:serverId
   * @access Public
   */
  static renderServerMainPage = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.params.serverId,
        "serverId"
      );

      const server = await ServerService.getServerById(serverId);

      if (
        req.session.user &&
        req.session.user.id &&
        server.users.find((userObj) => userObj.id === req.session.user.id)
      ) {
        const userId = req.session.user.id;
        const userPerms = server.users.find(
          (userObj) => userObj.id === userId
        ).permissionLevel;

        const users = await Promise.all(
          server.users.map(async (userObj) => {
            const user = await UserService.getUserById(userObj.id);

            return {
              id: user.id,
              username: user.username,
              canEdit: userPerms > userObj.permissionLevel
            };
          })
        );

        const channels = await Promise.all(
          server.channels.map(async (channelId) => {
            const channel = await ChannelService.getChannelById(channelId);

            return {
              id: channel.id,
              name: channel.name,
              canEdit: userPerms > channel.permissionLevel
            };
          })
        );

        const blacklist = await Promise.all(
          server.blacklist.map(async (userId) => {
            const user = await UserService.getUserById(userId);

            return {
              id: user.id,
              username: user.username
            };
          })
        );

        if (userId === server.creatorId) {
          return res.render("server/main", {
            stylesheets: [
              `<link rel="stylesheet" href="/public/css/server/main.css" />`
            ],
            scripts: [`<script src="/public/js/server/main.js"></script>`],
            id: server.id,
            name: server.name,
            description: server.description,
            users: users,
            channels: channels,
            blacklist: blacklist,
            owner: true,
            member: true
          });
        } else if (server.users.map((userObj) => userObj.id).includes(userId)) {
          return res.render("server/main", {
            stylesheets: [
              `<link rel="stylesheet" href="/public/css/server/main.css" />`
            ],
            scripts: [`<script src="/public/js/server/main.js"></script>`],
            id: server.id,
            name: server.name,
            description: server.description,
            users: users,
            channels: channels,
            owner: false,
            member: true
          });
        }
      }

      const users = await Promise.all(
        server.users.map(async (userObj) => {
          const user = await UserService.getUserById(userObj.id);

          return {
            id: user.id,
            username: user.username
          };
        })
      );

      const channels = await Promise.all(
        server.channels.map(async (channelId) => {
          const channel = await ChannelService.getChannelById(channelId);

          return {
            id: channel.id,
            name: channel.name
          };
        })
      );

      return res.render("server/main", {
        stylesheets: [
          `<link rel="stylesheet" href="/public/css/server/main.css" />`
        ],
        id: server.id,
        name: server.name,
        description: server.description,
        users: users,
        channels: channels
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        if ((!error) instanceof InternalServerError) {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        } else {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        }
      } else {
        console.log(error);
        return res.status(500).render("error", {
          statusCode: 500,
          message: "Code went boom."
        });
      }
    }
  };

  /**
   * @route GET /server/:serverId/edit
   * @access Private
   */
  static renderServerEditPage = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.params.serverId,
        "serverId"
      );

      const server = await ServerService.getServerById(serverId);

      return res.render("server/edit", {
        stylesheets: [
          `<link rel="stylesheet" href="/public/css/server/edit.css" />`
        ],
        scripts: [`<script src="/public/js/server/edit.js"></script>`],
        id: server.id,
        name: server.name,
        description: server.description
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        if ((!error) instanceof InternalServerError) {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        } else {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        }
      } else {
        console.log(error);
        return res.status(500).render("error", {
          statusCode: 500,
          message: "Code went boom."
        });
      }
    }
  };

  /**
   * @route GET /server/:serverId/edit/user/:userId
   * @access Private
   */
  static renderServerEditUserPage = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.params.serverId,
        "serverId"
      );
      const editedId = ServerValidator.validateMongooseId(
        req.params.userId,
        "userId"
      );
      const editorId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);

      const editedUser = server.users.find(
        (userObj) => userObj.id === editedId
      );
      if (!editedUser) {
        return res.status(404).render("error", {
          statusCode: 404,
          message: "User not found in server."
        });
      }

      const editorUser = server.users.find(
        (userObj) => userObj.id === editorId
      );
      if (!editorUser) {
        return res.status(404).render("error", {
          statusCode: 404,
          message: "User not found in server."
        });
      }

      if (editedUser.permissionLevel >= editorUser.permissionLevel) {
        return res.status(403).render("error", {
          statusCode: 403,
          message: "Insufficient permissions."
        });
      }

      const user = await UserService.getUserById(editedUser.id);

      return res.render("server/editUser", {
        stylesheets: [
          `<link rel="stylesheet" href="/public/css/server/editUser.css" />`
        ],
        scripts: [`<script src="/public/js/server/editUser.js"></script>`],
        serverId: server.id,
        id: user.id,
        username: user.username,
        permissionLevel: editedUser.permissionLevel
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        if ((!error) instanceof InternalServerError) {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        } else {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        }
      } else {
        console.log(error);
        return res.status(500).render("error", {
          statusCode: 500,
          message: "Code went boom."
        });
      }
    }
  };

  /**
   * @route GET /server/:serverId/edit/channel/:channelId
   * @access Private
   */
  static renderServerEditChannelPage = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.params.serverId,
        "serverId"
      );
      const channelId = ServerValidator.validateMongooseId(
        req.params.channelId,
        "channelId"
      );
      const editorId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);

      const serverChannel = server.channels.find((id) => id === channelId);
      if (!serverChannel) {
        return res.status(404).render("error", {
          statusCode: 404,
          message: "Channel not found in server."
        });
      }

      const editorUser = server.users.find(
        (userObj) => userObj.id === editorId
      );
      if (!editorUser) {
        return res.status(404).render("error", {
          statusCode: 404,
          message: "User not found in server."
        });
      }

      const channel = await ChannelService.getChannelById(serverChannel);

      if (channel.permissionLevel >= editorUser.permissionLevel) {
        return res.status(403).render("error", {
          statusCode: 403,
          message: "Insufficient permissions."
        });
      }

      return res.render("server/editChannel", {
        stylesheets: [
          `<link rel="stylesheet" href="/public/css/server/editChannel.css" />`
        ],
        scripts: [`<script src="/public/js/server/editChannel.js"></script>`],
        serverId: server.id,
        id: channel.id,
        name: channel.name,
        description: channel.description,
        permissionLevel: channel.permissionLevel
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        if ((!error) instanceof InternalServerError) {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        } else {
          return res.status(error.statusCode).render("error", {
            statusCode: error.statusCode,
            message: error.message
          });
        }
      } else {
        console.log(error);
        return res.status(500).render("error", {
          statusCode: 500,
          message: "Code went boom."
        });
      }
    }
  };

  /**
   * @route GET /api/server/:name
   * @access Public
   */
  static getServersByName = async (req, res) => {
    try {
      const { name } = req.params;

      const servers = await ServerService.getSimilarServersByName(name);

      return res.status(200).json({ data: { servers: servers } });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route GET /api/server
   * @access Public
   */
  static getServers = async (_req, res) => {
    try {
      const servers = await ServerService.getServers();

      return res.status(200).json({
        data: {
          servers: servers.map((server) => {
            return {
              id: server.id,
              name: server.name,
              description: server.description,
              users: server.users,
              channels: server.channels,
              blacklist: server.blacklist
            };
          })
        }
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route POST /api/server
   * @access Private
   */
  static createServer = async (req, res) => {
    try {
      const { name, description } = ServerValidator.validateCreationInfo(
        req.body.name,
        req.body.description
      );
      const userId = req.session.user.id;

      const user = await UserService.getUserById(userId);
      const newServer = await ServerService.createServer(
        name,
        description,
        userId
      );
      const newGeneralChannel =
        await ChannelService.createGeneralChannelForServer(newServer);

      await ServerService.addChannel(newServer, newGeneralChannel);
      await UserService.addServer(user, newServer);

      return res.status(201).json({
        data: {
          url: `/server/${newServer.id}`
        }
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route PATCH /api/server
   * @access Private
   */
  static updateServer = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const { name, description } = ServerValidator.validateUpdateInfo(
        req.body.name,
        req.body.description
      );
      const userId = req.session.user.id;

      await ServerService.updateServer(serverId, name, description, userId);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route DELETE /api/server
   * @access Private
   */
  static deleteServer = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const userId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const user = await UserService.getUserById(userId);

      await ServerService.deleteServer(server, user);

      const joinedUsers = await UserService.getJoinedUsers(server.id);
      await Promise.all(
        joinedUsers.map(async (user) => {
          await UserService.removeServer(user, server);
        })
      );

      const channels = await ChannelService.getChannelsByServer(server);
      for (const channel of channels) {
        await ChannelService.deleteChannel(channel.id, true);
        await MessageService.deleteMessagesByChannel(channel);
      }

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route POST /api/server/join
   * @access Private
   */
  static joinServer = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const userId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const user = await UserService.getUserById(userId);

      await ServerService.addUser(server, user);
      await UserService.addServer(user, server);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route DELETE /api/server/leave
   * @access Private
   */
  static leaveServer = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const userId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const user = await UserService.getUserById(userId);

      await ServerService.removeUser(server, user);
      await UserService.removeServer(user, server);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route DELETE /api/server/kick
   * @access Private
   */
  static kickUser = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const kickedId = ServerValidator.validateMongooseId(
        req.body.userId,
        "userId"
      );
      const kickerId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const kicked = await UserService.getUserById(kickedId);
      const kicker = await UserService.getUserById(kickerId);

      await ServerService.blacklistUser(server, kicked, kicker);
      await UserService.removeServer(kicked, server);

      return res
        .status(200)
        .json({ data: { id: kicked.id, username: kicked.username } });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  static unkickUser = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const kickedId = ServerValidator.validateMongooseId(
        req.body.userId,
        "userId"
      );

      const server = await ServerService.getServerById(serverId);
      const user = await UserService.getUserById(kickedId);

      await ServerService.unblacklistUser(server, user);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route PATCH /api/server/edit/user
   * @access Private
   */
  static updateUser = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const editedId = ServerValidator.validateMongooseId(
        req.body.userId,
        "userId"
      );
      const { permissionLevel } = ServerValidator.validateUpdateUserInfo(
        req.body.permissionLevel
      );
      const editorId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const editedUser = await UserService.getUserById(editedId);
      const editorUser = await UserService.getUserById(editorId);

      await ServerService.updateUser(
        server,
        editedUser,
        editorUser,
        permissionLevel
      );

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @route PATCH /api/server/edit/channel
   * @access Private
   */
  static updateChannel = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const channelId = ServerValidator.validateMongooseId(
        req.body.channelId,
        "channelId"
      );
      const { name, description, permissionLevel } =
        ChannelValidator.validateUpdateInfo(
          req.body.name,
          req.body.description,
          req.body.permissionLevel
        );
      const editorId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const channel = await ChannelService.getChannelById(channelId);
      const editorUser = await UserService.getUserById(editorId);

      await ChannelService.updateChannel(
        server,
        channel,
        editorUser,
        name,
        description,
        permissionLevel
      );

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };
}
