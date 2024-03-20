import User from "../models/userModel.js";
import Server from "../models/serverModel.js";

/**
 * @description Renders an user's profile page
 * @route GET /user/:id
 * @access Private
 */
export const renderUserProfilePage = async (req, res) => {
  if (req.session.user.id !== req.params.id)
    return res.status(401).redirect("auth/login");

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

      return await {
        id: friendId,
        username: friend.username
      };
    })
  );

  console.log(servers);

  return res.status(200).render("user/profile", {
    username: req.session.user.username,
    bio: user.bio,
    servers: servers,
    friends: friends
  });
};
