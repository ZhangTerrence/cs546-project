import UserRepository from "../models/user.js";
import {
  BadRequestError,
  NotFoundError,
  AuthenticationError,
  InternalServerError
} from "../utils/errors.js";
import bcryptjs from "bcryptjs";
import env from "../config/env.js";

export default class UserService {
  static saltRounds = 16;

  /**
   * @description Gets an user by their id.
   * @param {string} userId The given user id.
   * @returns User.
   * @throws NotFoundError If the user is not found.
   */
  static getUserById = async (userId) => {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(404, `userId: ${userId}`, "User not found.");
    }

    return user;
  };

  /**
   * @description Gets an user by their username.
   * @param {string} username The given username.
   * @returns User.
   * @throws NotFoundError If the user is not found.
   */
  static getUserByUsername = async (username) => {
    const user = await UserRepository.findOne({ username: username });
    if (!user) {
      throw new NotFoundError(404, `username: ${username}`, "User not found.");
    }

    return user;
  };

  /**
   * @description Gets all the users who are in an user's friends or friend requests list.
   * @param {string} userId The given user id.
   * @returns User array.
   */
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

  /**
   * @description Gets all the users who have joined the server.
   * @param {string} serverId The given server id.
   * @returns User array.
   */
  static getJoinedUsers = async (serverId) => {
    const joinedUsers = await UserRepository.find({
      servers: { $in: serverId }
    });
    return joinedUsers;
  };

  /**
   * @description Creates a new user.
   * @param {string} email The given email.
   * @param {string} username The given username.
   * @param {string} password The given password.
   * @returns User.
   * @throws BadRequestError If either the email or username is taken.
   * @throws InternalServerError If it fails to create the user.
   */
  static createUser = async (email, username, password) => {
    const emailExists = await UserRepository.findOne({
      email: { $regex: email, $options: "i" }
    });
    if (emailExists) {
      throw new BadRequestError(400, `email: ${email}`, "Email is taken.");
    }

    const usernameExists = await UserRepository.findOne({
      username: { $regex: username, $options: "i" }
    });
    if (usernameExists) {
      throw new BadRequestError(
        400,
        `username: ${username}`,
        "Username is taken."
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
        env.NODE_ENV === "dev"
          ? `create(): ${[email, username, hashedPassword]}`
          : "create()",
        "Unable to create user."
      );
    }

    return newUser;
  };

  /**
   * @description Authenticates credentials.
   * @param {string} username The given username.
   * @param {string} password The given password.
   * @returns User.
   * @throws AuthenticationError If credentials are incorrect.
   */
  static authenticateUser = async (username, password) => {
    const user = await UserRepository.findOne({
      username: { $regex: username, $options: "i" }
    });
    if (!user) {
      throw new BadRequestError(
        404,
        `username: ${username}`,
        "User not found."
      );
    }

    const authenticated = await this.comparePassword(
      password,
      user.hashedPassword
    );
    if (!authenticated) {
      throw new AuthenticationError(
        401,
        env.NODE_ENV === "dev"
          ? `credentials: ${[username, password]}`
          : "credentials",
        "Invalid username or password."
      );
    }

    return user;
  };

  /**
   * @description Updates an user.
   * @param {string} userId The given user id.
   * @param {string} bio The given bio.
   * @param {boolean} darkMode The given color mode.
   * @throws BadRequestError If nothing has been changed.
   * @throws NotFoundError If the user if not found.
   * @throws InternalServerError If it fails to update the user.
   */
  static updateUser = async (userId, bio, darkMode) => {
    const user = await this.getUserById(userId);

    if (user.bio === bio && user.darkMode === darkMode) {
      throw new BadRequestError(
        400,
        `body: ${[bio, darkMode]}`,
        "Nothing has changed."
      );
    }

    const updatedUser = await UserRepository.findByIdAndUpdate(userId, {
      bio: bio,
      darkMode: darkMode
    });
    if (!updatedUser) {
      throw new InternalServerError(
        500,
        `findByIdAndUpdate(): ${[userId, bio, darkMode]}`,
        "Unable to update user."
      );
    }
  };

  /**
   * @description Deletes an user.
   * @param {string} userId The given user id.
   * @throws NotFoundError If the user is not found.
   * @throws InternalServerError If it fails to delete the user.
   */
  static deleteUser = async (userId) => {
    await this.getUserById(userId);

    const deletedUser = await UserRepository.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new InternalServerError(
        500,
        `findByIdAndDelete(): ${userId}`,
        "Unable to delete user."
      );
    }
  };

  /**
   * @description Removes all records of an user from an associated user's friends and/or friend requests list.
   * @param {UserDocument} associatedUser The associated user who the user will be removed from.
   * @param {string} userId The id of the user who will be removed.
   * @throws InternalServerError If it fails to update the associated user.
   */
  static removeUserAssociations = async (associatedUser, userId) => {
    if (associatedUser.friends.includes(userId)) {
      associatedUser.friends.splice(associatedUser.friends.indexOf(userId), 1);
    }
    if (associatedUser.friendRequests.includes(userId)) {
      associatedUser.friendRequests.splice(
        associatedUser.friendRequests.indexOf(userId),
        1
      );
    }

    const updatedUser = await associatedUser.save();
    if (!updatedUser) {
      throw new InternalServerError(
        500,
        `save(): ${[associatedUser.friends, associatedUser.friendRequests, userId]}`,
        "Unable to update user."
      );
    }
  };

  /**
   * @description Creates a friend request from an user to a target user.
   * @param {UserDocument} targetUser The user who the friend request is sent to.
   * @param {UserDocument} user The user who sends the friend request.
   * @throws BadRequestError If the user is the target user, both users are already friends, or a
   * friend request has already been sent to the target user.
   * @throws InternalServerError If it fails to update the target user.
   */
  static createFriendRequest = async (targetUser, user) => {
    if (targetUser.id === user.id) {
      throw new BadRequestError(
        400,
        `targetUser: ${user}`,
        "Can't send friend request to yourself."
      );
    }

    if (user.friends.includes(targetUser.id)) {
      throw new BadRequestError(
        400,
        `targetUser: ${targetUser}`,
        "User is already a friend."
      );
    }

    if (targetUser.friendRequests.includes(user.id)) {
      throw new BadRequestError(
        400,
        `user: ${user}`,
        "Already sent friend request."
      );
    }

    targetUser.friendRequests.push(user.id);

    const sentFriendRequest = await targetUser.save();
    if (!sentFriendRequest) {
      throw new InternalServerError(
        500,
        `save(): ${[targetUser.friendRequests, user.id]}`,
        "Unable to send friend request."
      );
    }
  };

  /**
   * @description Accepts a friend request from a requester.
   * @param {UserDocument} requester The user who sent the friend request.
   * @param {UserDocument} user The user who the friend request is sent to.
   * @throws BadRequestError If both users are already friends or no friend request is found.
   * @throw InternalServerError If it fails to update either user.
   */
  static acceptFriendRequest = async (requester, user) => {
    if (requester.friends.includes(user.id)) {
      throw new BadRequestError(
        400,
        `requester: ${[requester.friends, user.id]}`,
        "User is already a friend."
      );
    }

    if (user.friends.includes(requester.id)) {
      throw new BadRequestError(
        400,
        `user: ${[user.friends, requester.id]}`,
        "User is already a friend."
      );
    }

    const friendRequestIndex = user.friendRequests.indexOf(requester.id);
    if (friendRequestIndex === -1) {
      throw new BadRequestError(
        400,
        `requester: ${[user.friendRequests, requester.id]}`,
        "No friend request found."
      );
    }

    user.friendRequests.splice(friendRequestIndex, 1);
    user.friends.push(requester.id);

    const friendedRequester = await user.save();
    if (!friendedRequester) {
      throw new InternalServerError(
        500,
        `save(): ${[user.friends, user.friendRequests, requester.id]}`,
        "Unable to add user as friend."
      );
    }

    requester.friends.push(user.id);

    const friendedUser = await requester.save();
    if (!friendedUser) {
      throw new InternalServerError(
        500,
        `save(): ${[requester.friends, user.id]}`,
        "Unable to add user as friend."
      );
    }
  };

  /**
   * @description Rejects a friend request from a requester.
   * @param {UserDocument} user The user who the friend request is sent to.
   * @param {string} requesterId The id of the user who sent the friend request.
   * @throws BadRequestError If no friend request is found.
   * @throws InternalServerError If it fails to update the user.
   */
  static rejectFriendRequest = async (user, requesterId) => {
    const friendRequestIndex = user.friendRequests.indexOf(requesterId);
    if (friendRequestIndex === -1) {
      throw new BadRequestError(
        400,
        `requester: ${[user.friendRequests, requesterId]}`,
        "No friend request found."
      );
    }

    user.friendRequests.splice(friendRequestIndex, 1);

    const rejectedFriendRequest = await user.save();
    if (!rejectedFriendRequest) {
      throw new InternalServerError(
        500,
        `save(): ${[user.friendRequests, requesterId]}`,
        "Unable to reject friend request."
      );
    }
  };

  /**
   * @description Removes friend by deleting records of both users from their respective friends list.
   * @param {UserDocument} friend The friend.
   * @param {UserDocument} user The user.
   * @throws BadRequestError If the either user was not a friend of the other user.
   * @throws InternalServerError If it fails to update either user.
   */
  static removeFriend = async (friend, user) => {
    const userIndex = friend.friends.indexOf(user.id);
    if (userIndex == -1) {
      throw new BadRequestError(
        400,
        `friend: ${[friend.friends, user.id]}`,
        "User was not a friend."
      );
    }

    friend.friends.splice(userIndex, 1);

    const savedUser = await friend.save();
    if (!savedUser) {
      throw new InternalServerError(
        500,
        `save(): ${[friend.friends, user.id]}`,
        "Unable to delete friend."
      );
    }

    const friendIndex = user.friends.indexOf(friend.id);
    if (friendIndex == -1) {
      throw new BadRequestError(
        400,
        `user: ${[user.friends, friend.id]}`,
        "User was not a friend."
      );
    }

    user.friends.splice(friendIndex, 1);

    const savedFriend = await user.save();
    if (!savedFriend) {
      throw new InternalServerError(
        500,
        `save(): ${[user.friends, friend.id]}`,
        "Unable to delete friend."
      );
    }
  };

  /**
   * @description Adds a server from an user's server list.
   * @param {UserDocument} user The user who will join the server.
   * @param {string} serverId The id of the server which the user will join.
   * @throws InternalServerError If it fails to update the user.
   */
  static addServer = async (user, serverId) => {
    user.servers.push(serverId);

    const addedServer = await user.save();
    if (!addedServer) {
      throw new InternalServerError(
        500,
        `save(): ${[user.servers, serverId]}`,
        "Unable to join server."
      );
    }
  };

  /**
   * @description Removes a server from an user's server list.
   * @param {UserDocument} user The user who will leave the server.
   * @param {ServerDocument} server The server which the user will leave.
   * @throws BadRequestError If the server is not found.
   * @throws InternalServerError If it fails to update the user.
   */
  static removeServer = async (user, server) => {
    const serverIndex = user.servers.indexOf(server.id);
    if (serverIndex === -1) {
      throw new BadRequestError(
        400,
        `server: ${[user.servers, server.id]}`,
        "Server not found."
      );
    }

    user.servers.splice(serverIndex, 1);

    const removedServer = await user.save();
    if (!removedServer) {
      throw new InternalServerError(
        500,
        `save(): ${[user.servers, server.id]}`,
        "Unable to leave user"
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
