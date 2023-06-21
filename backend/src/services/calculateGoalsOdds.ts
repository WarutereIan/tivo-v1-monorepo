//get last season's total goals scored by all home sides
//get last season's total goals scored by all away sides

import { Match } from "../models/Match";
import { SeasonCounter } from "../models/SeasonCounter";
import { Team } from "../models/Team";

//get the average for each; average league home goals, average league away goals

/**
 * @Dev Team strengths are calculated below as per the previous season: can be later updated to
 * incorporate more recent data, for a moer accurate depiction
 *
 * @Dev Modify this to include recent data b4 production!
 */
let leagueGoalsAverageHome: any, leagueGoalsAverageAway: any;

/* SeasonCounter.findOne().then((res) => {
    leagueGoalsAverageHome = res?.last_season_home_goals_average;
}) */

/**
 * @Dev function below will be called at the end of every season
 */
export async function calculateTeamStrengths() {
  try {
    let season = await SeasonCounter.findOne();

    //let leagueGoalsAverageAway: number;
    if (season) {
      leagueGoalsAverageHome = season.last_season_home_goals_average;
    } else {
      throw new Error("Could not get season at calculateTeamOdds");
    }

    for await (const team of Team.find()) {
      const teamTotalHomeGoals = team.goals_scored_home;
      //const teamTotalAwayGoals = team.goals_scored_away

      const attackStrength = teamTotalHomeGoals / (19 * leagueGoalsAverageHome);
      const defenseStrength = 1 / attackStrength;

      team.attack_strength = attackStrength;
      team.defense_strength = defenseStrength;

      await team.save();
    }
    console.log("Updated team strengths");
  } catch (err) {
    console.log(err);
  }
}

export async function calculateExpectedGoalsPercentageForEachSide(
  matchid: string
) {
  try {
    let homeTeam,
      awayTeam,
      homeAttackStrength: number = 0,
      awayDefenseStrength: number = 0;
    const match = await Match.findOne({ _id: matchid });

    if (match) {
      homeTeam = await Team.findOne({ name: match.homeTeam });
      if (homeTeam) homeAttackStrength = homeTeam.attack_strength;
      else
        throw new Error(
          "could not get home team @calculateExpectedGoalsPercentageForEachSide"
        );

      awayTeam = await Team.findOne({ name: match.awayTeam });
      if (awayTeam) awayDefenseStrength = awayTeam.defense_strength;
      else
        throw new Error(
          "could not get away team @calculateExpectedGoalsPercentageForEachSide"
        );

      const expectedHomeGoals =
        homeAttackStrength * awayDefenseStrength * leagueGoalsAverageHome;

      const expectedAwayGoals =
        homeAttackStrength * awayDefenseStrength * leagueGoalsAverageAway;

      //now use poisson distribution to determine goal probabilities and store in match
      /**
       * P(X: u) = (e^-u).(u^x)/x!
       * take u as expected goals for either home or away
       * x as the goals whose probability is to be calculated
       */
      //store the probability for each x in array corresponding to either home or away side
      //store array in Match document; so to Match add functionality to store these arrays of probability for either home or away
      //then to get correct score predictions you multiply odds for each stipulated score as in the guide
    } else {
      throw new Error(
        "Could not fetch match @calculateExpectedGoalsPercentageForEachSide"
      );
    }
  } catch (err) {
    console.error(err);
  }
}

//In order to calculate the Attack Strength, you just divide the individual team’s average by the league average.
//so store last season's total as a variable in db

//the team's defense strength is an inverse of the attack strength

//to predict a team's goals you will:
//multiply its attack strength by the opponent's defence strength, and by the average number of say home goals(side dependent)
//in the league. for home

//to predict the away side's goals you will do the same multiplication above but multiply by the average number of away goals in the league this time

//now you have each side's expected average/goals in the match

//now you can use the poisson distribution to determine probabilities of a certain number of goals being scored per team

//strategy: based on the team's stats, calculate the teams' average goals as per the previous seasons,
//store the probability for each score in an array, this array is relevant all season long
//to get correct score predictions multiply probabilities for two teams.
