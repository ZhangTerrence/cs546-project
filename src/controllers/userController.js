import User from "../models/userModel.js";
import Server from "../models/serverModel.js";

/**
 * @description Renders an user's profile page
 * @route GET /user/:id
 * @access Public
 */
export const renderUserProfilePage = async (req, res) => {
  if (
    req.session.user &&
    req.session.user.id &&
    req.session.user.id === req.params.id
  ) {
    const user = await User.findById(req.session.user.id);
    if (!user)
      return res.status(500).render("error/500", {
        error: "Unable to find user."
      });

    const servers = await Promise.all(
      user.servers.map(async (serverId) => {
        const server = await Server.findById(serverId);
        if (!server)
          return res.status(500).render("error/500", {
            error: "Unable to find server."
          });

        return {
          id: serverId,
          name: server.name
        };
      })
    );

    const friends = await Promise.all(
      user.friends.map(async (friendId) => {
        const friend = await User.findById(friendId);
        if (!friend)
          return res.status(500).render("error/500", {
            error: "Unable to find user."
          });

        return {
          id: friendId,
          username: friend.username
        };
      })
    );

    return res.status(200).render("user/profile", {
      username: req.session.user.username,
      bio: user.bio,
      servers: servers,
      friends: friends,
      authenticated: true
    });
  } else {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(500).render("error/500", {
        error: "Unable to find user."
      });

    return res.status(200).render("user/profile", {
      username: user.username,
      bio: user.bio,
      authenticated: false
    });
  }
};

/**
 * @description Sends a friend request to an user.
 * @route POST /user
 * @access Private
 */
export const sendFriendRequest = async (req, res) => {
  const { username } = req.body;

  const friendRequestedUser = await User.findOne({ username });
  if (!friendRequestedUser)
    return res.status(500).json({ error: "User cannot be found." });

  if (friendRequestedUser._id === req.session.user.id)
    return res
      .status(400)
      .json({ error: "Can't send friend request to yourself." });

  if (friendRequestedUser.friendRequests.includes(req.session.user.id))
    return res.status(400).json({ error: "Already sent friend request." });

  friendRequestedUser.friendRequests.push(req.session.user.id);
  const success = await friendRequestedUser.save();
  if (!success)
    return res.status(500).json({ error: "Unable to send friend request." });

  return res.json(200).json({ success: "Friend request sent." });
};
