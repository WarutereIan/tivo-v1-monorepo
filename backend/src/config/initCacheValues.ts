import { RoundCounter } from "../models/RoundCounter";
import { Season } from "../models/Season";
import { seasonFixtures } from "../services/gameManager";
import { RedisClient } from "./db";
import { leagues } from "./leagues";

export const initCacheValues = async () => {
  try {
    /* let _Season = await Season.findOne();
    let currentSeasonNumber = 0;
    if (_Season) {
      currentSeasonNumber = _Season.currentSeasonNumber;
      await RedisClient.set("currentSeasonNumber", currentSeasonNumber);
      console.log("set currentSeasonNumber in cache as", currentSeasonNumber);
    } else throw new Error("Could not set cache values @initCacheValues");

    let Round = await RoundCounter.findOne();
    if (Round) {
      const currentRound = Round.currentRound;
      await RedisClient.set("currentRound", currentRound);
      console.log("set currentRound number as ", currentRound);
    } else throw new Error("Could not set currentRound value @initCacheValues");

    await seasonFixtures.storeFixturesInCache();
    console.log("Football Match fixtures stored in cache \n"); */

    leagues.forEach(async (league) => {
      let _Season = await Season.findOne({ league: league });
      let currentSeasonNumber = 0;
      if (_Season) {
        currentSeasonNumber = _Season.currentSeasonNumber;
        await RedisClient.set(
          `currentSeasonNumber_${league}`,
          currentSeasonNumber
        );
        console.log(
          "set currentSeasonNumber in cache as",
          currentSeasonNumber,
          league
        );
      } else throw new Error("Could not set cache values @initCacheValues");

      let Round = await RoundCounter.findOne({ league: league });
      if (Round) {
        const currentRound = Round.currentRound;
        await RedisClient.set(`currentRound_${league}`, currentRound);
        console.log("set currentRound number as ", currentRound);
      } else
        throw new Error("Could not set currentRound value @initCacheValues");

      await seasonFixtures.storeFixturesInCache();
      console.log("Football Match fixtures stored in cache for ", league, "\n");

      await RedisClient.set(`roundStartedBool_${league}`, 0);
      console.log("RoundStartedBool set to false for league", league, "\n");
    });
  } catch (err) {
    console.error(err);
    process.exit();
  }
};
