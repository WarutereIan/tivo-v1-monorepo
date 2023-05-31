import { connectDB } from "./config/db";
import express from "express";
import { configureMiddleware } from "./middlewares/config";
import { configureRoutes } from "./routes";
import { createServer } from "http";
import { cpus } from "os";
import cluster from "cluster";
import { config } from "./config/config";
import { seasonFixtures } from "./services/gameManager";

let db: any;
(async () => {
  db = await connectDB();
})();
(async () => {
  await seasonFixtures.storeFixturesInCache();
  console.log("Football Match fixtures stored in cache");
})();

//initialize express app
const app = express();

//configure Express middleware
configureMiddleware(app);

//setup routes
configureRoutes(app);

//Start server and listen for connections
const httpServer = createServer(app);

//Get number of CPUs
const numCPUs = cpus().length;

if (cluster.isPrimary) {
  //Fork workers
  for (let i = 0; i < numCPUs; i++) {
    //create a new worker process
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    //fork a new worker process
    cluster.fork();
  });
} else {
  httpServer.listen(config.PORT || 5000, () => {
    console.info(
      `/api/v1 Server started on`,
      httpServer.address(),
      `PID ${process.pid} \n`
    );
  });
}
