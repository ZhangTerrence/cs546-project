import MessageService from "../services/message.service.js";
import PrivateMessageService from "../services/privateMessage.service.js";
import UserService from "../services/user.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { PrivateMessageValidator } from "../utils/validators.js";

export default class PrivateMessageController {
  /**
   * @route GET /privateMessage/:privateMessageId
   * @access Private
   */
  static renderPrivateMessageMainPage = async (req, res) => {
    try {
      const privateMessageId = PrivateMessageValidator.validateMongooseId(
        req.params.privateMessageId,
        "channelId"
      );
      const userId = req.session.user.id;

      const privateMessage =
        await PrivateMessageService.getPrivateMessageById(privateMessageId);
      const userA = await UserService.getUserById(privateMessage.users[0]);
      const userB = await UserService.getUserById(privateMessage.users[1]);

      const messages = await Promise.all(
        privateMessage.messages.map(async (messageId) => {
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

      if (privateMessage.users.includes(userId)) {
        return res.render("privateMessage/main", {
          stylesheets: [
            `<link rel="stylesheet" href="/public/css/privateMessage/main.css" />`
          ],
          scripts: [
            `<script src="/public/js/privateMessage/main.js"></script>`
          ],
          userAId: userA.id,
          userAUsername: userA.username,
          userBId: userB.id,
          userBUsername: userB.username,
          messages: messages
        });
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
   * @route GET /api/privateMessage
   * @access Private
   */
  static getPrivateMessages = async (_req, res) => {
    try {
      const privateMessages = await PrivateMessageService.getPrivateMessages();

      return res
        .status(200)
        .json({ data: { privateMessages: privateMessages } });
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
