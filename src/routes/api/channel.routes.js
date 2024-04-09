import ChannelController from "../../controllers/channel.controller.js";
import isAuthenticated from "../../middleware/authentication.js";

import express from "express";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(isAuthenticated(), ChannelController.createChannel)
  .delete(isAuthenticated(), ChannelController.deleteChannel);

export default router;
