import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."]
    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required."]
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
