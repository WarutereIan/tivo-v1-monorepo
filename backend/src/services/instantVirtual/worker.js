const { parentPort, workerData } = require("worker_threads");
//const InstantVirtualMatch = require("./instantVirtualMatch"); */

const { matchData } = workerData;

const path = require("path");

require("ts-node").register();
require(path.resolve(__dirname, "./worker.ts"));

/* const instantVirtual = new InstantVirtualMatch(
  matchData.matchID,
  matchData.homeTeam,
  matchData.awayTeam
);

if (instantVirtual.MatchStatus === "Full time") {
  parentPort?.postMessage({ results: instantVirtual.matchResults });
} */
