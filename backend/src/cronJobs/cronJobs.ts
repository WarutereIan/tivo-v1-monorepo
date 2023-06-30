import { CronJob } from "cron";
import { RoundPlayingNow } from "../helpers/roundScheduler";

export const playLeagueCron = new CronJob("30 * * * * *", async () => {
  console.log("Hourly league cron job started");
  await RoundPlayingNow.startRound();
});

//job runs every 10th second of the minute
/* export const setRoundOddsCron = new CronJob("05 0-59 * * * *", () => {
  console.log(`\n Setting next round odds: setRoundsCron job started`);
  Odds.setRoundOdds().then();
}); */

//set one job with round starting only after odds are set
