//get last season's total goals scored by all home sides
//get last season's total goals scored by all away sides

import { Match } from "../models/Match";
import { SeasonCounter } from "../models/SeasonCounter";
import { Team } from "../models/Team";
import { ISeason } from "../types/ISeason";

//get the average for each; average league home goals, average league away goals

/**
 * @Dev Team strengths are calculated below as per the previous season: can be later updated to
 * incorporate more recent data, for a moer accurate depiction
 *
 * @Dev Modify this to include recent data b4 production!
 */

/* SeasonCounter.findOne().then((res) => {
    leagueGoalsAverageHome = res?.last_season_home_goals_average;
}) */

/**
 * @Dev function below will be called at the end of every season
 */
export async function calculateTeamStrengths() {
  let leagueGoalsAverageHome: any,
    leagueGoalsAverageAway: any,
    leagueGoalsAverage: any;
  try {
    let season = await SeasonCounter.findOne();

    if (season) {
      leagueGoalsAverageHome = season.last_season_home_goals_average;
      leagueGoalsAverageAway = season.last_season_away_goals_average;
      leagueGoalsAverage =
        (leagueGoalsAverageAway + leagueGoalsAverageHome) / 2;
    } else {
      throw new Error("Could not get season at calculateTeamOdds");
    }

    for await (const team of Team.find()) {
      const teamTotalHomeGoals = team.goals_scored_home;
      const teamTotalAwayGoals = team.goals_scored_away;

      const attackStrength = teamTotalHomeGoals / (19 * leagueGoalsAverageHome);
      const defenseStrength =
        teamTotalAwayGoals / (19 * leagueGoalsAverageAway);

      team.attack_strength = attackStrength;
      team.defense_strength = defenseStrength;

      await team.save();
    }
    console.log("Updated team strengths");
  } catch (err) {
    console.log(err);
  }
}

//to be called during match setup, when calculating odds

class MatchGoalDistribution {
  leagueGoalsAverageHome!: number;
  leagueGoalsAverageAway!: number;

  constructor() {
    SeasonCounter.findOne().then((res: ISeason | null) => {
      if (res) {
        this.leagueGoalsAverageAway = res.last_season_away_goals_average;
        this.leagueGoalsAverageHome = res.last_season_home_goals_average;
      }
    });
  }

  async calculateMatchGoalDistribution(matchid: string) {
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
            "could not get home team @calculateMatchGoalDistribution"
          );

        awayTeam = await Team.findOne({ name: match.awayTeam });
        if (awayTeam) awayDefenseStrength = awayTeam.defense_strength;
        else
          throw new Error(
            "could not get away team @calculateMatchGoalDistribution"
          );

        const expectedHomeGoals =
          homeAttackStrength *
          awayDefenseStrength *
          this.leagueGoalsAverageHome;

        const expectedAwayGoals =
          homeAttackStrength *
          awayDefenseStrength *
          this.leagueGoalsAverageAway;

        //now use poisson distribution to determine goal probabilities and store in match

        /**
         * Function will calculate probabilities as per Poisson distribution and return an array of probability distribution for the goals
         *
         */

        //store the probability for each x in array corresponding to either home or away side
        const homeTeamGoalDistribution =
          this.calculateProbabilityDistribution(expectedHomeGoals);
        const awayTeamGoalDistribution =
          this.calculateProbabilityDistribution(expectedAwayGoals);

        //store array in Match document; so to Match add functionality to store these arrays of probability for either home or away
        //then to get correct score predictions you multiply odds for each stipulated score as in the guide
        match.homeTeam_goal_distribution_by_probability =
          homeTeamGoalDistribution;
        match.awayTeam_goal_distribution_by_probability =
          awayTeamGoalDistribution;

        await match.save();
      } else {
        throw new Error(
          "Could not fetch match @calculateExpectedGoalsPercentageForEachSide"
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  factorial(n: number): number {
    if (n === 0 || n === 1) {
      return 1;
    } else {
      return n * this.factorial(n - 1);
    }
  }

  calculateProbabilityDistribution(teamAverageGoals: number): number[] {
    /**
     * P(X: u) = (e^-u).(u^x)/x!
     * take u as expected goals for either home or away
     * x as the goals whose probability is to be calculated
     */
    let probabilityArray: number[] = [];
    for (let x = 0; x < 7; x++) {
      let P: number = Number(
        (
          (Math.exp(-teamAverageGoals) * Math.pow(teamAverageGoals, x)) /
          this.factorial(x)
        ).toFixed(4)
      );

      probabilityArray.push(P);
    }

    return probabilityArray;
  }

  async updateLeagueAverages() {
    try {
      let season = await SeasonCounter.findOne();
      if (season) {
        this.leagueGoalsAverageAway = season.last_season_away_goals_average;
        this.leagueGoalsAverageHome = season.last_season_home_goals_average;
      } else {
        throw new Error(
          "Could not update season averages @MatchGoalDistribution"
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export const MatchGoalDistributionManager = new MatchGoalDistribution();
