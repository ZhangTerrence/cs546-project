import PrivateMessageRepository from "../models/privateMessage.js";
import { InternalServerError } from "../utils/errors.js";

export default class PrivateMessageService {
  /**
   * @description Creates a private message between two user.
   * @param {string} userId1 The id of the first user.
   * @param {string} userId2 The id of the second user.
   * @throws InternalServerError If it fails to create the private message.
   */
  static createPrivateMessage = async (userId1, userId2) => {
    const createdPrivateMessage = await PrivateMessageRepository.create({
      users: [userId1, userId2]
    });
    if (!createdPrivateMessage) {
      throw new InternalServerError(
        500,
        `create(): ${[userId1, userId2]}`,
        "Unable to create private message."
      );
    }
  };

  /**
   * @description Deletes a private message.
   * @param {string} userId1 The id of the first user.
   * @param {string} userId2 The id of the second user.
   * @throws InternalServerError If it fails to delete the private message.
   */
  static deletePrivateMessage = async (userId1, userId2) => {
    const deletedPrivateMessage = await PrivateMessageRepository.deleteOne({
      users: { $in: [userId1, userId2] }
    });
    if (!deletedPrivateMessage) {
      throw new InternalServerError(
        500,
        `deleteOne(): ${[userId1, userId2]}`,
        "Unable to delete private message."
      );
    }
  };

  /**
   * @description Deletes all of an user's private messages.
   * @param {string} userId The given user id.
   * @throws InternalServerError If it fails to delete the private messages.
   */
  static deleteUserPrivateMessages = async (userId) => {
    const deletedPrivateMessages = await PrivateMessageRepository.deleteMany({
      users: { $in: userId }
    });

    if (!deletedPrivateMessages) {
      throw new InternalServerError(
        500,
        `deleteMany(): ${userId}`,
        "Unable to delete private messages."
      );
    }
  };
}
