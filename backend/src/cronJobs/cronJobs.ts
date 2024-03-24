import { CronJob } from "cron";
import { RoundPlayingNow } from "../helpers/roundScheduler";
import { Betslips } from "../services/betslips/Betslips";
import { Wallets } from "../services/wallets.ts/Wallets";
import { request, response } from "express";
import {
  BundesligaServer,
  EPLServer,
  LaLigaServer,
  SerieAServer,
} from "../config/socketio";
import { checkUserBTCDeposits } from "../services/BTCWallets.ts/checkUserBTCDeposits";
import { confirmUserBTCDeposits } from "../services/BTCWallets.ts/confirmUserBTCDeposits";

//have each league with its own cron job

export const EPLeagueCron = new CronJob(" 0/8 * * * *", async () => {
  try {
    console.log("Hourly EPL league cron job started");
    await RoundPlayingNow.startRound(request, response, "EPL", EPLServer);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

export const LaLigaLeagueCron = new CronJob(" 0/8 * * * *", async () => {
  try {
    console.log("Hourly LaLiga league cron job started");
    await RoundPlayingNow.startRound(request, response, "LaLiga", LaLigaServer);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

export const BundesligaLeagueCron = new CronJob(" 0/8 * * * *", async () => {
  try {
    console.log("Hourly Bundesliga league cron job started");
    await RoundPlayingNow.startRound(
      request,
      response,
      "Bundesliga",
      BundesligaServer
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

export const SerieLeagueCron = new CronJob(" 0/8 * * * *", async () => {
  try {
    console.log("Hourly SerieA league cron job started");
    await RoundPlayingNow.startRound(request, response, "SerieA", SerieAServer);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

const checkSlipsCron = new CronJob("0/5 * * * *", async () => {
  try {
    console.log("Running checkSlipsCron job");
    await Betslips.processBetslips();
  } catch (err) {
    console.error(err);
  }
});

const payUserWalletsCron = new CronJob("0/5 * * * *", async () => {
  try {
    console.log("Running payUserWalletsCron");
    await Wallets.payBetslips();
  } catch (err) {
    console.error(err);
  }
});

const checkBTCDepositsCron = new CronJob("0/2 * * * *", async () => {
  console.log("running checkBTCDepositsCron");
  await checkUserBTCDeposits();
});

const confirmUserBTCDepositsCron = new CronJob("0/3 * * * *", async () => {
  console.log("running confirmUserBTCDepositsCron");
  await confirmUserBTCDeposits();
});

export const startCronJobs = () => {
  try {
    /* EPLeagueCron.start();
    LaLigaLeagueCron.start();
    BundesligaLeagueCron.start();
    SerieLeagueCron.start(); */
    checkSlipsCron.start();
    payUserWalletsCron.start();
    checkBTCDepositsCron.start();
    confirmUserBTCDepositsCron.start();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
