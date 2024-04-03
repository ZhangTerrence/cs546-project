import ChannelController from "../../controllers/channel.controller.js";
import isAuthenticated from "../../middleware/auth.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/").post(isAuthenticated(), ChannelController.renderChannel);

export default router;
