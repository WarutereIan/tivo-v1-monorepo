export type Results = {
  homeTeamGoals: number;
  awayTeamGoals: number;
  totalGoals: number;
  winner: string; //Will either be H or A //implement as enum
  draw: boolean;
};

export interface ICorrectScoreProbability {
  [score: string]: number;
}

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
  homeTeam_goal_distribution_by_probability: number[];
  awayTeam_goal_distribution_by_probability: number[];
  correctScoreProbabilities: { [score: string]: number };
  totalGoalsPredictions: { [goals: string]: number };
  homeDoubleChanceOdds: number;
  awayDoubleChanceOdds: number;
  drawDoubleChanceOdds: number;
  status: string; //'STARTED', 'FINISHED', 'NOT STARTED'
  league: string;
}
