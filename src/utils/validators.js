import emailValidator from "email-validator";
import User from "../models/userModel.js";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 3;

export const validateLoginInput = (username, password) => {
  if (!username) throw new Error("Username field is required.");
  if (!password) throw new Error("Password field is required.");

  if (typeof username !== "string")
    throw new Error("Username field is not a string.");
  if (typeof password !== "string")
    throw new Error("Password field is not a string.");

  if (username.trim().length === 0) throw new Error("Username field is empty.");
  if (password.trim().length === 0) throw new Error("Password field is empty.");
};

export const validateSignupInput = (email, username, password) => {
  if (!email) throw new Error("Email field is required.");
  if (!username) throw new Error("Username field is required.");
  if (!password) throw new Error("Password field is required.");

  if (typeof email !== "string")
    throw new Error("Email field must be a string.");
  if (typeof username !== "string")
    throw new Error("Username field must be a string.");
  if (typeof password !== "string")
    throw new Error("Password field must be a string.");

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

export const validateUniqueUser = async (email, username) => {
  const emailExists = await User.findOne({ email });
  if (emailExists) throw new Error("Email is already taken.");

  const usernameExists = await User.findOne({ username });
  if (usernameExists) throw new Error("Username is already taken.");
};
