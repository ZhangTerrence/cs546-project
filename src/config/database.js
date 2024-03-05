import mongoose from "mongoose";
import env from "./env.js";

const database = async () => {
  try {
    const connection = await mongoose.connect(env.MONGO_CONNECTION_STRING);
    if (env.NODE_ENV == "dev") {
      console.log(
        `MongoDB connected to database: ${connection.connection.name}`
      );
    }
  } catch (error) {
    console.error(`Error connecting: ${error.message}`);
    process.exit(1);
  }
};

export default database;
