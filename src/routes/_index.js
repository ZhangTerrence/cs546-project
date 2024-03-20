import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/", authRoutes);

  app.route("/").get(async (_req, res) => {
    return res.render("landing");
  });

  app.use("*", (_req, res) => {
    return res.status(404).json({ error: "Route not found." });
  });
};

export default constructorMethod;
