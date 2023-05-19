import { connectDB } from "../config/db";
import { League } from "../models/League";

const teamsEPL = [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolves' 
]

;(async ()=>{
    await connectDB()
})()

async function createLeague (leagueName: string, leagueTeams: string[]){
    const league = await League.create({
        leagueName: leagueName,
        listOfTeams: leagueTeams

    })

    console.log(leagueName, '\n', league)

    return true
}

createLeague('EPL',teamsEPL).then((result=> result? console.log('done creating EPL league'):console.log('failed')))
