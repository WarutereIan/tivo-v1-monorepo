import { MainserviceService } from "./mainservice.service";
import fs from 'fs';
import { MatchsettingsComponent } from "./matchsettings.module";
import { ScoreboardComponent } from "./scoreboard.component";
import { StatsComponent } from "./stats.component";
import { Request, Response } from "express";

const sampleGame = new MainserviceService(fs)

const setUpMatch = new MatchsettingsComponent(sampleGame)

const match = new ScoreboardComponent(sampleGame)

const statsComponent = new StatsComponent(sampleGame)

export const startMatch = (matchID: string, homeTeam: string, awayTeam: string)=>{
  
setUpMatch.ChangeTournament('UEFA Champions League')

setUpMatch.ChangeHomeTeamName(homeTeam)

setUpMatch.ChangeAwayTeamName(awayTeam)

setUpMatch.ChangeRelativeStrength(1)

setUpMatch.ChangeHomeCrowdSupport(1)

setUpMatch.ChangeHomeTeamMorale(1)

setUpMatch.ChangeAwayTeamMorale(1)

setUpMatch.ChangeHomeTeamTactics(1)

setUpMatch.ChangeAwayTeamTactics(1)

setUpMatch.proceedToMatch()

match.startMatch()

console.log(`match ${matchID} started `)
}

export const getMatch = (req: Request,res: Response)=>{

  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };

res.writeHead(200,headers)
/*
setUpMatch.ChangeTournament('UEFA Champions League')

setUpMatch.ChangeHomeTeamName('Barcelona')

setUpMatch.ChangeAwayTeamName('Juventus')

setUpMatch.ChangeRelativeStrength(1)

setUpMatch.ChangeHomeCrowdSupport(1)

setUpMatch.ChangeHomeTeamMorale(1)

setUpMatch.ChangeAwayTeamMorale(1)

setUpMatch.ChangeHomeTeamTactics(1)

setUpMatch.ChangeAwayTeamTactics(1)

setUpMatch.proceedToMatch()

match.startMatch()

console.log('match started')*/

statsComponent.stats.subscribe((data:any)=>{
  console.log(data)
  res.write(`data: ${data}\n\n`)
})

res.on('close',()=>{
  console.log('Client closed connection')
})
}