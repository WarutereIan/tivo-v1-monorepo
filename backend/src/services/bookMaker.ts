/**
 * This sets match odds based on the algorithm
 * It is called only before the current round to set match odds for that round; so is specific to a team's status at that point in time
 * The match setup for team strengths will however be set based on fans' picks; team favored to win will be that least favorited, house always wins!
 *
 * relative strength can be a factor of: League Points, goal difference,
 *
 * But during match, match is setup with the stronger side being that favored by the minority; bet slip will have bet id for this summation, to track odds
 */

import { RedisClient } from "../config/db";
import { Match } from "../models/Match";
import { Season } from "../models/Season";
import { Team } from "../models/Team";

let currentSeasonCounter: number;

///////// need to export bookmaker code for instant virtuals

const unused = null;

export class Odds {
  static setRoundOdds = async (league: string) => {
    try {
      //match odds set for current round in current season
      const currentSeason = await Season.findOne({ league: league });

      if (currentSeason) {
        currentSeasonCounter = currentSeason.currentSeasonNumber;
      } else {
        return console.info(
          "\n Couldn't fetch currentSeasonCounter @bookMaker"
        );
      }

      //const currentRoundDocument = await RoundCounter.findOne();
      let nextRound = Number(await RedisClient.get(`nextRound_${league}`));

      if (nextRound >= 37) nextRound = 0;

      //get matches in current round from Matches.find({round: currentRound})
      //get team names from the matches
      //get team stats for each home & away: points and GD
      //determine odds from the two
      //save odds in db, cache odds so that they can be regularly accessed from server
      for await (const match of Match.find({
        round: nextRound,
        season: currentSeasonCounter,
        league: league,
      }).select("homeTeam awayTeam homeTeamOdds awayTeamOdds")) {
        //home team stats
        let homeTeam = await Team.findOne({ name: match.homeTeam });

        let awayTeam = await Team.findOne({ name: match.awayTeam });

        /* await MatchGoalDistributionManager.calculateMatchGoalDistribution(
          match.id
        ); */

        let homeTeamPoints: number,
          awayTeamPoints: number,
          homeTeamGoalDifference: number,
          awayTeamGoalDifference: number;

        if (homeTeam) {
          homeTeamPoints = homeTeam.points + Math.random() * 0.5;
          homeTeamGoalDifference =
            homeTeam.goal_difference + Math.random() * 0.8;
        } else {
          return console.error("could not fetch home team @setMatchOdds!");
        }
        if (awayTeam) {
          awayTeamPoints = awayTeam.points + Math.random() * 1;
          awayTeamGoalDifference =
            awayTeam.goal_difference + Math.random() * 0.8;
        } else {
          return console.error("could not fetch away team @setMatchOdds!");
        }

        const totalGD = Math.abs(
          homeTeamGoalDifference + awayTeamGoalDifference
        );
        const totalPoints = homeTeamPoints + awayTeamPoints;

        const weightedPointsHome = (homeTeamPoints * totalGD) / totalPoints;

        const weightedPointsAway = (awayTeamPoints * totalGD) / totalPoints;

        const probabilityHome =
          (0.1 * weightedPointsHome) /
          (weightedPointsHome + weightedPointsAway);
        const probabilityAway =
          (0.1 * weightedPointsAway) /
          (weightedPointsHome + weightedPointsAway);

        const drawProbability = Math.random() * 0.2;

        const homeDChanceProb = probabilityHome + drawProbability;
        const awayDChanceProb = probabilityAway + drawProbability;

        const homeOdds = probabilityHome;
        const awayOdds = probabilityAway;
        const drawOdds = drawProbability;

        const marginPercentage = 0.3;

        const overround = homeOdds + awayOdds + drawOdds;

        const DChanceOverround =
          homeDChanceProb + awayDChanceProb + drawProbability;
        const DChanceMargin = DChanceOverround * marginPercentage;

        const adjustedHomeDChanceProb =
          ((1.5 * homeDChanceProb) / DChanceOverround) * (1 + DChanceMargin);
        const adjustedAwayDChanceProb =
          ((1.5 * awayDChanceProb) / DChanceOverround) * (1 + DChanceMargin);
        const adjustedDrawDChanceProb =
          ((2 * drawProbability) / DChanceOverround) * (1 + DChanceMargin);

        const margin = overround * marginPercentage;

        const adjustedHomeProbability = (homeOdds / overround) * (1 + margin);
        const adjustedAwayProbability = (awayOdds / overround) * (1 + margin);
        const adjustedDrawProbability = (drawOdds / overround) * (1 + margin);

        const adjustedHomeOdds = 1 / adjustedHomeProbability;
        const adjustedAwayOdds = 1 / adjustedAwayProbability;
        const adjustedDrawOdds = 1 / adjustedDrawProbability;

        const adjustedHomeDChanceOdds = 1 / adjustedHomeDChanceProb;
        const adjustedAwayDchanceOdds = 1 / adjustedAwayDChanceProb;
        const adjustedDrawDChanceOdds = 1 / adjustedDrawDChanceProb;

        let finalOddsHome = Number(adjustedHomeOdds.toFixed(2));
        let finalOddsAway = Number(adjustedAwayOdds.toFixed(2));
        let finalOddsDraw = Number(adjustedDrawOdds.toFixed(2));

        if (finalOddsHome >= 4)
          finalOddsHome = Number((Math.random() * 3 + 1).toFixed(2));
        if (finalOddsAway >= 4)
          finalOddsAway = Number((Math.random() * 3 + 1).toFixed(2));
        if (finalOddsDraw >= 5)
          finalOddsDraw = Number((Math.random() * 4 + 1).toFixed(2));

        match.homeTeamOdds = {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          prediction: "1",
          odds: finalOddsHome,
        };
        match.awayTeamOdds = {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          prediction: "2",
          odds: finalOddsAway,
        };
        match.drawOdds = {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          prediction: "X",
          odds: finalOddsDraw,
        };
        match.homeDoubleChanceOdds = {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          prediction: "homeDoubleChanceOdds",
          odds: Number(adjustedHomeDChanceOdds.toFixed(2)),
        }; //Number(adjustedHomeDChanceOdds.toFixed(2));
        match.awayDoubleChanceOdds = {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          prediction: "awayDoubleChanceOdds",
          odds: Number(adjustedAwayDchanceOdds.toFixed(2)),
        }; //Number(adjustedAwayDchanceOdds.toFixed(2));
        //match.drawDoubleChanceOdds = Number(adjustedDrawDChanceOdds.toFixed(2));

        //add odds for double chance
        await match.save();
        console.info(`Set odds for match ${match.id} as ${match}`);
      }

      return console.info(`Match odds for round ${nextRound} set`);
    } catch (err) {
      console.error(err);
    }
  };

  //static setTotalGoalsOdds = async () => {}; //will be set from probability distribution array

  //static calculateCorrectScorePredictionOdds = async () => {}; // will also be set from probability distribution array

  private calculateTotalGoalPredictionOdds(
    averageGoals: number,
    predictedGoals: number
  ) {
    // Calculate the odds based on the average goals
    const odds =
      (Math.pow(averageGoals, predictedGoals) * Math.exp(-averageGoals)) /
      this.factorial(predictedGoals);

    // Return the goal prediction odds
    return odds;
  }

  // Helper function to calculate the factorial of a number
  private factorial(n: number): number {
    if (n === 0 || n === 1) {
      return 1;
    } else {
      return n * this.factorial(n - 1);
    }
  }
}
