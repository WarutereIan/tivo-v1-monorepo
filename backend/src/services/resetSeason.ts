//after season ends this resets:
//teams stats: p w d l gd gs gc p : these are cleared
//creates new season: new matchups created but with the season field incremented

import Tournament from "../utils/round-robin-tournament/tournament";
import { RoundCounter } from "../models/RoundCounter";
import { Season } from "../models/Season";
import { Team } from "../models/Team";
import { Match } from "../models/Match";
import { MatchGoalDistributionManagers } from "./calculateGoalsOdds";
import { RedisClient } from "../config/db";
import { Redis } from "ioredis";
import { Teams } from "../config/teams";

class SeasonManager {}

let nextSeason: number;

export const createNewSeason = async (league: string) => {
  try {
    let total_goals_scored_away_last_season: number = 0,
      total_goals_scored_home_last_season: number = 0,
      total_goals_conceded_away_last_season: number = 0,
      total_goals_conceded_home_last_season: number = 0,
      last_season_away_mean_conceded: number = 0,
      last_season_home_mean_conceded: number = 0,
      last_season_away_mean_scored: number = 0,
      last_season_home_mean_scored: number = 0;

    await RoundCounter.findOneAndUpdate(
      { league: league },
      { currentRound: 0 }
    );
    console.log("\n reset current season  counter for league", league);

    for await (let team of Team.find({ league: league })) {
      total_goals_scored_away_last_season +=
        team.goals_scored_away_current_season;
      total_goals_scored_home_last_season +=
        team.goals_scored_home_current_season;
      total_goals_conceded_away_last_season +=
        team.goals_conceded_away_current_season;
      total_goals_conceded_home_last_season +=
        team.goals_conceded_home_current_season;

      //store this season's values to be used for the next season's calculations
      team.goals_conceded_away_previous_season =
        team.goals_conceded_away_current_season;
      team.goals_conceded_home_previous_season =
        team.goals_conceded_home_current_season;
      team.goals_scored_away_previous_season =
        team.goals_scored_away_current_season;
      team.goals_scored_home_previous_season =
        team.goals_scored_away_current_season;

      team.played =
        team.won =
        team.drawn =
        team.lost =
        team.points =
        team.goal_difference =
        team.goals_conceded_away_current_season =
        team.goals_conceded_home_current_season =
        team.goals_scored_away_current_season =
        team.goals_scored_home_current_season =
          0;
      team = await team.save();
    }

    console.log("\n Reset team stats for a new season for league", league);

    //let all teams be accounted for before storing new season stats
    last_season_away_mean_scored = Number(
      (total_goals_scored_away_last_season / 380).toFixed(3)
    );
    last_season_home_mean_scored = last_season_away_mean_conceded = Number(
      (total_goals_conceded_away_last_season / 380).toFixed(3)
    );

    last_season_home_mean_conceded = Number(
      (total_goals_conceded_home_last_season / 380).toFixed(3)
    );

    const season = await Season.findOne({ league: league }); //modify to be for each league - done

    if (season) {
      season.currentSeasonNumber++;
      season.total_goals_scored_away_last_season =
        total_goals_scored_away_last_season;
      season.total_goals_scored_home_last_season =
        total_goals_scored_home_last_season;
      season.last_season_away_mean_conceded = last_season_away_mean_conceded;
      season.last_season_home_mean_conceded = last_season_home_mean_conceded;
      season.last_season_away_mean_scored = last_season_away_mean_scored;
      season.last_season_home_mean_scored = last_season_home_mean_scored;

      nextSeason = season.currentSeasonNumber;
      await RedisClient.set(`currentSeasonNumber_${league}`, nextSeason); //update season number in cache
      //await RedisClient.set("nextRound", 0);
      await season.save();
    } else {
      return console.error("\n Current season number could not be fetched!!");
    }

    await createSeasonMatchups(league);
    return true;
  } catch (err) {
    console.error("\n Error creating new season!! \n", err);
  }
};

const createSeasonMatchups = async (league: string) => {
  for (const [key, value] of Object.entries(MatchGoalDistributionManagers)) {
    if (key === league) {
      const MatchGoalDistributionManager = value;

      for (const [key, value] of Object.entries(Teams)) {
        if (key === league) {
          const teams = value;

          let TEAMS = [];

          for (let i = 0; i < teams.length; i++) {
            TEAMS.push({ id: i + 1, name: teams[i] });
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
                league: league,
              }).then((res) => {
                //console.log(res);
              });
            }
          }
        }
      }

      await MatchGoalDistributionManager.updateLeagueAverages(league); //placed here so that averages are updated in synchronous order, after league averages have been updated.
    }
  }
};

export const resetTeamScores = async (league: string) => {
  for await (let team of Team.find({ league: league })) {
    team.goals_scored_home_current_season = 0;
    team.goals_scored_away_current_season = 0;
    team.goals_conceded_home_current_season = 0;
    team.goals_conceded_away_current_season = 0;

    team.save().then((update) => {
      update
        ? console.log("reset team stats for current season", team.name)
        : console.log("Could notreset team stats", team.name);
    });
  }
};
