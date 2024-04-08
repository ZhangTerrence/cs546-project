import PrivateMessageController from "../../controllers/privateMessage.controller.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(isAuthenticated(), PrivateMessageController.renderPrivateMessage);

export default router;
