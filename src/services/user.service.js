import UserRepository from "../models/user.js";
import {
  BadRequestError,
  NotFoundError,
  AuthenticationError,
  InternalServerError,
  AuthorizationError
} from "../utils/errors.js";
import bcryptjs from "bcryptjs";

export default class UserService {
  static saltRounds = 16;

  static getUsers = async () => {
    return await UserRepository.find();
  };

  static getUserById = async (userId) => {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(404, this.getUserById.name, "User not found.");
    }
    return user;
  };

  static getUserByUsername = async (username) => {
    const user = await UserRepository.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    });
    if (!user) {
      throw new NotFoundError(
        404,
        this.getUserByUsername.name,
        "User not found."
      );
    }
    return user;
  };

  static getJoinedUsers = async (serverId) => {
    const joinedUsers = await UserRepository.find({
      servers: { $in: serverId }
    });
    return joinedUsers;
  };

  static authenticateCredentials = async (username, password) => {
    const user = await this.getUserByUsername(username);

    const authenticated = await this.comparePassword(
      password,
      user.hashedPassword
    );
    if (!authenticated) {
      throw new AuthenticationError(
        401,
        this.authenticateCredentials.name,
        "Invalid username or password."
      );
    }

    return user;
  };

  static createUser = async (email, username, password) => {
    const emailExists = await UserRepository.findOne({
      email: { $regex: `^${email}$`, $options: "i" }
    });
    if (emailExists) {
      throw new BadRequestError(
        400,
        this.createUser.name,
        `${email} is taken.`
      );
    }

    const usernameExists = await UserRepository.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    });
    if (usernameExists) {
      throw new BadRequestError(
        400,
        this.createUser.name,
        `${username} is taken.`
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await UserRepository.create({
      email: email,
      username: username,
      hashedPassword: hashedPassword
    });
    if (!newUser) {
      throw new InternalServerError(
        500,
        this.createUser.name,
        "Unable to create user."
      );
    }

    return newUser;
  };

  static updateUser = async (userId, username, bio, theme) => {
    const user = await this.getUserById(userId);

    if (
      user.username === username &&
      user.bio === bio &&
      user.theme === theme
    ) {
      throw new BadRequestError(
        400,
        this.updateUser.name,
        "Nothing has changed."
      );
    }

    if (username !== user.username) {
      const usernameExists = await UserRepository.findOne({
        username: { $regex: `^${username}$`, $options: "i" }
      });
      if (usernameExists) {
        throw new BadRequestError(
          400,
          this.createUser.name,
          `${username} is taken.`
        );
      }
    }

    const updatedUser = await UserRepository.findByIdAndUpdate(userId, {
      username: username,
      bio: bio,
      theme: theme
    });
    if (!updatedUser) {
      throw new InternalServerError(
        500,
        this.updateUser.name,
        "Unable to update user."
      );
    }
  };

  static deleteUser = async (userId) => {
    const deletedUser = await UserRepository.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new InternalServerError(
        500,
        this.deleteUser.name,
        "Unable to delete user."
      );
    }
  };

  static getAssociatedUsers = async (userId) => {
    const associatedUsers = await UserRepository.find({
      $or: [
        {
          friends: { $in: userId }
        },
        {
          friendRequests: { $in: userId }
        }
      ]
    });
    return associatedUsers;
  };

  static removeUserAssociations = async (associatedUser, removedUser) => {
    if (associatedUser.friends.includes(removedUser.id)) {
      associatedUser.friends.splice(
        associatedUser.friends.indexOf(removedUser.id),
        1
      );
    }
    if (associatedUser.friendRequests.includes(removedUser.id)) {
      associatedUser.friendRequests.splice(
        associatedUser.friendRequests.indexOf(removedUser.id),
        1
      );
    }

    const updatedUser = await associatedUser.save();
    if (!updatedUser) {
      throw new InternalServerError(
        500,
        this.removeUserAssociations.name,
        `Unable to remove ${removedUser.username} from ${associatedUser.username}'s lists.`
      );
    }
  };

  static sendFriendRequest = async (target, requester) => {
    if (target.id === requester.id) {
      throw new BadRequestError(
        400,
        this.sendFriendRequest.name,
        `Can't send friend request from ${target.username} to ${requester.username}. They are the same user.`
      );
    }

    if (requester.friends.includes(target.id)) {
      throw new BadRequestError(
        400,
        this.sendFriendRequest.name,
        `${target.username} and ${requester.username} are already friends.`
      );
    }

    if (target.friendRequests.includes(requester.id)) {
      throw new BadRequestError(
        400,
        this.sendFriendRequest.name,
        `Already sent friend request to ${target.username}.`
      );
    }

    target.friendRequests.push(requester.id);
    const sentFriendRequest = await target.save();
    if (!sentFriendRequest) {
      throw new InternalServerError(
        500,
        this.sendFriendRequest.name,
        `Unable to send friend request to ${target.username}.`
      );
    }
  };

  static acceptFriendRequest = async (target, requester) => {
    if (requester.friends.includes(target.id)) {
      throw new BadRequestError(
        400,
        this.acceptFriendRequest.name,
        `${target.username} and ${requester.username} already friends.`
      );
    }

    if (target.friends.includes(requester.id)) {
      throw new BadRequestError(
        400,
        this.acceptFriendRequest.name,
        `${target.username} and ${requester.username} already friends.`
      );
    }

    const friendARequestIndex = target.friendRequests.indexOf(requester.id);
    if (friendARequestIndex === -1) {
      throw new NotFoundError(
        404,
        this.acceptFriendRequest.name,
        `${requester.username} not found in ${target.username}'s friend requests.`
      );
    }

    target.friendRequests.splice(friendARequestIndex, 1);
    target.friends.push(requester.id);
    const friendedRequester = await target.save();
    if (!friendedRequester) {
      throw new InternalServerError(
        500,
        this.acceptFriendRequest.name,
        `Unable to accept friend request from ${requester.username}.`
      );
    }

    const friendBRequestIndex = requester.friendRequests.indexOf(target.id);
    if (friendBRequestIndex === -1) {
      throw new NotFoundError(
        404,
        this.acceptFriendRequest.name,
        `${target.username} not found in ${requester.username}'s friend requests.`
      );
    }

    requester.friendRequests.splice(friendBRequestIndex, 1);
    requester.friends.push(target.id);
    const friendedTarget = await requester.save();
    if (!friendedTarget) {
      throw new InternalServerError(
        500,
        this.acceptFriendRequest.name,
        `Unable to accept friend request from ${requester.username}.`
      );
    }
  };

  static rejectFriendRequest = async (target, requester) => {
    const friendRequestIndex = target.friendRequests.indexOf(requester.id);
    if (friendRequestIndex === -1) {
      throw new NotFoundError(
        404,
        this.rejectFriendRequest.name,
        `${requester.username} not found in ${target.username}'s friend requests.`
      );
    }

    target.friendRequests.splice(friendRequestIndex, 1);
    const rejectedFriendRequest = await target.save();
    if (!rejectedFriendRequest) {
      throw new InternalServerError(
        500,
        this.rejectFriendRequest.name,
        `Unable to reject friend request from ${requester.username}.`
      );
    }
  };

  static removeFriend = async (userA, userB) => {
    const userBIndex = userA.friends.indexOf(userB.id);
    if (userBIndex == -1) {
      throw new NotFoundError(
        404,
        this.removeFriend.name,
        `${userB.username} not found in ${userA.username}'s friends.`
      );
    }

    userA.friends.splice(userBIndex, 1);
    const removedUserB = await userA.save();
    if (!removedUserB) {
      throw new InternalServerError(
        500,
        this.removeFriend.name,
        `Unable to remove ${userB.username} from ${userA.username}'s friends.`
      );
    }

    const userAIndex = userB.friends.indexOf(userA.id);
    if (userAIndex == -1) {
      throw new NotFoundError(
        404,
        this.removeFriend.name,
        `${userA.username} not found in ${userB.username}'s friends.`
      );
    }

    userB.friends.splice(userAIndex, 1);
    const removedUserA = await userB.save();
    if (!removedUserA) {
      throw new InternalServerError(
        500,
        this.removeFriend.name,
        `Unable to remove ${userA.username} from ${userB.username}'s friends.`
      );
    }
  };

  static addServer = async (user, server) => {
    if (server.blacklist.includes(user.id)) {
      throw new AuthorizationError(
        403,
        this.addServer.name,
        `${user.username} is blacklisted from ${server.name}.`
      );
    }

    if (user.servers.includes(server.id)) {
      throw new BadRequestError(
        400,
        this.addServer.name,
        `${user.username} is already in ${server.name}.`
      );
    }

    user.servers.push(server.id);
    const addedServer = await user.save();
    if (!addedServer) {
      throw new InternalServerError(
        500,
        this.addServer.name,
        `Unable to add ${server.name} to ${user.username}'s servers.`
      );
    }
  };

  static removeServer = async (user, server) => {
    if (server.creatorId === user.id) {
      throw new BadRequestError(
        400,
        this.removeServer.name,
        `${user.username} is ${server.name}'s creator. They cannot be removed without deleting the server.`
      );
    }

    const serverIndex = user.servers.indexOf(server.id);
    if (serverIndex === -1) {
      throw new BadRequestError(
        404,
        this.removeServer.name,
        `${server.id} not found in ${user.username}'s servers.`
      );
    }

    user.servers.splice(serverIndex, 1);
    const removedServer = await user.save();
    if (!removedServer) {
      throw new InternalServerError(
        500,
        this.removeServer.name,
        `Unable to remove ${server.name} from ${user.username}'s servers.`
      );
    }
  };

  static hashPassword = async (password) => {
    return await bcryptjs.hash(password, this.saltRounds);
  };

  static comparePassword = async (password, hashedPassword) => {
    return await bcryptjs.compare(password, hashedPassword);
  };
}
