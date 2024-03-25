import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      default: ""
    },
    servers: {
      type: [String],
      default: []
    },
    friends: {
      type: [String],
      default: []
    },
    friendRequests: {
      type: [String],
      default: []
    },
    darkMode: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
