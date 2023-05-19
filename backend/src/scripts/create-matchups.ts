import { connectDB } from "../config/db";
import { Match } from "../models/Match"
import { TeamsMatches } from "../models/Teams_Matches";

const teams = [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolves' 
]

;(async ()=>{
    await connectDB()
})()

const teamsMatches: string[] = []
let homeTeam: string
let awayTeam: string

const seedTeams = async(teamsArray: string[])=>{
    for(let i=0;i<teamsArray.length;i++){
        for(let j=0; j<teamsArray.length;j++){

            if(i!==j){
                homeTeam = teamsArray[i]
                awayTeam = teamsArray[j]
    
                const match = await Match.create({
                    homeTeam,
                    awayTeam})
                teamsMatches.push(match.id) 
            }
           
        }
        const TeamsMatchesList = await TeamsMatches.create({
            teamName: homeTeam,
            listOfMatches: teamsMatches
        }) 

        teamsMatches.length = 0 //clear array after every iteration so that values are not persistent in the next iteration
        console.log(TeamsMatchesList)
    }

    return true
}

seedTeams(teams).then((result:any)=>{
    result? console.log('done'):console.log('failed')
})