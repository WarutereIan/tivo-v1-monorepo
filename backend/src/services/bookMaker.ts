/**
 * This sets match odds based on the algorithm
 * It is called only before the current round to set match odds for that round; so is specific to a team's status at that point in time
 * The match setup for team strengths will however be set based on fans' picks; team favored to win will be that least favorited, house always wins!
 *
 * relative strength can be a factor of: League Points, goal difference,
 *
 * But during match, match is setup with the stronger side being that favored by the minority; bet slip will have bet id for this summation, to track odds
 */

import { Match } from "../models/Match";
import { RoundCounter } from "../models/RoundCounter";
import { SeasonCounter } from "../models/SeasonCounter";
import { Team } from "../models/Team";

export const setRoundOdds = async () => {
  //match odds set for current round in current season
  const currentSeason = await SeasonCounter.findOne({})
  
  const currentRoundDocument = await RoundCounter.findOne();
  const currentRound = currentRoundDocument?.currentRound;

  //get matches in current round from Matches.find({round: currentRound})
  //get team names from the matches
  //get team stats for each home & away: points and GD
  //determine odds from the two
  //save odds in db, cache odds so that they can be regularly accessed from server
  for await (const match of Match.find({ round: currentRound }).select(
    "homeTeam awayTeam homeTeamOdds awayTeamOdds"
  )) {
    //home team stats
    let homeTeam = await Team.findOne({ name: match.homeTeam });

    let awayTeam = await Team.findOne({ name: match.awayTeam });

    let homeTeamPoints: number,
      awayTeamPoints: number,
      homeTeamGoalDifference: number,
      awayTeamGoalDifference: number;

    if (homeTeam) {
      homeTeamPoints = homeTeam.points;
      homeTeamGoalDifference = homeTeam.goal_difference;
      console.log(
        "homeTeam points and gd: ",
        homeTeamPoints,
        +" ",
        +homeTeamGoalDifference
      );
    } else {
      return console.error("could not fetch home team @setMatchOdds!");
    }
    if (awayTeam) {
      awayTeamPoints = awayTeam.points;
      awayTeamGoalDifference = awayTeam.goal_difference;
    } else {
      return console.error("could not fetch away team @setMatchOdds!");
    }

    //adjsutment: minimum odds = 1.00,
    //max odds = 1.8

    const randomFactorH = Math.random() * 0.15 + 0.15;
    const randomFactorA = Math.random() * 0.15 + 0.15;

    const homeOddsFactor =
      Math.log10(homeTeamPoints + 0.1) -
      Math.floor(Math.log10(homeTeamPoints + 0.1)) +
      Math.sign(homeTeamGoalDifference) *
        Math.log10(Math.abs(homeTeamGoalDifference + 0.1)) -
      Math.floor(Math.log10(Math.abs(homeTeamGoalDifference + 0.1))) +
      randomFactorH;

    const awayOddsFactor =
      Math.log10(awayTeamPoints + 0.1) -
      Math.floor(Math.log10(awayTeamPoints + 0.1)) +
      Math.sign(awayTeamGoalDifference) *
        Math.log10(Math.abs(awayTeamGoalDifference + 0.1)) -
      Math.floor(Math.log10(Math.abs(homeTeamGoalDifference + 0.1))) +
      randomFactorA;

    const homeOdds = 1.0 + (homeOddsFactor - Math.floor(homeOddsFactor));

    const awayOdds = 1.0 + (awayOddsFactor - Math.floor(awayOddsFactor));

    match.homeTeamOdds = homeOdds;
    match.awayTeamOdds = awayOdds;
    await match.save();
    console.info(
      `Set odds for match ${match.id} as home: ${homeOdds} and away: ${awayOdds}`
    );
  }

  return console.info(`Match odds for round ${currentRound} set`);
};

//add functionality for correct score prediction:
  //probability will be determined by gd
  //so there will be a correct score prediction field in req body
export const setCorrectScoreOdds = async () => {
  
}