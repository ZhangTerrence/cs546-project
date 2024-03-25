import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import serverRoutes from "./serverRoutes.js";
import channelRoutes from "./channelRoutes.js";
import privateMessageRoutes from "./privateMessageRoutes.js";
import messageRoutes from "./messageRoutes.js";

const constructorMethod = (app) => {
  app.use("/", authRoutes);
  app.use("/user", userRoutes);
  app.use("/server", serverRoutes);
  app.use("/server/:serverId/channel", channelRoutes);
  app.use("/privateMessage", privateMessageRoutes);
  app.use("/message", messageRoutes);

  app.route("/").get(async (_req, res) => {
    return res.render("landing");
  });

  app.route("/teapot").get(async (_req, res) => {
    return res.status(418).json("I'm a teapot.");
  });

  app.use("*", (_req, res) => {
    return res.render("error/400", {
      statusCode: 404,
      error: "Route not found."
    });
  });
};

export default constructorMethod;
