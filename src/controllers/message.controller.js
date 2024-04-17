import ChannelService from "../services/channel.service.js";
import MessageService from "../services/message.service.js";
import PrivateMessageService from "../services/privateMessage.service.js";
import UserService from "../services/user.service.js";
import { BaseError } from "../utils/errors.js";
import { MessageValidator } from "../utils/validators.js";

export default class MessageController {
  /**
   * @route POST /api/message
   * @access Private
   */
  static createMessage = async (req, res) => {
    try {
      const { channelId, privateMessageId, message } =
        MessageValidator.validateCreationInfo(
          req.body.channelId,
          req.body.privateMessageId,
          req.body.message
        );
      const userId = req.session.user.id;

      const newMessage = await MessageService.createMessage(
        userId,
        channelId,
        privateMessageId,
        message
      );
      if (channelId) {
        const channel = await ChannelService.getChannelById(channelId);

        await ChannelService.addMessage(channel, newMessage);
      } else {
        const privateMessage =
          await PrivateMessageService.getPrivateMessageById(privateMessageId);

        await PrivateMessageService.addMessage(privateMessage, newMessage);
      }

      const user = await UserService.getUserById(newMessage.userId);

      return res.status(201).json({
        data: {
          userId: user.id,
          username: user.username,
          message: newMessage.message
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
}
