import ServerController from "../../controllers/server.controller.js";
import routeType from "../../middleware/routeType.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/:name").get(routeType("api"), ServerController.getServersByName);

router
  .route("/")
  .get(routeType("api"), ServerController.getServers)
  .post(routeType("api"), isAuthenticated(), ServerController.createServer)
  .patch(routeType("api"), isAuthenticated(), ServerController.updateServer)
  .delete(routeType("api"), isAuthenticated(), ServerController.deleteServer);

router
  .route("/join")
  .post(routeType("api"), isAuthenticated(), ServerController.joinServer);
router
  .route("/leave")
  .delete(routeType("api"), isAuthenticated(), ServerController.leaveServer);
router
  .route("/kick")
  .delete(routeType("api"), isAuthenticated(), ServerController.kickUser);
router
  .route("/unkick")
  .delete(routeType("api"), isAuthenticated(), ServerController.unkickUser);
router
  .route("/edit/user")
  .patch(routeType("api"), isAuthenticated(), ServerController.updateUser);
router
  .route("/edit/channel")
  .patch(routeType("api"), isAuthenticated(), ServerController.updateChannel);

export default router;
