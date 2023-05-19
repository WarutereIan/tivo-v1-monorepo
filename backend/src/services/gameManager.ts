import { MainserviceService } from "./footballMatchSimulator/mainservice.service"
import fs from 'fs'
import { MatchsettingsComponent } from "./footballMatchSimulator/matchsettings.module"
import { ScoreboardComponent } from "./footballMatchSimulator/scoreboard.component"
import { StatsComponent } from "./footballMatchSimulator/stats.component"
import { Request, Response } from "express"
import { Match } from "../models/Match"

export const GameManager = {
     playMatch: async (
        
        matchID: string,
        homeTeam: string,
        awayTeam: string,
        res: Response,
        req: Request
        
        )=>{

        const matchService = new MainserviceService(fs)
        const matchSettings = new MatchsettingsComponent(matchService)
        const matchPlay = new ScoreboardComponent(matchService)
        const matchStats = new StatsComponent(matchService)

        matchSettings.ChangeTournament('UEFA Champions League')

        matchSettings.ChangeHomeTeamName(homeTeam)

        matchSettings.ChangeAwayTeamName(awayTeam)

        matchSettings.ChangeRelativeStrength(1)

        matchSettings.ChangeHomeCrowdSupport(1)

        matchSettings.ChangeHomeTeamMorale(1)

        matchSettings.ChangeAwayTeamMorale(1)

        matchSettings.ChangeHomeTeamTactics(1)

        matchSettings.ChangeAwayTeamTactics(1)

        matchSettings.proceedToMatch()

        matchPlay.startMatch()
        
        console.log(`match ${matchID} started `)
        

    }
}

/**
 * class below organizes all the matches being played in a round
 * Matches are all kicked off at the same time, 
 * Each round has the live match stats and end results as a single observable
 * To get live games, endpoint subscribes to the batch of games being streamed live
 * 
 */

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
    SeasonRound!: number

    matchServiceArray!: MainserviceService[]
    matchSettingsArray!: MatchsettingsComponent[]
    matchPlayArray!: ScoreboardComponent[]
    matchStats!: StatsComponent[]

    [key: string]:any

     constructor(roundNumber: number){

        /**
         * @param res is an array of objects, each object is a Match document
         */
        Match.find({round: roundNumber}).then((res)=>{
            res.forEach((roundMatch:any)=>{
                let homeTeam = roundMatch.homeTeam
                let awayTeam = roundMatch.awayTeam
                let matchID = roundMatch.id

                this[''+matchID] = new MainserviceService(fs)
                console.log(this.matchID)

            })
        })
    }


}