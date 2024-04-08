import MessageRepository from "../models/message.js";
import { NotFoundError } from "../utils/errors.js";

export default class MessageService {
  /**
   * @description Gets a message by its id.
   * @param {string} messageId The given messaage id.
   * @returns Message.
   * @throws NotFoundError If the message is not found.
   */
  static getMessageById = async (messageId) => {
    const message = await MessageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError(
        404,
        `messageId: ${messageId}`,
        "Message not found."
      );
    }

    return message;
  };
}
