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
    if (!message || message.trim().length === 0) {
      throw new BadRequestError(
        400,
        this.createMessage.name,
        "Message content cannot be empty."
      );
    }
  
    if (message.length > 255) {
      throw new BadRequestError(
        400,
        this.createMessage.name,
        "Message must be at most 255 characters long."
      );
    }
    
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

  static deleteMessage = async (messageId) => {
    const deletedMessage = await MessageRepository.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      throw new InternalServerError(
        500,
        this.deleteMessage.name,
        "Unable to delete message."
      );
    }
  };

  static deleteMessagesByChannel = async (channel) => {
    const deletedMessages = await MessageRepository.deleteMany({
      channelId: channel.id
    });
    if (!deletedMessages) {
      throw new InternalServerError(
        500,
        this.deleteMessage.name,
        `Unable to delete messages from ${channel.name}.`
      );
    }
  };

  static deleteMessagesByPrivateMessage = async (privateMessage) => {
    const deletedMessages = await MessageRepository.deleteMany({
      privateMessageId: privateMessage.id
    });
    if (!deletedMessages) {
      throw new InternalServerError(
        500,
        this.deleteMessage.name,
        "Unable to delete messages from private message."
      );
    }
  };
}
