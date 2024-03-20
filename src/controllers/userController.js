import User from "../models/userModel.js";
import Server from "../models/serverModel.js";

/**
 * @description Renders an user's profile page
 * @route GET /user/:id
 * @access Private
 */
export const renderUserProfilePage = async (req, res) => {
  if (req.session.user.id !== req.params.id)
    return res.status(401).redirect("/login");

  const user = await User.findById(req.session.user.id);
  if (!user)
    return res.status(500).render("error/500", {
      error: "Unable to find user."
    });

  const servers = user.servers.map(async (serverId) => {
    const server = await Server.findById(serverId);
    if (!server)
      return res.status(500).render("error/500", {
        error: "Unable to find server."
      });

    return {
      id: serverId,
      name: server.name
    };
  });

  const friends = user.friends.map(async (friendId) => {
    const friend = await User.findById(friendId);
    if (!friend)
      return res.status(500).render("error/500", {
        error: "Unable to find user."
      });

    return {
      id: friendId,
      username: friend.username
    };
  });

  console.log(servers, friends);

  return res.status(200).render("user/profile", {
    username: req.session.user.username,
    bio: user.bio,
    servers: servers,
    friends: friends
  });
};
