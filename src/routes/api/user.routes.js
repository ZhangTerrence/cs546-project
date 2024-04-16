import UserController from "../../controllers/user.controller.js";
import routeType from "../../middleware/routeType.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/login").post(routeType("api"), UserController.loginUser);
router.route("/logout").post(routeType("api"), UserController.logoutUser);

router
  .route("/")
  .get(UserController.getUsers)
  .post(UserController.createUser)
  .patch(routeType("api"), isAuthenticated(), UserController.updateUser)
  .delete(routeType("api"), isAuthenticated(), UserController.deleteUser);

router
  .route("/friend/send")
  .post(routeType("api"), isAuthenticated(), UserController.sendFriendRequest);
router
  .route("/friend/reject")
  .delete(
    routeType("api"),
    isAuthenticated(),
    UserController.rejectFriendRequest
  );
router
  .route("/friend")
  .post(routeType("api"), isAuthenticated(), UserController.addFriend)
  .delete(routeType("api"), isAuthenticated(), UserController.removeFriend);

export default router;
