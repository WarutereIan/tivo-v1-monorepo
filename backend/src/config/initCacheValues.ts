import { RoundCounter } from "../models/RoundCounter";
import { seasonFixtures } from "../services/gameManager";
import { RedisClient } from "./db";

export const initCacheValues = async () => {
  await seasonFixtures.storeFixturesInCache();
  console.log("Football Match fixtures stored in cache \n");

  await RedisClient.set("roundStartedBool", 0);
  console.log("RoundStartedBool set to null \n");

  /* let currentRoundDocument = await RoundCounter.findOne();
  let currentRound: number;
  if (currentRoundDocument) {
    currentRound = currentRoundDocument.currentRound;
  } else {
    console.error(`\n Current round number not fetched from db! `);
    process.exit();
  }

  await RedisClient.set("currentRound", currentRound);
  console.log("\nCurrentRound Counter set in cache"); */
};
