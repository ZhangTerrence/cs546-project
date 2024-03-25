import User from "../models/userModel.js";
import Server from "../models/serverModel.js";
import PrivateMessage from "../models/privateMessageModel.js";
import Channel from "../models/channelModel.js";
import {
  validateFriendRequestUsernameInput,
  validateStringInput,
  validateUpdateUserInput
} from "../utils/validators.js";

/**
 * @description Renders an user's profile page.
 * @route GET /user/:id
 * @access Public
 */
export const renderUserProfilePage = async (req, res) => {
  if (
    req.session.user &&
    req.session.user.id &&
    req.session.user.id === req.params.id
  ) {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("error/400", {
        statusCode: 404,
        error: "Unable to find user."
      });
    }

    const servers = await Promise.all(
      user.servers.map(async (serverId) => {
        const server = await Server.findById(serverId);
        if (!server) {
          return res.status(404).render("error/400", {
            statusCode: 404,
            error: "Unable to find server."
          });
        }

        return {
          id: serverId,
          name: server.name
        };
      })
    );

    const friends = await Promise.all(
      user.friends.map(async (friendId) => {
        const friend = await User.findById(friendId);
        if (!friend) {
          return res.status(404).render("error/400", {
            statusCode: 404,
            error: "Unable to find user."
          });
        }

        return {
          id: friendId,
          username: friend.username
        };
      })
    );

    const friendRequests = await Promise.all(
      user.friendRequests.map(async (friendRequestId) => {
        const user = await User.findById(friendRequestId);
        if (!user) {
          return res.status(404).render("error/400", {
            statusCode: 404,
            error: "Unable to find user."
          });
        }

        return {
          id: friendRequestId,
          username: user.username
        };
      })
    );

    return res.status(200).render("user/profile", {
      username: req.session.user.username,
      bio: req.session.user.bio,
      darkMode: req.session.user.darkMode,
      servers: servers,
      friends: friends,
      friendRequests: friendRequests,
      authenticated: true
    });
  } else {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("error/400", {
        statusCode: 404,
        error: "Unable to find user."
      });
    }

    return res.status(200).render("user/profile", {
      username: user.username,
      bio: user.bio,
      authenticated: false
    });
  }
};

/**
 * @description Updates an user's profile.
 * @route PATCH /user
 * @access Private
 */
export const updateUser = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "Current user cannot be found." });
  }

  const { bio, darkMode } = req.body;

  try {
    validateUpdateUserInput(bio, darkMode);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  if (user.bio === bio && user.darkMode === darkMode) {
    return res.status(400).json({ error: "Nothing has changed." });
  }

  user.bio = bio;
  user.darkMode = darkMode;

  const savedUser = await user.save();
  if (!savedUser) {
    return res.status(500).json({ error: "Unable to save user." });
  }

  return res.status(200).json({ success: "Successfully updated user." });
};

/**
 * @description Deletes an user's account.
 * @route DELETE /user
 * @access Private
 */
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "Current user cannot be found." });
  }

  const otherUsers = await User.find({
    $or: [
      {
        friends: { $in: user.id }
      },
      {
        friendRequests: { $in: user.id }
      }
    ]
  });
  otherUsers.forEach(async (otherUser) => {
    if (otherUser.friends.includes(user.id)) {
      otherUser.friends.splice(otherUser.friends.indexOf(user.id), 1);
    }
    if (otherUser.friendRequests.includes(user.id)) {
      otherUser.friendRequests.splice(
        otherUser.friendRequests.indexOf(user.id),
        1
      );
    }
    const savedOtherUser = await otherUser.save();
    if (!savedOtherUser) {
      return res
        .status(500)
        .json({ error: "Unable to remove user from other user." });
    }
  });

  const servers = await Server.find({
    users: { $elemMatch: { id: user.id } }
  });
  servers.forEach(async (server) => {
    if (user.id === server.creatorId) {
      const deletedChannels = await Channel.deleteMany({ serverId: server.id });
      if (!deletedChannels) {
        return res
          .status(500)
          .json({ error: "Unable to delete server channels." });
      }

      const deletedServer = await Server.deleteOne({ creatorId: user.id });
      if (!deletedServer) {
        return res.status(500).json({ error: "Unable to delete server." });
      }
    } else {
      const index = server.users.map((server) => server.id).indexOf(user.id);

      server.users.splice(index, 1);

      const savedServer = await server.save();
      if (!savedServer) {
        return res
          .status(500)
          .json({ error: "Unable to remove user from server." });
      }
    }
  });

  const deletedPrivateMessages = await PrivateMessage.deleteMany({
    users: { $in: user.id }
  });
  if (!deletedPrivateMessages) {
    return res.status(500).json({ error: "Unable to delete private message." });
  }

  const deletedUser = await User.findByIdAndDelete(user.id);
  if (!deletedUser) {
    return res.status(500).json({ error: "Unable to delete user." });
  }

  req.session.destroy();

  return res.status(200).json({ success: "Successfully deleted user." });
};

