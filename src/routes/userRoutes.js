import * as userController from "../controllers/userController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.route("/:id").get(userController.renderUserProfilePage);

router
  .route("/friendRequest/create")
  .post(isAuthenticated(), userController.createFriendRequest);
router
  .route("/friendRequest/accept")
  .post(isAuthenticated(), userController.acceptFriendRequest);
router.route("/friendRequest/reject");

export default router;
