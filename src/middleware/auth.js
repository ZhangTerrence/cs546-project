const isAuthenticated = (redirectUrl = "/login") => {
  return (req, res, next) => {
    if (!(req.session.user && req.session.id)) {
      return res.status(401).json({ error: redirectUrl });
    } else {
      next();
    }
  };
};

export default isAuthenticated;
