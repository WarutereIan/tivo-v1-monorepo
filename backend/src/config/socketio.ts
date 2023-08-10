import { Server } from "socket.io";

import { RedisClient } from "./db";
import {
  BundesligaLeagueCron,
  EPLeagueCron,
  LaLigaLeagueCron,
  SerieLeagueCron,
} from "../cronJobs/cronJobs";

export const EPLServer = new Server();
export const BundesligaServer = new Server();
export const SerieAServer = new Server();
export const LaLigaServer = new Server();

EPLServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_EPL`);

  const nextDate = EPLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    const data = {
      success: false,
      roundStatus: `Not started`,
      nextStartsAt: nextDate.toISOTime(),
    };

    socket.emit("not_started", data);
  }
});

BundesligaServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_Bundesliga`);

  const nextDate = BundesligaLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    const data = {
      success: false,
      roundStatus: `Not started`,
      nextStartsAt: nextDate.toISOTime(),
    };

    socket.emit("not_started", data);
  }
});

SerieAServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_SerieA`);

  const nextDate = SerieLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    const data = {
      success: false,
      roundStatus: `Not started`,
      nextStartsAt: nextDate.toISOTime(),
    };

    socket.emit("not_started", data);
  }
});

LaLigaServer.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get(`roundStartedBool_LaLiga`);

  const nextDate = LaLigaLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    const data = {
      success: false,
      roundStatus: `Not started`,
      nextStartsAt: nextDate.toISOTime(),
    };

    socket.emit("not_started", data);
  }
});

export const startStreamingServers = () => {
  try {
    EPLServer.listen(5500);
    console.log(`EPLStreamingServer started on port 5500 \n`);

    BundesligaServer.listen(6000);
    console.log(`BundesligaStreamingServer started on port 6000 \n`);

    LaLigaServer.listen(6500);
    console.log(`LaLigaStreamingServer started on port 6500 \n`);

    SerieAServer.listen(7000);
    console.log(`SerieAStreamingServer started on port 7000 \n`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
