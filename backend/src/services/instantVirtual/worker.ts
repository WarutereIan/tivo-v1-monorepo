import { parentPort, workerData } from "worker_threads";
import { InstantVirtualMatch } from "./instantVirtualMatch";

const matchData = workerData;

const instantVirtual = new InstantVirtualMatch(
  matchData.matchID,
  matchData.homeTeam,
  matchData.awayTeam
);

instantVirtual.startMatch();

instantVirtual.MatchStats.subscribe((data: any) => {
  if (data == "Full time") {
    setTimeout(() => {
      parentPort?.postMessage(instantVirtual.matchResults);
    }, 50);
  }
});
