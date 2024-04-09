import UserController from "../../controllers/user.controller.js";
import ServerController from "../../controllers/server.controller.js";
import ChannelController from "../../controllers/channel.controller.js";
import express from "express";

const router = express.Router({ mergeParams: true });

// Landing Page
router.route("/").get(async (_req, res) => {
  return res.render("landing");
});

// Signup Page
router.route("/signup").get(async (_req, res) => {
  return res.render("signup");
});

// Login Page
router.route("/login").get(async (req, res) => {
  if (req.session.user) {
    return res.redirect(`/user/${req.session.user.id}`);
  }
  return res.render("login");
});

// User Page
router.route("/user/:userId").get(UserController.renderUserProfilePage);

// Server Page
router.route("/server/:serverId").get(ServerController.renderServerPage);

// Channel Page
router.route("/channel/:channelId").get(ChannelController.renderChannelPage);

export default router;
