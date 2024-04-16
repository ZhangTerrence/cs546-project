import ServerController from "../../controllers/server.controller.js";
import routeType from "../../middleware/routeType.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/:name").get(routeType("api"), ServerController.getServersByName);

router
  .route("/")
  .get(ServerController.getServers)
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

export default router;
