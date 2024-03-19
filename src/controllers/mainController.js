import User from "../models/userModel.js";
import {
  validateSignupInput,
  validateLoginInput
} from "../utils/validators.js";
import { hashPassword, comparePassword } from "../utils/password.js";

// View controllers

/**
 * @description Renders landing page
 * @route GET /landing
 * @access Public
 */
export const renderLandingPage = async (_req, res) => {
  return res.render("landing");
};

/**
 * @description Renders signup page
 * @route GET /signup
 * @access Public
 */
export const renderSignupPage = async (_req, res) => {
  return res.render("signup");
};

/**
 * @description Renders login page
 * @route GET /login
 * @access Public
 */
export const renderLoginPage = async (_req, res) => {
  return res.render("login");
};

// API controllers

/**
 * @description Creates an user
 * @route POST /api/signup
 * @access Public
 */
export const createUser = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    validateSignupInput(email, username, password);
  } catch (error) {
    return res.status(400).render("signup", { error: error.message });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists)
    return res
      .status(400)
      .render("signup", { error: "Email is already taken." });

  const usernameExists = await User.findOne({ username });
  if (usernameExists)
    return res
      .status(400)
      .render("signup", { error: "Username is already taken." });

  const hashedPassword = hashPassword(password);

  const user = await User.create({ email, username, hashedPassword });
  if (!user)
    return res
      .status(500)
      .render("signup", { error: "Unable to create an user." });

  req.session.user = {
    id: user._id,
    username: user.username
  };

  return res.status(201).redirect(`/user/${user._id}`);
};

/**
 * @description Authenticates an existing user
 * @route POST /api/login
 * @access Public
 */
export const authUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    validateLoginInput(username, password);
  } catch (error) {
    return res.status(400).render("login", { error: error.message });
  }

  const user = await User.findOne({ username });
  if (!user)
    return res.status(400).render("login", {
      error: "User does not exist."
    });

  const passwordMatch = await comparePassword(password, user.hashedPassword);
  if (!passwordMatch)
    return res.status(401).render("login", {
      error: "Invalid username or password."
    });

  req.session.user = {
    id: user._id,
    username: user.username
  };

  return res.status(200).redirect(`/user/${user._id}`);
};

/**
 * @description Logs out an user
 * @route POST /api/logout
 * @access Public
 */
export const logout = async (req, res) => {
  req.session.destroy();

  return res.status(200).redirect("/");
};
