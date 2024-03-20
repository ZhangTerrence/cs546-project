import * as serverController from "../controllers/serverController.js";
import isAuthenticated from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.route("/").post(isAuthenticated(), serverController.createServer);

export default router;
