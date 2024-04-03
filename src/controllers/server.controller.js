import ChannelService from "../services/channel.service.js";
import ServerService from "../services/server.service.js";
import UserService from "../services/user.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { ServerValidator } from "../utils/validators.js";

export default class ServerController {
  /**
   * @description Renders a server's main page.
   * @route GET /server/:serverId
   * @access Public
   */
  static renderServerPage = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.params.serverId,
        "serverId"
      );

      const server = await ServerService.getServerById(serverId);

      const users = await Promise.all(
        server.users.map(async (userObj) => {
          const user = await UserService.getUserById(userObj.id);

          return {
            id: user.id,
            username: user.username
          };
        })
      );

      if (req.session.user && req.session.user.id) {
        const userId = req.session.user.id;

        if (userId === server.creatorId) {
          return res.render("server/server", {
            name: server.name,
            description: server.description,
            users: users,
            owner: true,
            member: true
          });
        } else if (server.users.map((userObj) => userObj.id).includes(userId)) {
          return res.render("server/server", {
            name: server.name,
            description: server.description,
            users: users,
            owner: false,
            member: true
          });
        }
      }

      return res.render("server/server", {
        name: server.name,
        description: server.description,
        users: users,
        owner: false,
        member: false
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        if ((!error) instanceof InternalServerError) {
          return res.status(error.statusCode).render("error/500", {
            statusCode: error.statusCode,
            message: error.message
          });
        } else {
          return res.status(error.statusCode).render("error/400", {
            statusCode: error.statusCode,
            message: error.message
          });
        }
      } else {
        console.log(error);
        return res.status(500).render("error/500", {
          statusCode: 500,
          message: "Code went boom."
        });
      }
    }
  };

  /**
   * @description Gets servers by name.
   * @route GET /api/server/:name
   * @access Public
   */
  static getServersByName = async (req, res) => {
    try {
      const { name } = req.params;

      const servers = await ServerService.getSimilarServersByName(name);

      return res.status(200).json({ data: { servers } });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Creates a server.
   * @route POST /api/server
   * @access Private
   */
  static createServer = async (req, res) => {
    try {
      const { name } = ServerValidator.validateCreationInfo(req.body.name);
      const userId = req.session.user.id;

      const user = await UserService.getUserById(userId);

      const newServerId = await ServerService.generateNewServerIdFromName(name);

      const newGeneralChannel =
        await ChannelService.createGeneralChannelForServer(newServerId);

      await UserService.addServer(user, newServerId);

      await ServerService.createServer(
        newServerId,
        name,
        userId,
        newGeneralChannel.id
      );

      return res.status(201).json({
        data: {
          url: `/server/${newServerId}`
        }
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Deletes a server.
   * @route DELETE /api/server
   * @access Private
   */
  static deleteServer = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );

      const server = await ServerService.getServerById(serverId);

      await ChannelService.deleteServerChannels(server.id);

      const joinedUsers = await UserService.getJoinedUsers(server.id);
      joinedUsers.forEach(async (user) => {
        await UserService.removeServer(user, server);
      });

      await ServerService.deleteServer(server.id);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Joins a server.
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

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Leaves a server.
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

      if (user.id === server.creatorId) {
        await ChannelService.deleteServerChannels(server.id);

        const joinedUsers = await UserService.getJoinedUsers(server.id);
        joinedUsers.forEach(async (user) => {
          await UserService.removeServer(user, server);
        });

        await ServerService.deleteServer(server.id);
      } else {
        await UserService.removeServer(user, server);

        await ServerService.removeUser(server, user.id);
      }

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Kicks user from a server.
   * @route POST /api/server/kick
   * @access Private
   */
  static kickUser = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const userId = ServerValidator.validateMongooseId(
        req.body.userId,
        "userId"
      );

      const server = await ServerService.getServerById(serverId);
      const user = await UserService.getUserById(userId);

      await UserService.removeServer(user, server);

      await ServerService.blacklistUser(server, user.id);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };
}
