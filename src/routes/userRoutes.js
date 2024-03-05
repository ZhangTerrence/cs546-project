import * as userController from "../controllers/userController.js";
import express from "express";

const router = express.Router();

router.route("/").get(userController.getAllUsers);

export default router;
