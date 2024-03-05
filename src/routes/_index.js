const constructorMethod = (app) => {
  app.use("*", (_req, res) => {
    return res.status(404).json({ error: "Route not found." });
  });
};

export default constructorMethod;
