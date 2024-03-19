import mongoose from "mongoose";

const privateMessage = new mongoose.Schema(
  {
    users: {
      type: [String]
    },
    messages: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const PrivateMessage = mongoose.model("PrivateMessage", privateMessage);

export default PrivateMessage;
