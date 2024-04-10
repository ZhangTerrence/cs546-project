import ServerController from "../../controllers/server.controller.js";
import isAuthenticated from "../../middleware/authentication.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/:name").get(ServerController.getServersByName);

router
  .route("/")
  .get(ServerController.getServers)
  .post(isAuthenticated(), ServerController.createServer)
  .delete(isAuthenticated(), ServerController.deleteServer);

router.route("/join").post(isAuthenticated(), ServerController.joinServer);
router.route("/leave").delete(isAuthenticated(), ServerController.leaveServer);
router.route("/kick").delete(isAuthenticated(), ServerController.kickUser);

export default router;
