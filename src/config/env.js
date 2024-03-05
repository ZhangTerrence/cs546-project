import "dotenv/config";

// Defaults to dev environment if no env variables are found.
const env = {
  NODE_ENV: process.env.NODE_ENV || "dev",
  PORT: process.env.PORT || 8080,
  MONGO_CONNECTION_STRING:
    process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017/nexus",
  SESSION_SECRET: process.env.SESSION_SECRET || "express_session_secret"
};

export default env;
