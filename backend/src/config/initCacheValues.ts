import { SeasonCounter } from "../models/SeasonCounter";
import { seasonFixtures } from "../services/gameManager";
import { RedisClient } from "./db";

export const initCacheValues = async () => {
  try {
    await seasonFixtures.storeFixturesInCache();
    console.log("Football Match fixtures stored in cache \n");

    await RedisClient.set("roundStartedBool", 0);
    console.log("RoundStartedBool set to false \n");

    let Season = await SeasonCounter.findOne();
    let currentSeasonNumber = 0;
    if (Season) {
      currentSeasonNumber = Season.currentSeasonNumber;
      await RedisClient.set("currentSeasonNumber", currentSeasonNumber);
      console.log("set currentSeasonNumber in cache as", currentSeasonNumber);
    } else throw new Error("Could not set cache values @initCacheValues");
  } catch (err) {
    console.error(err);
  }
};
