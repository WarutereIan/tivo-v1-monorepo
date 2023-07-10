import { CronJob } from "cron";
import { RoundPlayingNow } from "../helpers/roundScheduler";
import { Betslips } from "../services/betslips/Betslips";
import { Wallets } from "../services/wallets.ts/Wallets";

export const playLeagueCron = new CronJob(" 30 * * * * *", async () => {
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
    await Betslips.processBetslips();
  } catch (err) {
    console.error(err);
  }
});

export const payUserWalletsCron = new CronJob("30 * * * * *", async () => {
  try {
    console.log("Running payUserWalletsCron");
    await Wallets.payBetslips();
  } catch (err) {
    console.error(err);
  }
});
