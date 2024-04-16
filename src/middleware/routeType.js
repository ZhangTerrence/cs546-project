const routeType = (routeType) => {
  return (req, _res, next) => {
    req.routeType = routeType;
    next();
  };
};

export default routeType;
