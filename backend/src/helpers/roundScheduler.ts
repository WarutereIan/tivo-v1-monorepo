import { Request, Response, request, response } from "express";
import { RoundCounter } from "../models/RoundCounter";
import { PlayRound, seasonFixtures } from "../services/gameManager";
import { RedisClient } from "../config/db";
import { Match } from "../models/Match";
import { createNewSeason, resetTeamScores } from "../services/resetSeason";
import { SeasonCounter } from "../models/SeasonCounter";
import { calculateTeamStrengths } from "../services/calculateGoalsOdds";
import { Odds } from "../services/bookMaker";
import { playLeagueCron } from "../cronJobs/cronJobs";
import { clients } from "../constants/sseClients";
import { IClient } from "../types/ISSEClient";

let liveRound: PlayRound, currentSeasonNumber: number;

export const RoundPlayingNow = {
  startRound: async (req: Request, res: Response) => {
    try {
      const currentSeasonNumber = Number(
        await RedisClient.get("currentSeasonNumber")
      );

      const currentRoundDocument = await RoundCounter.findOne();

      if (currentRoundDocument) {
        const currentRound = currentRoundDocument.currentRound;
        console.log("roundscheduler currentRound", currentRound);

        if (currentRound >= 37) {
          //reset round counter to zero in mongodb and create new season
          return createNewSeason().then((res) => {
            if (res) {
              calculateTeamStrengths().then(async (res) => {
                if (res) {
                  await resetTeamScores();
                }
              });
            }
          }); //also creates league averages from last season's data, to be used in calculating team strengths in next step
        }

        await RedisClient.set("roundStartedBool", "true");
        await RedisClient.set("currentRound", currentRound);
        if (currentRound >= 37) await RedisClient.set("nextRound", 0);
        else await RedisClient.set("nextRound", 1 + currentRound);
        liveRound = new PlayRound(currentRound, currentSeasonNumber); //add means to check whether round is completed

        console.info("\n New hourly round started:", currentRound);

        await RoundCounter.findOneAndUpdate(
          {},
          { currentRound: 1 + currentRound }
        );

        await seasonFixtures.storeFixturesInCache(); //update fixtures stored in cache
        //set match odds
        broadcastStream(req, res, clients);
        return await Odds.setRoundOdds();
      } else {
        return console.error("\n Current round number not fetched! \n");
      }
    } catch (err) {
      console.error(err);
    }
  },
  getCurrentRoundStats: async (req: Request, res: Response) => {
    try {
      const roundStartedBool = await RedisClient.get("roundStartedBool");

      const nextDate = playLeagueCron.nextDate();

      const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      };

      res.writeHead(200, headers);

      if (roundStartedBool !== "true") {
        const data = JSON.stringify({
          success: false,
          roundStatus: `Not started`,
          nextStartsAt: nextDate.toISOTime(),
        });

        const clientId = Date.now();

        const newClient = {
          id: clientId,
          response: res,
        };

        clients.push(newClient);
        console.log("clients", clients.length);

        res.write(`data: ${data} \n\n`);

        req.on(`close`, () => {
          console.log(`${clientId} Connection closed`);
          const index = clients.findIndex(
            (client: any) => client.id == newClient.id
          );
          clients.splice(index - 1, 1);
          console.log(clients.length);
        });
      } else {
        const clientId = Date.now();

        const newClient = {
          id: clientId,
          response: res,
        };

        clients.push(newClient);
        console.log("clients", clients.length);

        req.on(`close`, () => {
          console.log(`${clientId} Connection closed`);
          const index = clients.findIndex(
            (client: any) => client.id == newClient.id
          );
          clients.splice(index - 1, 1);
          console.log("clients", clients.length);
        });
      }
    } catch (err) {
      console.error(err);
      return res.write("data: Internal server error \n\n");
    }
  },
  getNextRoundMatches: async (req: Request, res: Response) => {
    try {
      const nextRound = Number(await RedisClient.get("nextRound"));
      const currentSeasonNumber = Number(
        await RedisClient.get("currentSeasonNumber")
      );
      //let nextRound = 0;
      //currentRound ? (nextRound = Number(currentRound) + 1) : null;
      console.log("get next round matches nextround", nextRound);
      if (nextRound > 37) {
        const nextRoundMatches = await Match.find({
          round: 0,
          season: currentSeasonNumber + 1,
        });
        return res.status(200).json({
          success: true,
          nextRoundMatches,
        });
      }

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

const broadcastStream = (req: Request, res: Response, clients: IClient[]) => {
  liveRound.getLiveRoundStats(req, res, clients);
};
