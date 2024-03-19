import userRoutes from "./userRoutes.js";
import mainRoutes from "./mainRoutes.js";

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/", mainRoutes);

  app.use("*", (_req, res) => {
    return res.status(404).json({ error: "Route not found." });
  });
};

export default constructorMethod;
