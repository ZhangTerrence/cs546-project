import PrivateMessageRepository from "../models/privateMessage.js";
import { InternalServerError, NotFoundError } from "../utils/errors.js";

export default class PrivateMessageService {
  static getPrivateMessages = async () => {
    return await PrivateMessageRepository.find();
  };

  static createPrivateMessage = async (userA, userB) => {
    const createdPrivateMessage = await PrivateMessageRepository.create({
      users: [userA.id, userB.id]
    });
    if (!createdPrivateMessage) {
      throw new InternalServerError(
        500,
        this.createPrivateMessage.name,
        `Unable to create private message between ${userA.username} and ${userB.username}.`
      );
    }
  };

  static deletePrivateMessage = async (userA, userB) => {
    const userBIndex = userA.friends.indexOf(userB.id);
    if (userBIndex == -1) {
      throw new NotFoundError(
        404,
        this.removeFriend.name,
        `${userB.username} not found in ${userA.username}'s friends.`
      );
    }

    const userAIndex = userB.friends.indexOf(userA.id);
    if (userAIndex == -1) {
      throw new NotFoundError(
        404,
        this.removeFriend.name,
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
}
