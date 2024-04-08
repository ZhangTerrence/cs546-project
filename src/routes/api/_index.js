import userRoutes from "./user.routes.js";
import serverRoutes from "./server.routes.js";
import privateMessageRoutes from "./privateMessage.routes.js";
import channelRoutes from "./channel.routes.js";
import messageRoutes from "./message.routes.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.use("/user", userRoutes);
router.use("/server", serverRoutes);
router.use("/privateMessage", privateMessageRoutes);
router.use("/channel", channelRoutes);
router.use("/message", messageRoutes);

export default router;
