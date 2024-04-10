import MessageRepository from "../models/message.js";
import { NotFoundError } from "../utils/errors.js";

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
}
