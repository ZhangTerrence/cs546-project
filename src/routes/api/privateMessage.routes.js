import PrivateMessageController from "../../controllers/privateMessage.controller.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/").get(PrivateMessageController.getPrivateMessages);

export default router;
