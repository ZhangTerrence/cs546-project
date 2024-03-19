import mongoose from "mongoose";

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    creatorId: {
      type: String,
      required: true
    },
    users: {
      type: [
        {
          id: String,
          permissionLevel: Number
        }
      ],
      required: true
    },
    channels: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const Server = mongoose.model("Server", serverSchema);

export default Server;
