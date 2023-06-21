//after season ends this resets:
//teams stats: p w d l gd gs gc p : these are cleared
//creates new season: new matchups created but with the season field incremented

import Tournament from "round-robin-tournament";
import { RoundCounter } from "../models/RoundCounter";
import { SeasonCounter } from "../models/SeasonCounter";
import { Team } from "../models/Team";
import { Match } from "../models/Match";

let nextSeason: number;

export const createNewSeason = async () => {
  try {
    let total_goals_scored_away_last_season: number = 0,
      total_goals_scored_home_last_season: number = 0,
      last_season_away_goals_average: number = 0,
      last_season_home_goals_average: number = 0;

    await RoundCounter.findOneAndUpdate({}, { currentRound: 0 });
    console.log("\n reset current season  counter");

    for await (const team of Team.find({})) {
      total_goals_scored_away_last_season += team.goals_scored_away;
      total_goals_scored_home_last_season += team.goals_scored_home;

      team.played =
        team.won =
        team.drawn =
        team.lost =
        team.points =
        team.goal_difference =
        team.goals_conceded =
        team.goals_scored =
          0;
      await team.save();
    }

    console.log("\n Reset team stats for a new season");

    //let all teams be accounted for before storing new season stats
    last_season_away_goals_average = Number(
      (total_goals_scored_away_last_season / 38).toFixed(3)
    );
    last_season_home_goals_average = Number(
      (total_goals_scored_home_last_season / 38).toFixed(3)
    );
    console.log(
      `
      last season stats: total away`,
      total_goals_scored_away_last_season,
      ` 
        total home: `,
      total_goals_scored_home_last_season,
      `
        avergages away and home: `,
      last_season_away_goals_average,
      ` `,
      last_season_home_goals_average
    );

    const season = await SeasonCounter.findOne({});

    if (season) {
      season.currentSeasonNumber++;
      season.total_goals_scored_away_last_season =
        total_goals_scored_away_last_season;
      season.total_goals_scored_home_last_season =
        total_goals_scored_home_last_season;
      season.last_season_away_goals_average = last_season_away_goals_average;
      season.last_season_home_goals_average = last_season_home_goals_average;

      nextSeason = season.currentSeasonNumber;
      await season.save();
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
