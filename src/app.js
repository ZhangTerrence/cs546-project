import express from "express";
import env from "./config/env.js";
import database from "./config/database.js";

const app = express();

database();

app.use("/api", () => {
  console.log("hello world");
});

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}.`);
});
