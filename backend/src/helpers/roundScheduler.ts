import { Request, Response, request, response } from "express";
import { RoundCounter } from "../models/RoundCounter";
import { PlayRound, seasonFixtures } from "../services/gameManager";
import { RedisClient } from "../config/db";
import { Match } from "../models/Match";
import { createNewSeason, resetTeamScores } from "../services/resetSeason";
import { calculateTeamStrengths } from "../services/calculateGoalsOdds";
import { Odds } from "../services/bookMaker";
import { leagues } from "../config/leagues";
import { Server } from "socket.io";

let liveRound: PlayRound, currentSeasonNumber: number;

export const RoundPlayingNow = {
  startRound: async (
    req: Request,
    res: Response,
    league: string,
    leagueServer: Server
  ) => {
    //pass league specific socket server
    try {
      const currentSeasonNumber = Number(
        await RedisClient.get(`currentSeasonNumber_${league}`)
      );

      const currentRoundDocument = await RoundCounter.findOne({
        league: league,
      });

      if (currentRoundDocument) {
        const currentRound = currentRoundDocument.currentRound;
        console.log("roundscheduler currentRound", currentRound, league);

        if (currentRound >= 37) {
          //reset round counter to zero in mongodb and create new season
          return createNewSeason(league).then((res) => {
            if (res) {
              calculateTeamStrengths(league).then(async (res) => {
                if (res) {
                  await resetTeamScores(league);
                }
              });
            }
          }); //also creates league averages from last season's data, to be used in calculating team strengths in next step
        }

        await RedisClient.set(`roundStartedBool_${league}`, "true");
        await RedisClient.set(`currentRound_${league}`, currentRound);
        if (currentRound >= 37) await RedisClient.set(`nextRound_${league}`, 0);
        else await RedisClient.set(`nextRound_${league}`, 1 + currentRound);
        liveRound = new PlayRound(
          currentRound,
          currentSeasonNumber,
          league,
          leagueServer
        ); //add means to check whether round is completed

        console.info("\n New hourly round started:", league, currentRound);

        await RoundCounter.findOneAndUpdate(
          { league: league },
          { currentRound: 1 + currentRound }
        );

        await seasonFixtures.storeFixturesInCache(); //update fixtures stored in cache
        //set match odds
        //broadcastStream(req, res, clients);
        return await Odds.setRoundOdds(league);
      } else {
        return console.error("\n Current round number not fetched! \n");
      }
    } catch (err) {
      console.error(err);
    }
  },
  //got replaced with socket.io server
  //TODO: improve the client id generator to uuid instead of time incase of simultaneous connections
  /* getCurrentRoundStats: async (req: Request, res: Response) => {
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
  }, */
  getNextRoundMatches: async (req: Request, res: Response) => {
    try {
      //return next round matches for each of the leagues in object

      let NextRoundMatches: { [index: string]: {} } = {};

      for (let i = 0; i < leagues.length; i++) {
        const league = leagues[i];
        const nextRound = Number(await RedisClient.get(`nextRound_${league}`));

        let nextRoundMatches;
        const currentSeasonNumber = Number(
          await RedisClient.get(`currentSeasonNumber_${league}`)
        );

        if (nextRound > 37) {
          nextRoundMatches = await Match.find({
            round: 0,
            season: currentSeasonNumber + 1,
            league: league,
          });

          NextRoundMatches[league] = nextRoundMatches;
        } else {
          nextRoundMatches = await Match.find({
            round: nextRound,
            season: currentSeasonNumber,
            league: league,
          });

          NextRoundMatches[league] = nextRoundMatches;
        }
      }

      /* leagues.forEach(async (league) => {
          const nextRound = Number(
            await RedisClient.get(`nextRound_${league}`)
          );


          let nextRoundMatches;
          const currentSeasonNumber = Number(
            await RedisClient.get(`currentSeasonNumber_${league}`)
          );

          if (nextRound > 37) {
            nextRoundMatches = await Match.find({
              round: 0,
              season: currentSeasonNumber + 1,
              league: league,
            });

            NextRoundMatches[league] = nextRoundMatches;
          } else {
            nextRoundMatches = await Match.find({
              round: nextRound,
              season: currentSeasonNumber,
              league: league,
            });

            NextRoundMatches[league] = nextRoundMatches;
          }
        }); */

      return res.status(200).json({
        success: true,
        NextRoundMatches,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  },
};
