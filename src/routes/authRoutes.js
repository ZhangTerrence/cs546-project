import * as authController from "../controllers/authController.js";
import express from "express";

const router = express.Router();

router
  .route("/signup")
  .get(authController.renderSignupPage)
  .post(authController.createUser);

router
  .route("/login")
  .get(authController.renderLoginPage)
  .post(authController.authUser);

router.route("/logout").post(authController.logout);

export default router;
