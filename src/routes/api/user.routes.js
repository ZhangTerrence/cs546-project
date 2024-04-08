import UserController from "../../controllers/user.controller.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/signup").post(UserController.createUser);
router.route("/login").post(UserController.authenticateUser);
router.route("/logout").post(UserController.logoutUser);

router
  .route("/")
  .patch(isAuthenticated(), UserController.updateUser)
  .delete(isAuthenticated(), UserController.deleteUser);

router
  .route("/friend/create")
  .post(isAuthenticated(), UserController.createFriendRequest);
router
  .route("/friend/accept")
  .post(isAuthenticated(), UserController.acceptFriendRequest);
router
  .route("/friend/reject")
  .post(isAuthenticated(), UserController.rejectFriendRequest);
router
  .route("/friend/remove")
  .delete(isAuthenticated(), UserController.removeFriend);

export default router;
