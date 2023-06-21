import { Request, Response, request, response } from "express";
import { RoundCounter } from "../models/RoundCounter";
import { PlayRound } from "../services/gameManager";
import { RedisClient } from "../config/db";
import { Match } from "../models/Match";
import { createNewSeason } from "../services/resetSeason";
import { SeasonCounter } from "../models/SeasonCounter";
import { calculateTeamStrengths } from "../services/calculateGoalsOdds";

let liveRound: PlayRound,
  currentRound: number,
  nextRound: number,
  currentSeasonNumber: number;

/* try {
  async () => {
    const currentRoundDocument = await RoundCounter.findOne();
    currentRoundDocument
      ? (currentRound = currentRoundDocument.currentRound)
      : console.log("Current round stats not fetched");
    return currentRound;
  };
} catch (err) {
  console.error(err);
} */

export const RoundPlayingNow = {
  startRound: async () => {
    try {
      const currentSeasonCounter = await SeasonCounter.findOne({});
      currentSeasonCounter
        ? (currentSeasonNumber = currentSeasonCounter.currentSeasonNumber)
        : console.error("\n Season counter not fetched");

      const currentRoundDocument = await RoundCounter.findOne();

      if (currentRoundDocument) {
        currentRound = currentRoundDocument.currentRound;
        nextRound = 1 + currentRound;
        currentRoundDocument.currentRound++;
        await currentRoundDocument.save();
      } else {
        return console.error("\n Current round number not fetched! \n");
      }
      if (currentRound >= 37) {
        //reset round counter to zero in mongodb and create new season
        await calculateTeamStrengths(); //make it synchronous so that strengths are calculated b4 reset
        await createNewSeason();
        return console.info(
          "\n Final round in the season reached. Set up a new season! \n"
        );
      }
      await RedisClient.set("roundStartedBool", "true");
      liveRound = new PlayRound(currentRound, currentSeasonNumber); //add means to check whether round is completed

      return console.info("\n New hourly round started:", currentRound);
    } catch (err) {
      console.error(err);
    }
  },
  getCurrentRoundStats: async (req: Request, res: Response) => {
    try {
      const roundStartedBool = await RedisClient.get("roundStartedBool");

      if (roundStartedBool !== "true") {
        return res.status(200).json({
          success: false,
          roundStatus: "Round not started",
        });
      }

      liveRound.getLiveRoundStats(req, res);
    } catch (err) {
      console.error(err);
    }
  },
  getNextRoundMatches: async (req: Request, res: Response) => {
    try {
      const nextRoundMatches = await Match.find({
        round: nextRound,
        season: currentSeasonNumber,
      });
      return res.status(200).json({
        success: true,
        nextRoundMatches,
      });
    } catch (err) {}
  },
};
