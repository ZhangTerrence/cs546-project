import userRoutes from "./userRoutes.js";
import serverRoutes from "./serverRoutes.js";
import channelRoutes from "./channelRoutes.js";
import privateMessageRoutes from "./privateMessageRoutes.js";
import messageRoutes from "./messageRoutes.js";
import authRoutes from "./authRoutes.js";

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/server", serverRoutes);
  app.use("/server/:serverId/channel", channelRoutes);
  app.use("/privateMessage", privateMessageRoutes)
  app.use("/message", messageRoutes);
  app.use("/", authRoutes);

  app.route("/").get(async (_req, res) => {
    return res.render("landing");
  });

  app.use("*", (_req, res) => {
    return res.status(404).json({ error: "Route not found." });
  });
};

export default constructorMethod;
