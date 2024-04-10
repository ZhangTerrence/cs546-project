import UserController from "../../controllers/user.controller.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/login").post(UserController.loginUser);
router.route("/logout").post(UserController.logoutUser);

router
  .route("/")
  .get(UserController.getUsers)
  .post(UserController.createUser)
  .patch(isAuthenticated(), UserController.updateUser)
  .delete(isAuthenticated(), UserController.deleteUser);

router
  .route("/friend/send")
  .post(isAuthenticated(), UserController.sendFriendRequest);
router
  .route("/friend/reject")
  .delete(isAuthenticated(), UserController.rejectFriendRequest);
router
  .route("/friend")
  .post(isAuthenticated(), UserController.addFriend)
  .delete(isAuthenticated(), UserController.removeFriend);

export default router;
