import { Request, Response } from "express";
import { Match } from "../models/Match";
import { MatchSubject } from "./MatchSubject";
import {
  combineLatest,
  forkJoin,
  interval,
  map,
  take,
  withLatestFrom,
  zip,
} from "rxjs";
import { RedisClient } from "../config/db";
import { validationResult } from "express-validator";
import { Team } from "../models/Team";
import { SeasonCounter } from "../models/SeasonCounter";
import { IClient } from "../types/ISSEClient";

/**
 * params:
 * @param roundNumber: indicate which round of games it is.
 * From this games that are to be played in this round are fetched from dbs, with their
 * ids and respective teams playing. From this, match service and settings for each match can be setup.
 *
 *
 *Match ids will be the names of the match service and respective settings, stats and play service.
 *In the playround stats the stats of all the matches are combined into one observable. This observable is subscribed to when the GET request for a live round is provisioned.
 *
 */

export class PlayRound {
  SeasonRound!: number;
  matchIDs: string[] = [];
  matchArrays: any = [];
  matchStats: any = [];
  combinedStats!: any;
  sourceSubject!: any;

  constructor(roundNumber: number, currentSeasonNumber: number) {
    /**
     * @param res is an array of objects, each object is a Match document
     */
    Match.find({ round: roundNumber, season: currentSeasonNumber }).then(
      (res) => {
        res.forEach((roundMatch: any) => {
          let homeTeam = roundMatch.homeTeam;
          let awayTeam = roundMatch.awayTeam;
          let matchID = roundMatch.id;

          let matchSubject = new MatchSubject(matchID, homeTeam, awayTeam);

          this.matchStats.push(matchSubject.MatchStats);

          this.matchArrays.push(matchSubject);
        });
        this.combinedStats = combineLatest(this.matchStats);

        this.sourceSubject = interval(2000).pipe(
          take(105),
          withLatestFrom(this.combinedStats),
          map(([counter, stats]) => {
            return stats;
          })
        );

        this.matchArrays.forEach((match: MatchSubject) => {
          match.startMatch();
        });
      }
    );
  }

  //change streaming to sockets? No. Fixed sse by maintaining client connections array
  //will have to take in clients array as argument, when data updates clients get live event updates

  getLiveRoundStats(req: Request, res: Response, clients: IClient[]) {
    try {
      console.log("\n clients getliveroundstats", clients.length);
      this.sourceSubject.subscribe((data: any) => {
        clients.forEach((client) => {
          client.response.write(`data:{success: ${true}, data:{${data} } \n\n`);
        });
      });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Internal server error");
    }
  }

  async getSingleGameStats(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    try {
      const { gameRoundID } = req.params;
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Internal server error");
    }
  }
}

//add or look for functionality to delete this round instance after round is completed

export const seasonFixtures = {
  storeFixturesInCache: async () => {
    try {
      const currentSeason = await SeasonCounter.findOne();
      const currentSeasonNumber = currentSeason?.currentSeasonNumber;

      const fixtures = await Match.find({ season: currentSeasonNumber });

      return await RedisClient.set("fixtures", JSON.stringify(fixtures));
    } catch (err) {
      console.error(err);
    }
  },

  getFixturesFromCache: async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      let _errors = errors.array().map((error) => {
        return {
          msg: error.msg,
          field: error.param,
          success: false,
        };
      })[0];
      return res.status(400).json(_errors);
    }

    try {
      let fixtures = await RedisClient.get("fixtures");
      let _fixtures;

      if (fixtures) {
        _fixtures = JSON.parse(fixtures);
        return res.status(200).json({ success: true, _fixtures });
      }
      return res
        .status(500)
        .json({ success: false, msg: "Cannot fetch season fixtures" });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send("Internal server error");
    }
  },
};
