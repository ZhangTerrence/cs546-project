import * as messageController from "../controllers/messageController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.route("/").post(isAuthenticated(), messageController.createMessage);

export default router;
