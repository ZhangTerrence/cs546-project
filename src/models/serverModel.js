import mongoose from "mongoose";

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
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
          id: {
            type: String,
            required: true
          },
          permissionLevel: {
            type: Number,
            required: true
          }
        }
      ],
      required: true,
      _id: false
    },
    channels: {
      type: [String],
      default: []
    },
    blacklist: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const Server = mongoose.model("Server", serverSchema);

export default Server;
