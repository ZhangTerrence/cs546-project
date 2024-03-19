import * as mainController from "../controllers/mainController.js";
import express from "express";

const router = express.Router();

router.route("/").get(mainController.renderLandingPage);

router
  .route("/signup")
  .get(mainController.renderSignupPage)
  .post(mainController.createUser);

router
  .route("/login")
  .get(mainController.renderLoginPage)
  .post(mainController.authUser);

router.route("/logout").post(mainController.logout);

export default router;
