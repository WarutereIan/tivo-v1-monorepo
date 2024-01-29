import { Application } from "express";

export const configureRoutes = (app: Application) => {
  app.use("/api/v1/user/auth", require("./api/userAuth"));
  app.use("/api/v1/games/football", require("./api/football"));
  app.use("/api/v1/user/profile", require("./api/userProfile"));
  app.use("/api/v1/webhooks", require("./api/webhooks"));
  app.use("/api/v1/admin", require("./api/admin"));
  app.use("/api/v1/softswiss/test", require("./api/softswissWebhooksTest"));
  app.use("/api/v1/games/softswiss", require("./api/softswissGamesUser"));

  //Will need to add route for softswiss in prod
};
