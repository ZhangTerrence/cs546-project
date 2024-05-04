import UserService from "../services/user.service.js";
import ChannelService from "../services/channel.service.js";
import ServerService from "../services/server.service.js";
import MessageService from "../services/message.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { ChannelValidator, ServerValidator } from "../utils/validators.js";

export default class ChannelController {
  /**
   * @route GET /server/:serverId/channel/:channelId
   * @access Private
   */
  static renderChannelMainPage = async (req, res) => {
    try {
      const serverId = ServerValidator.validateMongooseId(
        req.params.serverId,
        "serverId"
      );
      const channelId = ChannelValidator.validateMongooseId(
        req.params.channelId,
        "channelId"
      );
      const userId = req.session.user.id;

      const channel = await ChannelService.getChannelById(channelId);
      const user = await UserService.getUserById(userId);

      if (serverId !== channel.serverId) {
        return res.status(500).render("error", {
          statusCode: 500,
          message: "Channel doesn't belong to server."
        });
      }

      const server = await ServerService.getServerById(channel.serverId);
      const serverUsers = server.users.map((userObj) => userObj.id);

      const messages = await Promise.all(
        channel.messages.map(async (messageId) => {
          const message = await MessageService.getMessageById(messageId);
          const user = await UserService.getUserById(message.userId);

          return {
            id: message.id,
            userId: user.id,
            username: user.username,
            message: message.message
          };
        })
      );

      if (serverUsers.includes(user.id)) {
        const userId = req.session.user.id;
        const userPerms = server.users.find(
          (userObj) => userObj.id === userId
        ).permissionLevel;

        if (userPerms >= channel.permissionLevel) {
          return res.render("channel/main", {
            stylesheets: [
              `<link rel="stylesheet" href="/public/css/channel/main.css" />`
            ],
            scripts: [`<script src="/public/js/channel/main.js"></script>`],
            serverId: channel.serverId,
            name: channel.name,
            description: channel.description,
            messages: messages
          });
        }
      }

      return res.status(403).render("error", {
        statusCode: 403,
        message: "Unauthorized."
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
   * @route GET /api/channel
   * @access Private
   */
  static getChannels = async (_req, res) => {
    try {
      const channels = await ChannelService.getChannels();

      return res.status(200).json({ data: { channels: channels } });
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
   * @route POST /api/channel
   * @access Private
   */
  static createChannel = async (req, res) => {
    try {
      const { name, description, permissionLevel } =
        ChannelValidator.validateCreationInfo(
          req.body.name,
          req.body.description,
          req.body.permissionLevel
        );
      const serverId = ServerValidator.validateMongooseId(
        req.body.serverId,
        "serverId"
      );
      const userId = req.session.user.id;

      const server = await ServerService.getServerById(serverId);
      const user = await UserService.getUserById(userId);

      const newChannel = await ChannelService.createChannel(
        name,
        description,
        server,
        permissionLevel,
        user
      );
      await ServerService.addChannel(server, newChannel);

      return res.status(201).json({
        data: {
          url: `/server/${server.id}/channel/${newChannel.id}`
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
   * @route DELETE /api/channel
   * @access Private
   */
  static deleteChannel = async (req, res) => {
    try {
      const channelId = ChannelValidator.validateMongooseId(
        req.body.channelId,
        "channelId"
      );
      const userId = req.session.user.id;

      const user = await UserService.getUserById(userId);
      const channel = await ChannelService.getChannelById(channelId);
      const server = await ServerService.getServerById(channel.serverId);

      await ServerService.removeChannel(server, channel, user);
      await ChannelService.deleteChannel(channel.id, false);
      await MessageService.deleteMessagesByChannel(channel);

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
