import express from "express";
import env from "./config/env.js";
import database from "./config/database.js";

const app = express();

database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}.`);
});
