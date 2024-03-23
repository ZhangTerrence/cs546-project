import emailValidator from "email-validator";
import User from "../models/userModel.js";
import Server from "../models/serverModel.js";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 3;

export const validateStringInput = (input, inputName) => {
  if (!input) throw new Error(`${inputName} field is required.`);

  if (typeof input !== "string")
    throw new Error(`${inputName} field is not a string.`);

  if (input.trim().length === 0)
    throw new Error(`${inputName} field is empty.`);
};

export const validateLoginInput = (username, password) => {
  validateStringInput(username, "Username");
  validateStringInput(password, "Password");
};

export const validateSignupInput = (email, username, password) => {
  validateLoginInput(username, password);

  if (!email) throw new Error("Email field is required.");

  if (typeof email !== "string")
    throw new Error("Email field must be a string.");

  const trimmedEmail = email.trim();
  if (!emailValidator.validate(trimmedEmail))
    throw new Error("Invalid email format.");

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < MIN_USERNAME_LENGTH)
    throw new Error(
      `Username must have a minimum length of ${MIN_USERNAME_LENGTH} characters.`
    );
  if (trimmedUsername.length > MAX_USERNAME_LENGTH)
    throw new Error(
      `Username must have a maximum length of ${MAX_USERNAME_LENGTH} characters.`
    );
  if (new RegExp("^[a-z0-9]+$/i").test(trimmedUsername))
    throw new Error("Username must contain only alphanumeric characters.");

  const trimmedPassword = password.trim();
  if (trimmedPassword.length < MIN_PASSWORD_LENGTH)
    throw new Error(
      `Password must have a minimum length of ${MIN_PASSWORD_LENGTH} characters.`
    );
  if (new RegExp("^[a-z0-9.-_@!]+$/i").test(trimmedPassword))
    throw new Error(
      "Password must contain only alphanumeric characters as well as ., -, _, @, and !"
    );
};

export const validateServerCreationInput = (name) => {
  validateStringInput(name, "Name");
};

export const validateFriendRequestUsernameInput = (username) => {
  validateStringInput(username, "Username");
};

export const validateUniqueUser = async (email, username) => {
  const emailExists = await User.findOne({ email });
  if (emailExists) throw new Error("Email is already taken.");

  const usernameExists = await User.findOne({ username });
  if (usernameExists) throw new Error("Username is already taken.");
};

export const validateUniqueServer = async (name) => {
  const serverExists = await Server.findOne({ name });
  if (serverExists) throw new Error("Name is already taken.");
};
