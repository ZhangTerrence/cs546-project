import * as privateMessageController from "../controllers/privateMessageController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router
  .route("/")
  .post(isAuthenticated(), privateMessageController.createPrivateMessage);

export default router;
