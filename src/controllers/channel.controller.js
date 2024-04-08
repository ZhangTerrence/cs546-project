import ChannelService from "../services/channel.service.js";
import ServerService from "../services/server.service.js";
import MessageService from "../services/message.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { ChannelValidator } from "../utils/validators.js";
import UserService from "../services/user.service.js";

export default class ChannelController {
  /**
   * @description Renders a channel page.
   * @route GET /channel/:channelId
   * @access Public
   */
  static renderChannelPage = async (req, res) => {
    try {
      const channelId = ChannelValidator.validateMongooseId(
        req.params.channelId,
        "channelId"
      );
      console.log(channelId);

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
}
