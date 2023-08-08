//setup sockets server for streaming football matches

import { RedisClient } from "./src/config/db";
import { io } from "./src/config/socketio";
import { playLeagueCron } from "./src/cronJobs/cronJobs";

//streaming will be proxied to this server in nginx
io.listen(5500);

console.log("Sockets server started on port 5500");

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
