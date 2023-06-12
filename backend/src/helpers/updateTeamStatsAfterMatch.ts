import { Team } from "../models/Team";

export const updateTeam = async (
  teamName: string,
  points: number,
  goalDifference: number
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

    team.goal_difference += goalDifference;
    team.points += points;

    await team.save();
    return console.log(`Team ${teamName} stats updated`);
  } else {
    return console.log(`Team ${teamName}not found!`);
  }
};
