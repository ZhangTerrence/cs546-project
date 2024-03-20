import * as channelController from "../controllers/channelController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.route("/").post(isAuthenticated(), channelController.createChannel);

export default router;
