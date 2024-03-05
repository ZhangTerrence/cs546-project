import express from "express";
import env from "./config/env.js";
import database from "./config/database.js";
import configRoutes from "./routes/_index.js";

const app = express();

database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configRoutes(app);

if (env.NODE_ENV == "dev") {
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}.`);
  });
}

export default app;