/**
 * @description Sends a friend request to an user.
 * @route POST /user/friend
 * @access Private
 */
export const createFriendRequest = async (req, res) => {
  const { username } = req.body;

  try {
    validateFriendRequestUsernameInput(username);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const targetUser = await User.findOne({ username });
  if (!targetUser) {
    return res.status(404).json({ error: "Target user cannot be found." });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "Current user cannot be found." });
  }

  if (targetUser.id === req.session.user.id) {
    return res
      .status(400)
      .json({ error: "Can't send friend request to yourself." });
  }

  if (user.friends.includes(targetUser.id)) {
    return res.status(400).json({ error: "Target user is already a friend." });
  }

  if (targetUser.friendRequests.includes(req.session.user.id)) {
    return res.status(400).json({ error: "Already sent friend request." });
  }

  targetUser.friendRequests.push(req.session.user.id);
  const savedTargetUser = await targetUser.save();
  if (!savedTargetUser) {
    return res.status(500).json({ error: "Unable to send friend request." });
  }

  return res.status(200).json({ success: "Friend request sent." });
};

/**
 * @description Removes an user from friends.
 * @route DELETE /user/friend
 * @access Private
 */
export const removeFriend = async (req, res) => {
  const { id } = req.body;

  try {
    validateStringInput(id, "Id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const otherUser = await User.findById(id);
  if (!otherUser) {
    return res.status(404).json({ error: "Other user cannot be found." });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "Current user cannot be found." });
  }

  const savedPrivateMessage = await PrivateMessage.deleteOne({
    users: { $in: [otherUser.id, user.id] }
  });
  if (!savedPrivateMessage) {
    return res.status(500).json({ error: "Unable to remove private message." });
  }

  otherUser.friends.splice(otherUser.friends.indexOf(user.id), 1);
  user.friends.splice(user.friends.indexOf(otherUser.id), 1);
  const savedOtherUser = await otherUser.save();
  const savedUser = await user.save();
  if (!savedOtherUser || !savedUser) {
    return res
      .status(500)
      .json({ error: "Unable to remove user from friends." });
  }

  return res.status(200).json({ success: "Successfully removed user." });
};

/**
 * @description Accepts a friend request from an user.
 * @route POST /user/friendRequest/accept
 * @access Private
 */
export const acceptFriendRequest = async (req, res) => {
  const { id } = req.body;

  try {
    validateStringInput(id, "Id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const senderUser = await User.findById(id);
  if (!senderUser) {
    return res.status(404).json({ error: "Sender user cannot be found." });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "Current user cannot be found." });
  }

  if (
    user.friends.includes(senderUser.id) ||
    senderUser.friends.includes(user.id)
  ) {
    return res.status(400).json({ error: "Sender user is already a friend." });
  }

  user.friends.push(senderUser.id);
  user.friendRequests.splice(user.friendRequests.indexOf(senderUser.id), 1);
  senderUser.friends.push(user.id);

  const privateMessage = await PrivateMessage.create({
    users: [user.id, senderUser.id]
  });
  if (!privateMessage) {
    return res.status(500).json({ error: "Unable to create private message." });
  }

  const savedUser = await user.save();
  const savedSenderUser = await senderUser.save();
  if (!savedUser || !savedSenderUser) {
    return res.status(500).json({ error: "Unable to add user as friend." });
  }

  return res.status(200).json({
    success: `Successfully added ${senderUser.username} as a friend.`,
    data: {
      id: senderUser.id,
      username: senderUser.username
    }
  });
};

/**
 * @description Rejects a friend request from an user.
 * @route POST /user/friendRequest/reject
 * @access Private
 */
export const rejectFriendRequest = async (req, res) => {
  const { id } = req.body;

  try {
    validateStringInput(id, "Id");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = await User.findById(req.session.user.id);
  if (!user) {
    return res.status(404).json({ error: "Current user cannot be found." });
  }

  user.friendRequests.splice(user.friendRequests.indexOf(id), 1);
  const savedUser = await user.save();
  if (!savedUser) {
    return res.status(500).json({ error: "Unable to reject friend request." });
  }

  return res.status(200).json({
    success: `Successfully rejected friend request`
  });
};
