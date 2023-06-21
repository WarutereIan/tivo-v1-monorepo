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

    if (side === 'home') team.goals_scored_home += goalsScored
    if(side === 'away') team.goals_scored_away += goalsScored

    team.goal_difference += goalDifference;
    team.goals_conceded += goalsConceded;
    team.goals_scored += goalsScored;
    team.points += points;

    await team.save();
    return console.log(`Team ${teamName} stats updated`);
  } else {
    return console.log(`Team ${teamName}not found!`);
  }
};
