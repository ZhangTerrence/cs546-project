const isAuthenticated = () => {
  return (req, res, next) => {
    if (!(req.session.id && req.session.user)) {
      return res.status(401).json();
    } else {
      next();
    }
  };
};

export default isAuthenticated;
