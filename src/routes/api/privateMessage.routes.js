import PrivateMessageController from "../../controllers/privateMessage.controller.js";
import isAuthenticated from "../../middleware/authentication.js";
import routeType from "../../middleware/routeType.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    routeType("api"),
    isAuthenticated(),
    PrivateMessageController.getPrivateMessages
  );

export default router;
