import * as userController from "../controllers/userController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.route("/:id").get(userController.renderUserProfilePage);

router
  .route("/friend")
  .post(isAuthenticated(), userController.createFriendRequest)
  .delete(isAuthenticated(), userController.removeFriend);
router
  .route("/friendRequest/accept")
  .post(isAuthenticated(), userController.acceptFriendRequest);
router
  .route("/friendRequest/reject")
  .post(isAuthenticated(), userController.rejectFriendRequest);

export default router;
