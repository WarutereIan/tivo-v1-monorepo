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
  let leagueGoalsAverageScoredHome: any,
    leagueGoalsAverageScoredAway: any,
    leagueGoalsAverageConcedHome: any,
    leagueGoalsAverageConcedAway: any;
  try {
    let season = await SeasonCounter.findOne();

    if (season) {
      leagueGoalsAverageScoredHome = season.last_season_home_mean_scored;
      leagueGoalsAverageScoredAway = season.last_season_away_mean_scored;
      leagueGoalsAverageConcedHome = season.last_season_home_mean_conceded;
      leagueGoalsAverageConcedAway = season.last_season_away_mean_conceded;
    } else {
      throw new Error("Could not get season at calculateTeamOdds");
    }

    for await (const team of Team.find()) {
      const goalsScoredHome = team.goals_scored_home;
      const goalsConcededHome = team.goals_conceded_home;

      const goalsScoredAway = team.goals_scored_away;
      const goalsConcededAway = team.goals_conceded_away;

      const homeAttackStrength =
        goalsScoredHome / (19 * leagueGoalsAverageScoredHome);
      const homeDefenseStrength =
        goalsConcededHome / (19 * leagueGoalsAverageConcedHome);

      const awayAttackStrength =
        goalsScoredAway / (19 * leagueGoalsAverageScoredAway); //both of these are for goals conceded away
      const awayDefenseStrength =
        goalsConcededAway / (19 * leagueGoalsAverageConcedAway);

      //need for league average goals conceded home, and conceded away

      team.home_attack_strength = homeAttackStrength;
      team.away_attack_strength = awayAttackStrength;
      team.home_defense_strength = homeDefenseStrength;
      team.away_defense_strength = awayDefenseStrength;

      await team.save();
    }
    console.log("Updated team strengths");
  } catch (err) {
    console.log(err);
  }
}

//to be called during match setup, when calculating odds

class MatchGoalDistribution {
  leagueGoalsAverageScoredHome!: number;
  leagueGoalsAverageScoredAway!: number;
  leagueGoalsAverageConcededHome!: number;
  leagueGoalsAverageConcededAway!: number;

  constructor() {
    SeasonCounter.findOne().then((res: ISeason | null) => {
      if (res) {
        this.leagueGoalsAverageScoredAway = res.last_season_away_mean_scored;
        this.leagueGoalsAverageScoredHome = res.last_season_home_mean_scored;
        this.leagueGoalsAverageConcededAway =
          res.last_season_away_mean_conceded;
        this.leagueGoalsAverageConcededHome =
          res.last_season_home_mean_conceded;
      }
    });
  }

  async calculateMatchGoalDistribution(matchid: string) {
    try {
      let homeTeam,
        awayTeam,
        homeAttackStrength: number = 0,
        homeDefenseStrength: number = 0,
        awayAttackStrength: number = 0,
        awayDefenseStrength: number = 0;
      const match = await Match.findOne({ _id: matchid });

      if (match) {
        homeTeam = await Team.findOne({ name: match.homeTeam });
        if (homeTeam) {
          homeAttackStrength = homeTeam.home_attack_strength;
          homeDefenseStrength = homeTeam.home_defense_strength;
        } else
          throw new Error(
            "could not get home team @calculateMatchGoalDistribution"
          );

        awayTeam = await Team.findOne({ name: match.awayTeam });
        if (awayTeam) {
          awayDefenseStrength = awayTeam.away_defense_strength;
          awayAttackStrength = awayTeam.away_attack_strength;
        } else
          throw new Error(
            "could not get away team @calculateMatchGoalDistribution"
          );

        const expectedHomeGoals =
          homeAttackStrength *
          awayDefenseStrength *
          this.leagueGoalsAverageScoredHome;

        const expectedAwayGoals =
          homeDefenseStrength *
          awayAttackStrength *
          this.leagueGoalsAverageScoredAway;

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

        let correctScoreProbabilities: { [score: string]: number } = {};
        //calculate correct score odds, store them in an object
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            correctScoreProbabilities[`${i}-${j}`] =
              homeTeamGoalDistribution[i] * awayTeamGoalDistribution[j];
          }
        }

        match.correctScoreProbabilities = correctScoreProbabilities;

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
        this.leagueGoalsAverageScoredAway = season.last_season_away_mean_scored;
        this.leagueGoalsAverageScoredHome = season.last_season_home_mean_scored;
        this.leagueGoalsAverageConcededAway =
          season.last_season_away_mean_conceded;
        this.leagueGoalsAverageConcededHome =
          season.last_season_home_mean_conceded;
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
