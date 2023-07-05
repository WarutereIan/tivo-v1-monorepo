import { CronJob } from "cron";
import { RoundPlayingNow } from "../helpers/roundScheduler";
import { processBetslips } from "../services/betslips/processBetslips";

export const playLeagueCron = new CronJob("30 * * * * *", async () => {
  try {
    console.log("Hourly league cron job started");
    await RoundPlayingNow.startRound();
  } catch (err) {
    console.error(err);
  }
});

export const checkSlipsCron = new CronJob("20 * * * * *", async () => {
  try {
    console.log("Running checkSlipsCron job");
    await processBetslips.processBetslips();
  } catch (err) {
    console.error(err);
  }
});

//job runs every 10th second of the minute
/* export const setRoundOddsCron = new CronJob("05 0-59 * * * *", () => {
  console.log(`\n Setting next round odds: setRoundsCron job started`);
  Odds.setRoundOdds().then();
}); */

//set one job with round starting only after odds are set
