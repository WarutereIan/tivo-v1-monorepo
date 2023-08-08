import { RedisClient } from "../config/db";
import { io } from "../config/socketio";
import { playLeagueCron } from "../cronJobs/cronJobs";

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
