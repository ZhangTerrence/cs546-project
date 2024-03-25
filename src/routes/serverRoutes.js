import * as serverController from "../controllers/serverController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.route("/:serverId").get(serverController.renderServerPage);

router.route("/queryName/:serverName").get(serverController.getServersByName);

router
  .route("/")
  .post(isAuthenticated(), serverController.createServer)
  .delete(isAuthenticated(), serverController.deleteServer);

router.route("/join").post(isAuthenticated(), serverController.joinServer);
router.route("/leave").delete(isAuthenticated(), serverController.leaveServer);

export default router;
