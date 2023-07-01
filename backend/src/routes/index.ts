import { Application } from "express";

export const configureRoutes = (app: Application) => {
  app.use("/api/v1/user/auth", require("./api/userAuth"));
  app.use("/api/v1/games/football", require("./api/football"));
  app.use("/api/v1/user/profile", require("./api/userProfile"));
};
