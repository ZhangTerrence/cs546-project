import ChannelService from "../services/channel.service.js";
import PrivateMessageService from "../services/privateMessage.service.js";
import ServerService from "../services/server.service.js";
import UserService from "../services/user.service.js";
import { BaseError, InternalServerError } from "../utils/errors.js";
import { UserValidator } from "../utils/validators.js";

export default class UserController {
  /**
   * @description Renders an user's profile page.
   * @route GET /user/:userId
   * @access Public
   */
  static renderUserProfilePage = async (req, res) => {
    try {
      if (
        req.session.user &&
        req.session.user.id &&
        req.session.user.id === req.params.userId
      ) {
        const userId = UserValidator.validateMongooseId(
          req.params.userId,
          "userId"
        );

        const user = await UserService.getUserById(userId);

        const servers = await Promise.all(
          user.servers.map(async (serverId) => {
            const server = await ServerService.getServerById(serverId);

            return {
              id: serverId,
              name: server.name
            };
          })
        );

        const friends = await Promise.all(
          user.friends.map(async (userId) => {
            const friend = await UserService.getUserById(userId);

            return {
              id: userId,
              username: friend.username
            };
          })
        );

        const friendRequests = await Promise.all(
          user.friendRequests.map(async (userId) => {
            const sender = await UserService.getUserById(userId);

            return {
              id: userId,
              username: sender.username
            };
          })
        );

        return res.status(200).render("user/profile", {
          username: user.username,
          bio: user.bio,
          darkMode: user.darkMode,
          servers: servers,
          friends: friends,
          friendRequests: friendRequests,
          owner: true
        });
      } else {
        const userId = UserValidator.validateMongooseId(
          req.params.userId,
          "userId"
        );

        const user = await UserService.getUserById(userId);

        return res.status(200).render("user/profile", {
          username: user.username,
          bio: user.bio,
          owner: false
        });
      }
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        if (!(error instanceof InternalServerError)) {
          return res.status(error.statusCode).render("error/400", {
            statusCode: error.statusCode,
            message: error.message
          });
        } else {
          return res.status(error.statusCode).render("error/500", {
            statusCode: error.statusCode,
            message: error.message
          });
        }
      } else {
        console.log(error);
        return res.status(500).render("error/500", {
          statusCode: 500,
          message: "Code went boom."
        });
      }
    }
  };

  /**
   * @description Creates a new user.
   * @route POST /api/user/signup
   * @access Public
   */
  static createUser = async (req, res) => {
    try {
      const { email, username, password } = UserValidator.validateSignupInfo(
        req.body.email,
        req.body.username,
        req.body.password
      );

      const user = await UserService.createUser(email, username, password);

      req.session.user = {
        id: user.id,
        username: user.username,
        bio: user.bio,
        darkMode: user.darkMode
      };

      return res.status(201).json({
        data: {
          url: `/user/${user.id}`
        }
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Authenticates an user.
   * @route POST /api/user/login
   * @access Public
   */
  static authUser = async (req, res) => {
    try {
      const { username, password } = UserValidator.validateLoginCredentials(
        req.body.username,
        req.body.password
      );

      const user = await UserService.authUser(username, password);

      req.session.user = {
        id: user.id,
        username: user.username,
        bio: user.bio,
        darkMode: user.darkMode
      };

      return res.status(200).json({
        data: {
          url: `/user/${user.id}`
        }
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Logs out an user.
   * @route POST /api/user/logout
   * @access Public
   */
  static logoutUser = async (req, res) => {
    req.session.destroy();
    return res.status(204).redirect("/");
  };

  /**
   * @description Updates an user.
   * @route PATCH /api/user
   * @access Private
   */
  static updateUser = async (req, res) => {
    try {
      const { darkMode } = UserValidator.validateUpdateInfo(req.body.darkMode);
      const bio = req.body.bio;
      const userId = req.session.user.id;

      await UserService.updateUser(userId, bio, darkMode);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Deletes an user.
   * @route DELETE /api/user
   * @access Private
   */
  static deleteUser = async (req, res) => {
    try {
      const userId = req.session.user.id;

      const user = await UserService.getUserById(userId);

      const associatedUsers = await UserService.getAssociatedUsers(user.id);
      associatedUsers.forEach(async (associatedUser) => {
        await UserService.removeUserAssociations(associatedUser, user.id);
      });

      const joinedServers = await ServerService.getJoinedServers(user.id);
      joinedServers.forEach(async (joinedServer) => {
        if (user.id === joinedServer.creatorId) {
          await ChannelService.deleteServerChannels(joinedServer.id);
          await ServerService.deleteServer(joinedServer.id);
        } else {
          await ServerService.removeUser(joinedServer, user.id);
        }
      });

      await PrivateMessageService.deleteUserPrivateMessages(user.id);

      await UserService.deleteUser(user.id);

      req.session.destroy();

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Sends a friend request to another user.
   * @route POST /api/user/friend/create
   * @access Private
   */
  static createFriendRequest = async (req, res) => {
    try {
      const { username } = UserValidator.validateCreateFriendRequestInfo(
        req.body.username
      );
      const userId = req.session.user.id;

      const targetUser = await UserService.getUserByUsername(username);
      const user = await UserService.getUserById(userId);

      await UserService.createFriendRequest(targetUser, user);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Accepts a friend request from another user.
   * @route POST /api/user/friend/accept
   * @access Private
   */
  static acceptFriendRequest = async (req, res) => {
    try {
      const requesterId = UserValidator.validateMongooseId(
        req.body.requesterId,
        "requesterId"
      );
      const userId = req.session.user.id;

      const requester = await UserService.getUserById(requesterId);
      const user = await UserService.getUserById(userId);

      await PrivateMessageService.createPrivateMessage(requester.id, user.id);

      await UserService.acceptFriendRequest(requester, user);

      return res.status(200).json({
        data: {
          id: requester.id,
          username: requester.username
        }
      });
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Rejects a friend request from another user.
   * @route POST /api/user/friend/reject
   * @access Private
   */
  static rejectFriendRequest = async (req, res) => {
    try {
      const requesterId = UserValidator.validateMongooseId(
        req.body.requesterId,
        "requesterId"
      );
      const userId = req.session.user.id;

      const user = await UserService.getUserById(userId);

      await UserService.rejectFriendRequest(user, requesterId);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };

  /**
   * @description Removes another user from friends list.
   * @route DELETE /api/user/friend/remove
   * @access Private
   */
  static removeFriend = async (req, res) => {
    try {
      const friendId = UserValidator.validateMongooseId(
        req.body.friendId,
        "friendId"
      );
      const userId = req.session.user.id;

      const friend = await UserService.getUserById(friendId);
      const user = await UserService.getUserById(userId);

      await PrivateMessageService.deletePrivateMessage(friend.id, user.id);

      await UserService.removeFriend(friend, user);

      return res.status(204).json();
    } catch (error) {
      if (error instanceof BaseError) {
        console.log(`${error.constructor.name} - ${error.originName}`);
        return res.status(error.statusCode).json({ error: error.message });
      } else {
        console.log(error);
        return res.status(500).json({ error: "Code went boom." });
      }
    }
  };
}
