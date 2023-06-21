export type Results = {
  homeTeamGoals: number;
  awayTeamGoals: number;
  totalGoals: number;
  winner: string; //Will either be H or A //implement as enum
  draw: boolean;
};

export interface IMatch {
  homeTeam: string;
  awayTeam: string;
  results: Results;
  live: boolean;
  round: number;
  homeTeamOdds: number;
  awayTeamOdds: number;
  drawOdds: number;
  season: number;
}
