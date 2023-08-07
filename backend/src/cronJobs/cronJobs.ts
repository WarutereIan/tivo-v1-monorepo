import { CronJob } from "cron";
import { RoundPlayingNow } from "../helpers/roundScheduler";
import { Betslips } from "../services/betslips/Betslips";
import { Wallets } from "../services/wallets.ts/Wallets";
import { request, response } from "express";

export const playLeagueCron = new CronJob(" 0/8 * * * *", async () => {
  try {
    console.log("Hourly league cron job started");
    await RoundPlayingNow.startRound(request, response);
  } catch (err) {
    console.error(err);
  }
});

export const checkSlipsCron = new CronJob("0/5 * * * *", async () => {
  try {
    console.log("Running checkSlipsCron job");
    await Betslips.processBetslips();
  } catch (err) {
    console.error(err);
  }
});

export const payUserWalletsCron = new CronJob("0/5 * * * *", async () => {
  try {
    console.log("Running payUserWalletsCron");
    await Wallets.payBetslips();
  } catch (err) {
    console.error(err);
  }
});
