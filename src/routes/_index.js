import viewRoutes from "./view/_index.js";
import apiRoutes from "./api/_index.js";

const constructorMethod = (app) => {
  app.use("/", viewRoutes);
  app.use("/api", apiRoutes);

  app.route("/teapot").get(async (_req, res) => {
    return res.status(418).render("error/400", {
      statusCode: 418,
      message: "Teapot."
    });
  });

  app.use("*", (_req, res) => {
    return res.status(404).render("error/400", {
      statusCode: 404,
      message: "Route not found."
    });
  });
};

export default constructorMethod;
