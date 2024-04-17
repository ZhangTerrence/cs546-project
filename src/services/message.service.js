import MessageRepository from "../models/message.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../utils/errors.js";

export default class MessageService {
  static getMessageById = async (messageId) => {
    const message = await MessageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError(
        404,
        this.getMessageById.name,
        "Message not found."
      );
    }
    return message;
  };

  static createMessage = async (
    userId,
    channelId,
    privateMessageId,
    message
  ) => {
    if (!channelId && !privateMessageId) {
      throw new BadRequestError(
        400,
        this.createMessage.name,
        "Message must belong to either a channel or a private message."
      );
    }

    if (channelId && privateMessageId) {
      throw new BadRequestError(
        400,
        this.createMessage.name,
        "Message must belong to either a channel or a private message."
      );
    }

    let newMessage;
    if (channelId) {
      newMessage = await MessageRepository.create({
        userId: userId,
        channelId: channelId,
        message: message
      });
    } else {
      newMessage = await MessageRepository.create({
        userId: userId,
        privateMessageId: privateMessageId,
        message: message
      });
    }
    if (!newMessage) {
      throw new InternalServerError(
        500,
        this.createMessage.name,
        "Unable to create message."
      );
    }

    return newMessage;
  };
}
