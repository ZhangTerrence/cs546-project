const isAuthenticated = (redirectUrl = "/login") => {
  return (req, res, next) => {
    if (!(req.session.user && req.session.id)) {
      next();
    } else {
      return res.redirect(redirectUrl);
    }
  };
};

export default isAuthenticated;
