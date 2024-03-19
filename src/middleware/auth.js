const isAuthenticated = (redirectUrl = "/login") => {
  return (req, res, next) => {
    if (!(req.session.user && req.session.id)) {
      return res.status(401).redirect(redirectUrl);
    } else {
      next();
    }
  };
};

export default isAuthenticated;
