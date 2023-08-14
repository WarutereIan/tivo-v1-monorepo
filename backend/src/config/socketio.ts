import { Server } from "socket.io";

import { RedisClient } from "./db";
import {
  BundesligaLeagueCron,
  EPLeagueCron,
  LaLigaLeagueCron,
  SerieLeagueCron,
} from "../cronJobs/cronJobs";

export const EPLServer = new Server({ path: "/streams/tivo-epl" });
export const BundesligaServer = new Server({
  path: "/streams/tivo-bundesliga",
});
export const SerieAServer = new Server({ path: "/streams/tivo-seriea" });
export const LaLigaServer = new Server({ path: "/streams/tivo-laliga" });

EPLServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_EPL`);

  const nextDate = EPLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    setTimeout(() => {
      const data = {
        success: false,
        roundStatus: `Not started`,
        nextStartsAt: nextDate.toISOTime(),
      };

      socket.emit("not_started", data);
    }, 1000);
  }
});

BundesligaServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_Bundesliga`);

  const nextDate = BundesligaLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    setTimeout(() => {
      const data = {
        success: false,
        roundStatus: `Not started`,
        nextStartsAt: nextDate.toISOTime(),
      };

      socket.emit("not_started", data);
    }, 1000);
  }
});

SerieAServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_SerieA`);

  const nextDate = SerieLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    setTimeout(() => {
      const data = {
        success: false,
        roundStatus: `Not started`,
        nextStartsAt: nextDate.toISOTime(),
      };

      socket.emit("not_started", data);
    }, 1000);
  }
});

LaLigaServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_LaLiga`);

  const nextDate = LaLigaLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    setTimeout(() => {
      const data = {
        success: false,
        roundStatus: `Not started`,
        nextStartsAt: nextDate.toISOTime(),
      };

      socket.emit("not_started", data);
    }, 1000);
  }
});

export const startStreamingServers = () => {
  try {
    EPLServer.listen(51000);
    console.info(`EPLStreamingServer started on port 51000 \n`);

    BundesligaServer.listen(6000);
    console.info(`BundesligaStreamingServer started on port 6000 \n`);

    LaLigaServer.listen(61000);
    console.info(`LaLigaStreamingServer started on port 61000 \n`);

    SerieAServer.listen(7000);
    console.info(`SerieAStreamingServer started on port 7000 \n`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
