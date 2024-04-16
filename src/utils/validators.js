import { BadRequestError } from "./errors.js";
import mongoose from "mongoose";
import emailValidator from "email-validator";
class BaseValidator {
  static validateString = (_variable, _variableName) => {
    if (!_variable) {
      throw new BadRequestError(
        400,
        this.validateString.name,
        `Missing ${_variableName} field.`
      );
    }

    if (typeof _variable !== "string") {
      throw new BadRequestError(
        400,
        this.validateString.name,
        `Expected a string for ${_variableName}.`
      );
    }

    const variable = _variable.trim();
    if (variable.length === 0) {
      throw new BadRequestError(
        400,
        this.validateString.name,
        `Expected a nonempty string for ${_variableName}.`
      );
    }

    return variable;
  };

  static validateMongooseId = (_id, _idName) => {
    const id = this.validateString(_id, _idName);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(
        400,
        this.validateMongooseId.name,
        `Expected a valid ObjectId for ${_idName}.`
      );
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
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Expected a valid email."
      );
    }

    if (
      username.length < this.minUsernameLength ||
      username.length > this.maxUsernameLength
    ) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        `Expected between ${this.minUsernameLength} and ${this.maxUsernameLength} characters without whitespace for username.`
      );
    }
    if (!/^[a-z0-9]+$/i.test(username)) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Expected only alphanumeric characters for username."
      );
    }

    if (
      password.length < this.minPasswordLength ||
      password.length > this.maxPasswordLength
    ) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        `Expected between ${this.minPasswordLength} and ${this.maxPasswordLength} characters without whitespace for password.`
      );
    }
    if (!/^[a-z0-9]+$/i.test(password)) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Expected only alphanumeric characters for username."
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

  static validateUpdateInfo = (_username, _theme) => {
    const username = this.validateString(_username, "username");
    const theme = this.validateString(_theme, "theme");

    if (theme !== "light" && theme !== "dark") {
      throw new BadRequestError(
        400,
        this.validateUpdateInfo.name,
        "Expected either 'light' or 'dark' for theme."
      );
    }

    return {
      username: username,
      theme: theme
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

  static validateUpdateInfo = (_name) => {
    const name = this.validateString(_name, "name");

    return {
      name: name
    };
  };
}

export class ChannelValidator extends BaseValidator {
  static validateCreationInfo = (_name, _permissionLevel) => {
    const name = this.validateString(_name, "name");

    const permissionLevel = parseInt(_permissionLevel);
    if (Number.isNaN(permissionLevel) || typeof permissionLevel !== "number") {
      throw new BadRequestError(
        400,
        this.validateCreationInfo.name,
        "Expected a number for permission level."
      );
    }

    if (permissionLevel < 0 || permissionLevel > 9) {
      throw new BadRequestError(
        400,
        this.validateCreationInfo.name,
        "Permission level must be between 0 and 9 inclusive."
      );
    }

    return {
      name: name,
      permissionLevel: permissionLevel
    };
  };
}

export class MessageValidator extends BaseValidator {
  static validateCreationInfo = (_channelId, _privateMessageId, _message) => {
    if (!_channelId && !_privateMessageId) {
      throw new BadRequestError(
        400,
        this.validateCreationInfo.name,
        "Message must belong to either a channel or a private message."
      );
    }

    if (_channelId && _privateMessageId) {
      throw new BadRequestError(
        400,
        this.validateCreationInfo.name,
        "Message must belong to either a channel or a private message."
      );
    }

    const message = this.validateString(_message, "message");
    if (_channelId) {
      const channelId = this.validateMongooseId(_channelId, "channelId");

      return {
        channelId: channelId,
        message: message
      };
    }

    const privateMessageId = this.validateMongooseId(_channelId, "channelId");

    return {
      privateMessageId: privateMessageId,
      message: message
    };
  };
}
