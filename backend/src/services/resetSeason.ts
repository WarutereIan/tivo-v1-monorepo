//after season ends this resets:
//teams stats: p w d l p: these are cleared
//creates new season: new matchups created but with the season field incremented

import Tournament from "round-robin-tournament";
import { RoundCounter } from "../models/RoundCounter";
import { SeasonCounter } from "../models/SeasonCounter";
import { Team } from "../models/Team";
import { Match } from "../models/Match";

let nextSeason: number;

export const createNewSeason = async () => {
  try {
    await RoundCounter.findOneAndUpdate({}, { currentRound: 0 });
    console.log("\n reset current season  counter");

    for await (const team of Team.find({})) {
      team.played =
        team.won =
        team.drawn =
        team.lost =
        team.points =
        team.goal_difference =
          0;
      await team.save();
    }
    console.log("\n Reset team stats for a new season");

    const currentSeason = await SeasonCounter.findOne({});

    if (currentSeason) {
      currentSeason.currentSeasonNumber++;
      nextSeason = currentSeason.currentSeasonNumber;
      await currentSeason.save();
    } else {
      return console.error("\n Current season number could not be fetched!!");
    }
    await createSeasonMatchups();
    return console.log(
      "\n reset stats and created new season successfully!!>>!!"
    );
  } catch (err) {
    console.error("\n Error creating new season!! \n", err);
  }
};

const createSeasonMatchups = async () => {
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
        season: nextSeason,
      }).then((res) => {
        //console.log(res);
      });
    }
  }
};
