import { Team } from "../models/Team";

export const updateTeam = async (
  side: string,
  teamName: string,
  points: number,
  goalDifference: number,
  goalsScored: number,
  goalsConceded: number
) => {
  let team = await Team.findOne({ name: teamName });
  if (team) {
    team.played++;
    if (points === 3) {
      team.won++;
    } else if (points === 1) {
      team.drawn++;
    } else {
      team.lost++;
    }

    if (side === "home") {
      team.goals_scored_home_current_season += goalsScored;
      team.goals_conceded_home_current_season += goalsConceded;
    } else if (side === "away") {
      team.goals_scored_away_current_season += goalsScored; //here the defensive strength is adjusted to indicate probability of away team conceding a goal
      team.goals_conceded_away_current_season += goalsConceded;
    }
    team.goal_difference += goalsScored - goalsConceded;
    team.points += points;

    await team.save();
    return console.log(`Team ${teamName} stats updated`);
  } else {
    return console.log(`Team ${teamName}not found!`);
  }
};
