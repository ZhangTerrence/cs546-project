import { BadRequestError } from "./errors.js";
import mongoose from "mongoose";
import emailValidator from "email-validator";
import xss from "xss";

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

    return xss(id);
  };
}

export class UserValidator extends BaseValidator {
  static minUsernameLength = 3;
  static maxUsernameLength = 20;
  static minPasswordLength = 8;
  static maxBioLength = 255;
  static allowedThemes = ["light", "dark"];

  static validateSignupInfo = (_email, _username, _password, _bio, _theme) => {
    const email = this.validateString(_email, "email");
    const username = this.validateString(_username, "username");
    const password = this.validateString(_password, "password");
    const bio = this.validateString(_bio, "bio");
    const theme = this.validateString(_theme, "theme");

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
        `Username must be between ${this.minUsernameLength} and ${this.maxUsernameLength} alphanumeric characters.`
      );
    }
    if (!/^[a-z0-9]+$/i.test(username)) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Username must be alphanumeric."
      );
    }

    if (
      password.length < this.minPasswordLength ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Password must be at least 8 characters including one uppercase and one special character."
      );
    }

    if (bio.length > this.maxBioLength) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Bio must not exceed 255 characters."
      );
    }

    if (!this.allowedThemes.includes(theme)) {
      throw new BadRequestError(
        400,
        this.validateSignupInfo.name,
        "Theme must be either 'light' or 'dark'."
      );
    }

    return {
      email: xss(email),
      username: xss(username),
      password: xss(password),
      bio: xss(bio),
      theme: xss(theme)
    };
  };
}

export class ServerValidator extends BaseValidator {
  static validateServerName = (_name) => {
    const name = this.validateString(_name, "name");
    const regex = /^[a-z0-9]{3,20}$/i;
    if (!regex.test(name)) {
      throw new BadRequestError(
        400,
        this.validateServerName.name,
        "Server name must be between 3 and 20 alphanumeric characters."
      );
    }
    return name;
  };

  static validateDescription = (_description) => {
    const description = this.validateString(_description, "description");
    if (description.length > 255) {
      throw new BadRequestError(
        400,
        this.validateDescription.name,
        "Description must be at most 255 characters long."
      );
    }
    return description;
  };

  static validatePermissionLevel = (_permissionLevel) => {
    const permissionLevel = parseInt(_permissionLevel);
    if (Number.isNaN(permissionLevel) || permissionLevel < 0 || permissionLevel > 9) {
      throw new BadRequestError(
        400,
        this.validatePermissionLevel.name,
        "Permission level must be between 0 and 9."
      );
    }
    return permissionLevel;
  };

  static validateCreationInfo = (_name, _description, _permissionLevel) => {
    const name = this.validateServerName(_name);
    const description = this.validateDescription(_description);
    const permissionLevel = this.validatePermissionLevel(_permissionLevel);

    return {
      name: xss(name),
      description: xss(description),
      permissionLevel: xss(permissionLevel)
    };
  };

  static validateUpdateInfo = (_name, _description, _permissionLevel) => {
    return this.validateCreationInfo(_name, _description, _permissionLevel);
  };
}

export class ChannelValidator extends BaseValidator {
  static validateChannelName = (_name) => {
    const name = this.validateString(_name, "name");
    if (!/^[a-z0-9]{3,20}$/i.test(name)) {
      throw new BadRequestError(
        400,
        this.validateChannelName.name,
        "Channel name must be between 3 and 20 alphanumeric characters."
      );
    }
    return name;
  };

  static validateDescription = (_description) => {
    const description = this.validateString(_description, "description");
    if (description.length > 255) {
      throw new BadRequestError(
        400,
        this.validateDescription.name,
        "Description must be at most 255 characters long."
      );
    }
    return description;
  };

  static validatePermissionLevel = (_permissionLevel) => {
    const permissionLevel = parseInt(_permissionLevel);
    if (Number.isNaN(permissionLevel) || permissionLevel < 0 || permissionLevel > 9) {
      throw new BadRequestError(
        400,
        this.validatePermissionLevel.name,
        "Permission level must be between 0 and 9."
      );
    }
    return permissionLevel;
  };

  static validateCreationInfo = (_name, _description, _permissionLevel) => {
    const name = this.validateChannelName(_name);
    const description = this.validateDescription(_description);
    const permissionLevel = this.validatePermissionLevel(_permissionLevel);

    return {
      name: xss(name),
      description: xss(description),
      permissionLevel: xss(permissionLevel)
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

    if (_channelId) {
      const channelId = this.validateMongooseId(_channelId, "channelId");

      return {
        channelId: xss(channelId),
        message: xss(_message)
      };
    }

    const privateMessageId = this.validateMongooseId(
      _privateMessageId,
      "privateMessageId"
    );

    return {
      privateMessageId: xss(privateMessageId),
      message: xss(_message)
    };
  };
}

export class PrivateMessageValidator extends BaseValidator {}
