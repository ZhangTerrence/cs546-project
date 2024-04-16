import PrivateMessageController from "../../controllers/privateMessage.controller.js";
import routeType from "../../middleware/routeType.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(routeType("api"), PrivateMessageController.getPrivateMessages);

export default router;
