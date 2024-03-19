import * as mainController from "../controllers/mainController.js";
import express from "express";

const router = express.Router();

router.route("/landing").get(mainController.renderLandingPage);

router.route("/signup").get(mainController.renderSignupPage);

router.route("/login").get(mainController.renderLoginPage);

router.route("/api/signup").post(mainController.createUser);

router.route("/api/login").post(mainController.authUser);

router.route("/api/logout").post(mainController.logout);

export default router;
