import express from "express";
import env from "./config/env.js";
import database from "./config/database.js";
import configRoutes from "./routes/_index.js";
import session from "express-session";

const app = express();

database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "nexus",
    secret: env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  })
);

configRoutes(app);

if (env.NODE_ENV == "dev") {
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}.`);
  });
}

export default app;
