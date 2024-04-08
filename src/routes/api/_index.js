import userRoutes from "./userRoutes.js";
import serverRoutes from "./serverRoutes.js";
import privateMessageRoutes from "./privateMessageRoutes.js";
import channelRoutes from "./channelRoutes.js";
import messageRoutes from "./messageRoutes.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.use("/user", userRoutes);
router.use("/server", serverRoutes);
router.use("/privateMessage", privateMessageRoutes);
router.use("/channel", channelRoutes);
router.use("/message", messageRoutes);

export default router;
