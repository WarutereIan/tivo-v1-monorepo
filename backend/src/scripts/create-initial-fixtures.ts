//this script is used to reset the db

import Tournament from "round-robin-tournament";
import { connectDB } from "../config/db";
import { type } from "os";
import { Match } from "../models/Match";
import { RoundCounter } from "../models/RoundCounter";
import { Team } from "../models/Team";
import { SeasonCounter } from "../models/SeasonCounter";
import mongoose from "mongoose";

/**
 * creates fixtures fot a season. provide array of teams in string as in EPLTeams.
 * When calling script seasons can be added
 *
 *
 */

let dropMatches, dropTeams, dropRoundCounter, dropSeasonCounter;

(async () => {
  await connectDB();
})();

function resetLeague() {
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
        homeTeam_goal_distribution_by_probability: [],
        awayTeam_goal_distribution_by_probability: [],
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
      goals_conceded_away_current_season: 1,
      goals_conceded_away_previous_season: 1,
      goals_conceded_home_current_season: 1,
      goals_conceded_home_previous_season: 1,
      points: 0,
      goals_scored_away_current_season: 1,
      goals_scored_away_previous_season: 1,
      goals_scored_home_current_season: 1,
      goals_scored_home_previous_season: 1,
      home_attack_strength: 1,
      home_defense_strength: 1,
      away_attack_strength: 1,
      away_defense_strength: 1,
    }).then(() => console.log("Teams created in db"));
  }

  RoundCounter.create({ currentRound }).then((res) => {
    console.log("Round counter created with document ", res);
  });

  SeasonCounter.create({
    //create new season counter
    currentSeasonNumber: 0,
    total_goals_scored_away_last_season: 1,
    total_goals_scored_home_last_season: 1,
    last_season_away_mean_conceded: 1,
    last_season_home_mean_conceded: 1,
    last_season_away_mean_scored: 1,
    last_season_home_mean_scored: 1,
  }).then((res) => {
    console.log("Created inital season counter document \n", res);
  });
}

resetLeague();
