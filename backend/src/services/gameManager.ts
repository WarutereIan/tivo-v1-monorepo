import { Request, Response } from "express";
import { Match } from "../models/Match";
import { MatchSubject } from "./MatchSubject";
import { combineLatest } from "rxjs";
import { RedisClient } from "../config/db";
import { validationResult } from "express-validator";

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
  matchesMapping = new Map<string, MatchSubject>();
  matchArrays: any = [];
  matchStats: any = [];
  combinedStats!: any;

  constructor(roundNumber: number) {
    /**
     * @param res is an array of objects, each object is a Match document
     */
    Match.find({ round: roundNumber }).then((res) => {
      res.forEach((roundMatch: any) => {
        let homeTeam = roundMatch.homeTeam;
        let awayTeam = roundMatch.awayTeam;
        let matchID = roundMatch.id;

        let matchSubject = new MatchSubject(matchID, homeTeam, awayTeam);

        this.matchStats.push(matchSubject.MatchStats);
        this.matchArrays.push(matchSubject);

        /*  matchSubject.MatchStats.subscribe((res:any)=>{
                    if(res){
                        console.log(res)
                    }
                    else{
                        console.log('none')
                    }

                }) */

        this.combinedStats = combineLatest(this.matchStats);
      });
      this.matchArrays.forEach((match: MatchSubject) => {
        match.startMatch();
      });
    });
  }

  getLiveRoundStats(req: Request, res: Response) {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };

    res.writeHead(200, headers);
    this.combinedStats.subscribe((res: any) => {
      res.write(`data: ${res}\n\n`);
    });

    res.on("close", () => {
      console.log("Client closed connection");
    });
  }
}

export const seasonFixtures = {
  storeFixturesInCache: async () => {
    try {
      const fixtures = await Match.find();

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
