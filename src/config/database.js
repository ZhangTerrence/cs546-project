import mongoose from "mongoose";
import env from "./env.js";

const database = async () => {
  try {
    const connection = await mongoose.connect(env.MONGO_CONNECTION_STRING);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error connecting: ${error.message}`);
    process.exit(1);
  }
};

export default database;
