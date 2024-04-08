import express from "express";
import session from "express-session";
import path from "path";
import logger from "./middleware/logger.js";
import configRoutes from "./routes/_index.js";
import database from "./config/database.js";
import env from "./config/env.js";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

database();

const staticRoutes = express.static(path.join(__dirname, "/public"));

app.use("/public", staticRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "nexus",
    secret: env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 60 * 60 * 1000, sameSite: "strict" }
  })
);

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

if (env.NODE_ENV == "dev") {
  app.use(logger);
}

configRoutes(app);

if (env.NODE_ENV == "dev") {
  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}.`);
  });
}

export default app;
