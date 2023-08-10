//this script is used to reset the db

import Tournament from "round-robin-tournament";
import { connectDB } from "../config/db";
import { type } from "os";
import { Match } from "../models/Match";
import { RoundCounter } from "../models/RoundCounter";
import { Team } from "../models/Team";
import { Season } from "../models/Season";
import mongoose from "mongoose";

/**
 * creates fixtures fot a season. provide array of teams in string as in league.
 * When calling script seasons can be added
 *
 *
 */

(async () => {
  await connectDB();
})();

const currentRound = 0;

const EPL = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Brentford",
  "Brighton",
  "Burnley",
  "Chelsea",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Liverpool",
  "Luton Town",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Sheffield United",
  "Tottenham Hotspur",
  "West Ham United",
  "Wolves",
];

const Laliga = [
  "Athletic Club",
  "Atletico De Madrid",
  "CA Osasuna",
  "Cadiz CF",
  "Deportivo Alaves",
  "FC Barcelona",
  "Getafe CF",
  "Girona FC",
  "Granada CF",
  "Rayo Vallecano",
  "RC Celta",
  "RCD Mallorca",
  "Real Betis",
  "Real Madrid",
  "Real Sociedad",
  "Sevilla FC",
  "UD Almeria",
  "UD Las Palmas",
  "Valencia CF",
  "Villareal CF",
];

const Bundesliga = [
  "Augsburg",
  "Bayer Leverkusen",
  "Bayern Munich",
  "Bochum",
  "Borussia Dortmund",
  "Darmstadt",
  "Einracht Frankfurt",
  "Heidenheim",
  "Hoffenheim",
  "Koln",
  "Mainz",
  "Monchengladbach",
  "Leipzig",
  "Freiburg",
  "Stuttgart",
  "Union Berlin",
  "Wolfsburg",
  "Werder",
];

const SerieA = [
  "Atalanta",
  "Bologna",
  "Cagliagri",
  "Empoli",
  "Fiorentina",
  "Frosinone",
  "Genoa",
  "Inter Milan",
  "Juventus",
  "Lazio",
  "Lecce",
  "AC Milan",
  "Monza",
  "Napoli",
  "Roma",
  "Salernitana",
  "Sassuolo",
  "Torino",
  "Udinese",
  "Verona",
];

const leagues = [EPL, Laliga, Bundesliga, SerieA];

const leagueNames = ["EPL", "LaLiga", "Bundesliga", "SerieA"];

function setUpLeagues(leagues: string[][], leagueNames: string[]) {
  /* leagueNames.forEach((leagueName) => {
    leagues.forEach((league) => {
      let TEAMS = [];

      for (let i = 0; i < league.length; i++) {
        TEAMS.push({ id: i + 1, name: league[i] });
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
            league: leagueName,
          }).then((res) => {
            //console.log(res);
          });
        }
      }

      //create Teams:
      for (let i = 0; i < league.length; i++) {
        Team.create({
          name: league[i],
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
        }).then();
      }
    });

  }); */

  for (let a = 0; a < leagueNames.length; a++) {
    const league = leagues[a];

    let TEAMS = [];

    for (let i = 0; i < league.length; i++) {
      TEAMS.push({ id: i + 1, name: league[i] });
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
          league: leagueNames[a],
        }).then((res) => {
          //console.log(res);
        });
      }
    }

    //create Teams:
    for (let i = 0; i < league.length; i++) {
      Team.create({
        name: league[i],
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
      }).then();
    }

    RoundCounter.create({ currentRound, league: leagueNames[a] }).then(
      (res) => {
        console.log("Round counter created with document ", res);
      }
    );

    Season.create({
      //create new season counter
      currentSeasonNumber: 0,
      total_goals_scored_away_last_season: 1,
      total_goals_scored_home_last_season: 1,
      last_season_away_mean_conceded: 1,
      last_season_home_mean_conceded: 1,
      last_season_away_mean_scored: 1,
      last_season_home_mean_scored: 1,
      league: leagueNames[a],
    }).then((res) => {
      console.log("Created inital season for  \n", leagueNames[a]);
    });
  }
}

setUpLeagues(leagues, leagueNames);
