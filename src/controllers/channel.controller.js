import UserService from "../services/user.service.js";
import ChannelService from "../services/channel.service.js";
import ServerService from "../services/server.service.js";
import MessageService from "../services/message.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { ChannelValidator, ServerValidator } from "../utils/validators.js";

export default class ChannelController {
  /**
   * @route GET /channel/:channelId
   * @access Public
   */
  static renderChannelPage = async (req, res) => {
    try {
      const channelId = ChannelValidator.validateMongooseId(
        req.params.channelId,
        "channelId"
      );

      const channel = await ChannelService.getChannelById(channelId);

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

      if (
        req.session.user &&
        req.session.user.id &&
        serverUsers.includes(req.session.user.id)
      ) {
        return res.render("channel/channel", {
          name: channel.name,
          description: channel.description,
          messages: messages,
          canSend: true
        });
      }

      return res.render("channel/channel", {
        name: channel.name,
        description: channel.description,
        messages: channel.messages,
        canSend: false
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} ${error.toString()}`);
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
   * @route GET /api/channel
   * @access Public
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

      const server = await ServerService.getServerById(serverId);
      const newChannel = await ChannelService.createChannel(
        name,
        description,
        server,
        permissionLevel
      );

      await ServerService.addChannel(server, newChannel);

      return res.status(200).json({
        data: {
          url: `/channel/${newChannel.id}`
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
      await ChannelService.deleteChannel(channel.id);

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
