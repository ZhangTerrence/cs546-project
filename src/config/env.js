import "dotenv/config";

const env = {
  PORT: process.env.PORT || 8080,
  MONGO_CONNECTION_STRING:
    process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017/",
};

export default env;
