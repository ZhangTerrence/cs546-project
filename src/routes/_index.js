import mainRoutes from "./mainRoutes.js";
import userRoutes from "./userRoutes.js";

const constructorMethod = (app) => {
  app.use("/", mainRoutes);
  app.use("/user", userRoutes);

  app.use("*", (_req, res) => {
    return res.status(404).json({ error: "Route not found." });
  });
};

export default constructorMethod;
