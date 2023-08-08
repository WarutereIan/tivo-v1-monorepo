import { Server } from "socket.io";
import { playLeagueCron } from "../cronJobs/cronJobs";
import { RedisClient } from "./db";

export const io = new Server();

io.on("connection", async (socket) => {
  const roundStartedBool = await RedisClient.get("roundStartedBool");

  const nextDate = playLeagueCron.nextDate();

  if (roundStartedBool !== "true") {
    const data = {
      success: false,
      roundStatus: `Not started`,
      nextStartsAt: nextDate.toISOTime(),
    };

    socket.emit("not_started", data);
  }
});
