// View controllers

/**
 * @description Renders an user's profile page
 * @route GET /user/:id
 * @access Private
 */
export const renderUserProfilePage = async (req, res) => {
  if (req.session.user.id !== req.params.id)
    return res.status(401).redirect("/login");

  return res.status(200).render("user/profile", {
    username: req.session.user.username
  });
};

export const getUser = async (_req, res) => {
  return res.status(200).json([]);
};
