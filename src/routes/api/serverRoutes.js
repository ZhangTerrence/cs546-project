import ServerController from "../../controllers/server.controller.js";
import isAuthenticated from "../../middleware/auth.js";
import express from "express";

const router = express.Router({ mergeParams: true });

router.route("/:name").get(ServerController.getServersByName);

router
  .route("/")
  .post(isAuthenticated(), ServerController.createServer)
  .delete(isAuthenticated(), ServerController.deleteServer);

router.route("/join").post(isAuthenticated(), ServerController.joinServer);
router.route("/leave").delete(isAuthenticated(), ServerController.leaveServer);
router.route("/kick").post(isAuthenticated(), ServerController.kickUser);

export default router;
