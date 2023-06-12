import Tournament from "round-robin-tournament";
import { connectDB } from "../config/db";
import { type } from "os";
import { Match } from "../models/Match";
import { RoundCounter } from "../models/RoundCounter";
import { Team } from "../models/Team";

/**
 * creates fixtures fot a season. provide array of teams in string as in EPLTeams.
 * When calling script seasons can be added
 *
 *
 */

(async () => {
  await connectDB();
})();

let EPLTeams: string[] = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Brentford",
  "Brighton",
  "Chelsea",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Leeds United",
  "Leicester City",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Southampton",
  "Tottenham Hotspur",
  "West Ham United",
  "Wolves",
];
let TEAMS = [];

let currentRound = 0;

for (let i = 0; i < EPLTeams.length; i++) {
  TEAMS.push({ id: i + 1, name: EPLTeams[i] });
}

const tournament = new Tournament(TEAMS);
const matches = tournament.matches; //gives an array of rounds, each round an array of matches in the round

for (let i = 0; i < matches.length; i++) {
  let roundMatches = matches[i];

  for (let j = 0; j < roundMatches.length; j++) {
    const match = roundMatches[j];
    //console.log(`match ${j}`, match);
    const homeObject = match[0];

    let homeEntriesArr = Object.entries(homeObject);
    let homeTeam = homeEntriesArr[1][1];
    ///console.log("hometeam", homeTeam);

    const awayObject = match[1];

    let awayEntriesArr = Object.entries(awayObject);
    let awayTeam = awayEntriesArr[1][1];

    Match.create({
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      round: i,
      season: 0,
    }).then((res) => {
      //console.log(res);
    });
  }
}

//create Teams:
for (let i = 0; i < EPLTeams.length; i++) {
  Team.create({
    name: EPLTeams[i],
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goal_difference: 0,
    points: 0,
  }).then();
}
console.log("Teams created in db");
RoundCounter.create({ currentRound }).then((res) => {
  console.log("Round counter created with document ", res);
});
