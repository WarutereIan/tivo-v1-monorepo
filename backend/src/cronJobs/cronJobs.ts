import { CronJob } from "cron";
import { RoundPlayingNow } from "../helpers/roundScheduler";
import { Odds } from "../services/bookMaker";

export const playLeagueCron = new CronJob("50 * * * * *", async () => {
  console.log("Hourly league cron job started");
  await RoundPlayingNow.startRound();
});

export const setRoundOddsCron = new CronJob("59 * * * * *", async () => {
  console.log(`\n Setting next round odds: setRoundsCron job started`);
  await Odds.setRoundOds();
});
