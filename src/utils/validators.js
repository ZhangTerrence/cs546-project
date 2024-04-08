import { BadRequestError } from "./errors.js";
import mongoose from "mongoose";
import emailValidator from "email-validator";
class BaseValidator {
  static validateString = (_variable, _variableName) => {
    if (!_variable) {
      throw new BadRequestError(400, _variableName, "Missing field.");
    }

    if (typeof _variable !== "string") {
      throw new BadRequestError(400, _variableName, "Expected type string.");
    }

    const variable = _variable.trim();
    if (variable.length === 0) {
      throw new BadRequestError(
        400,
        _variableName,
        "Expected nonempty string."
      );
    }

    return variable;
  };

  static validateMongooseId = (_id, _idName) => {
    const id = this.validateString(_id, _idName);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(400, _idName, "Expected valid ObjectId.");
    }

    return id;
  };
}

export class UserValidator extends BaseValidator {
  static minUsernameLength = 3;
  static maxUsernameLength = 20;
  static minPasswordLength = 3;
  static maxPasswordLength = 20;

  static validateSignupInfo = (_email, _username, _password) => {
    const email = this.validateString(_email, "email");
    const username = this.validateString(_username, "username");
    const password = this.validateString(_password, "password");

    if (!emailValidator.validate(email)) {
      throw new BadRequestError(400, "email", "Expected valid email.");
    }

    if (
      username.length < this.minUsernameLength ||
      username.length > this.maxUsernameLength
    ) {
      throw new BadRequestError(
        400,
        "username",
        `Expected between ${this.minUsernameLength} and ${this.maxUsernameLength} characters without whitespace.`
      );
    }
    if (_username.match("^[a-z0-9]+$/i")) {
      throw new BadRequestError(
        400,
        "username",
        "Expected only alphanumeric characters."
      );
    }

    if (
      password.length < this.minPasswordLength ||
      password.length > this.maxPasswordLength
    ) {
      throw new BadRequestError(
        400,
        "password",
        `Expected between ${this.minUsernameLength} and ${this.maxUsernameLength} characters without whitespace.`
      );
    }
    if (password.match("^[a-z0-9]+$/i")) {
      throw new BadRequestError(
        400,
        "password",
        "Expected only alphanumeric characters."
      );
    }

    return {
      email: email,
      username: username,
      password: password
    };
  };

  static validateLoginCredentials = (_username, _password) => {
    const username = this.validateString(_username, "username");
    const password = this.validateString(_password, "password");

    return {
      username: username,
      password: password
    };
  };

  static validateUpdateInfo = (_darkMode) => {
    if (typeof _darkMode !== "boolean") {
      throw new BadRequestError(400, "bio", "Expected type boolean.");
    }

    return {
      darkMode: _darkMode
    };

    // Object.entries(args).forEach((entry) => {
    //   const [key, value] = entry;

    //   if (key === "darkMode") {
    //     if (typeof value !== "boolean") {
    //       throw new BadRequestError(400, key, "Expected type boolean.");
    //     }
    //   } else {
    //     this.validateString({ variable: value, variableName: key });
    //   }
    // });
  };

  static validateCreateFriendRequestInfo = (_username) => {
    const username = this.validateString(_username, "username");

    return {
      username: username
    };
  };
}

export class ServerValidator extends BaseValidator {
  static validateCreationInfo = (_name) => {
    const name = this.validateString(_name, "name");

    return {
      name: name
    };
  };
}

export class ChannelValidator extends BaseValidator {}
