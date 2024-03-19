import * as userController from "../controllers/userController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router
  .route("/:id")
  .get(isAuthenticated(), userController.renderUserProfilePage);

router.route("/api/:id").get(userController.getUser);

export default router;
