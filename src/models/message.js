import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    channelId: {
      type: String
    },
    privateMessageId: {
      type: String
    },
    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
