const isAuthenticated = () => {
  return (req, res, next) => {
    if (!(req.session.id && req.session.user)) {
      if (req.routeType === "api") {
        return res.status(401).json({
          error: "Unauthenticated."
        });
      } else {
        return res.status(401).render("error", {
          statusCode: 401,
          message: "Unauthenticated."
        });
      }
    } else {
      next();
    }
  };
};

export default isAuthenticated;
