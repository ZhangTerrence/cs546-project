import PrivateMessageService from "../services/privateMessage.service.js";
import { BaseError } from "../utils/errors.js";

export default class PrivateMessageController {
  /**
   * @description Gets all private messages.
   * @route GET /api/privateMessage
   * @access Public
   */
  static getPrivateMessages = async (_req, res) => {
    try {
      const privateMessages = await PrivateMessageService.getPrivateMessages();

      return res
        .status(200)
        .json({ data: { privateMessages: privateMessages } });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };
}
