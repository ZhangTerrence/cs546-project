import PrivateMessageRepository from "../models/privateMessage.js";
import { InternalServerError, NotFoundError } from "../utils/errors.js";

export default class PrivateMessageService {
  static getPrivateMessages = async () => {
    return await PrivateMessageRepository.find();
  };

  static getPrivateMessage = async (userA, userB) => {
    const privateMessage = await PrivateMessageRepository.findOne({
      users: { $in: [userA.id, userB.id] }
    });
    if (!privateMessage) {
      throw new NotFoundError(
        404,
        this.getPrivateMessage.name,
        "Unable to find private message."
      );
    }
    return privateMessage;
  };

  static getPrivateMessageById = async (privateMessageId) => {
    const privateMessage =
      await PrivateMessageRepository.findById(privateMessageId);
    if (!privateMessage) {
      throw new NotFoundError(
        404,
        this.getPrivateMessageById.name,
        "Private message not found."
      );
    }
    return privateMessage;
  };

  static createPrivateMessage = async (userA, userB) => {
    const newPrivateMessage = await PrivateMessageRepository.create({
      users: [userA.id, userB.id]
    });
    if (!newPrivateMessage) {
      throw new InternalServerError(
        500,
        this.createPrivateMessage.name,
        `Unable to create private message between ${userA.username} and ${userB.username}.`
      );
    }

    return newPrivateMessage;
  };

  static deletePrivateMessageById = async (privateMessage) => {
    const deletedPrivateMessage =
      await PrivateMessageRepository.findByIdAndDelete(privateMessage.id);
    if (!deletedPrivateMessage) {
      throw new InternalServerError(
        500,
        this.deletePrivateMessageById.name,
        "Unable to delete private message."
      );
    }
  };

  static deletePrivateMessage = async (userA, userB) => {
    const userBIndex = userA.friends.indexOf(userB.id);
    if (userBIndex === -1) {
      throw new NotFoundError(
        404,
        this.deletePrivateMessage.name,
        `${userB.username} not found in ${userA.username}'s friends.`
      );
    }

    const userAIndex = userB.friends.indexOf(userA.id);
    if (userAIndex === -1) {
      throw new NotFoundError(
        404,
        this.deletePrivateMessage.name,
        `${userA.username} not found in ${userB.username}'s friends.`
      );
    }

    const deletedPrivateMessage = await PrivateMessageRepository.deleteOne({
      users: { $in: [userA.id, userB.id] }
    });
    if (!deletedPrivateMessage) {
      throw new InternalServerError(
        500,
        this.deletePrivateMessage.name,
        `Unable to delete private message between ${userA.username} and ${userB.username}.`
      );
    }
  };

  static deleteUserPrivateMessages = async (user) => {
    const deletedPrivateMessages = await PrivateMessageRepository.deleteMany({
      users: { $in: user.id }
    });
    if (!deletedPrivateMessages) {
      throw new InternalServerError(
        500,
        this.deleteUserPrivateMessages.name,
        `Unable to delete ${user.username}'s private messages.`
      );
    }
  };

  static addMessage = async (privateMessage, message) => {
    privateMessage.messages.push(message.id);
    const addedMessage = await privateMessage.save();
    if (!addedMessage) {
      throw new InternalServerError(
        500,
        this.addMessage.name,
        "Unable to add message to private message."
      );
    }
  };

  static removeMessage = async (privateMessage, message) => {
    const messageIndex = privateMessage.messages.indexOf(message.id);
    if (messageIndex === -1) {
      throw new NotFoundError(
        404,
        this.removeMessage.name,
        "Message not found in private message."
      );
    }

    privateMessage.messages.splice(messageIndex, 1);
    const removedMessage = await privateMessage.save();
    if (!removedMessage) {
      throw new InternalServerError(
        500,
        this.removeMessage.name,
        "Unable to delete message."
      );
    }
  };
}
