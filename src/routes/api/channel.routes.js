import ChannelController from "../../controllers/channel.controller.js";
import routeType from "../../middleware/routeType.js";
import isAuthenticated from "../../middleware/authentication.js";

import express from "express";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(ChannelController.getChannels)
  .post(routeType("api"), isAuthenticated(), ChannelController.createChannel)
  .delete(routeType("api"), isAuthenticated(), ChannelController.deleteChannel);

export default router;
