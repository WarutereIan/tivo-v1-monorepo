//get last season's total goals scored by all home sides
//get last season's total goals scored by all away sides

import { Match } from "../models/Match";
import { Season } from "../models/Season";
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
export async function calculateTeamStrengths(league: string) {
  let leagueGoalsAverageScoredHome: number,
    leagueGoalsAverageScoredAway: number,
    leagueGoalsAverageConcedHome: number,
    leagueGoalsAverageConcedAway: number;
  try {
    let season = await Season.findOne({ league: league });

    if (season) {
      leagueGoalsAverageScoredHome = season.last_season_home_mean_scored;
      leagueGoalsAverageScoredAway = season.last_season_away_mean_scored;
      leagueGoalsAverageConcedHome = season.last_season_home_mean_conceded;
      leagueGoalsAverageConcedAway = season.last_season_away_mean_conceded;
    } else {
      throw new Error("Could not get season at calculateTeamOdds");
    }

    for await (let team of Team.find({ league: league })) {
      const goalsScoredHome = team.goals_scored_home_previous_season;
      const goalsConcededHome = team.goals_conceded_home_previous_season;

      const goalsScoredAway = team.goals_scored_away_previous_season;
      const goalsConcededAway = team.goals_conceded_away_previous_season;

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

      team = await team.save();
    }
    console.log("Updated team strengths");
    return true;
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

  constructor(league: string) {
    Season.findOne({ league: league }).then((res: ISeason | null) => {
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

        let scoreOdds: { [score: string]: number } = {};

        this.calculateCorrectScoreOdds(correctScoreProbabilities, scoreOdds);

        match.correctScoreProbabilities = correctScoreProbabilities;

        match.totalGoalsPredictions = this.calculateTotalGoalOdds(
          expectedAwayGoals,
          expectedHomeGoals
        );

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

  /**
   * P(X: u) = (e^-u).(u^x)/x!
   * take u as expected goals for either home or away
   * x as the goals whose probability is to be calculated
   */
  calculateProbabilityDistribution(teamExpectedGoals: number): number[] {
    let probabilityArray: number[] = [];
    for (let x = 0; x < 7; x++) {
      let P: number = Number(
        (
          (Math.exp(-teamExpectedGoals) * Math.pow(teamExpectedGoals, x)) /
          this.factorial(x)
        ).toFixed(4)
      );

      probabilityArray.push(P);
    }

    return probabilityArray;
  }

  async updateLeagueAverages(league: string) {
    try {
      let season = await Season.findOne({ league: league });
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

  calculateCorrectScoreOdds(
    correctScoreProbabilities: {
      [score: string]: number;
    },
    scoreOdds: { [score: string]: number }
  ) {
    for (const key in correctScoreProbabilities) {
      let probability = correctScoreProbabilities[key];
      /* console.log("\n probability", probability); */
      let adjustedGoalOdds = 1 / (probability * 1.3); //1.3 = margin

      //console.log(" \n goal odds:", goalOdds);
      scoreOdds[key] = adjustedGoalOdds;
    }

    return scoreOdds;
  }

  /**
   * /**
   * P(X: u) = (e^-u).(u^x)/x!
   * take u as expected total goals for both home and away,
   * x as the goals whose probability is to be calculated
   *
   *
   * @param expectedAwayGoals
   * @param expectedHomeGoals
   *
   */
  calculateTotalGoalOdds(expectedAwayGoals: number, expectedHomeGoals: number) {
    const totalExpectedGoals = expectedAwayGoals + expectedHomeGoals;
    let totalGoalsPredictions: { [goals: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      let P =
        (Math.exp(-totalExpectedGoals) * Math.pow(totalExpectedGoals, i)) /
        this.factorial(i);

      let margin = P * 0.3;

      let adjustedTotalGoalOdds = 1 / (P * (1 + margin)); //bookmaker margin = 0.3
      totalGoalsPredictions[i] = adjustedTotalGoalOdds;
    }
    return totalGoalsPredictions;
  }
}

//will need to be imported and created in league specific instance
export const MatchGoalDistributionManagers = {
  EPL: new MatchGoalDistribution("EPL"),
  LaLiga: new MatchGoalDistribution("LaLiga"),
  Bundesliga: new MatchGoalDistribution("Bundesliga"),
  SerieA: new MatchGoalDistribution("SerieA"),
};


