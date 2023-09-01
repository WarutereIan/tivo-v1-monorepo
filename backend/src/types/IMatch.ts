export type Results = {
  homeTeamGoals: number;
  awayTeamGoals: number;
  totalGoals: number;
  winner: string; //Will either be H or A //implement as enum
  draw: boolean;
};

export type OddsObject = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
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
  homeTeamOdds: OddsObject;
  awayTeamOdds: OddsObject;
  drawOdds: OddsObject;
  season: number;
  homeTeam_goal_distribution_by_probability: number[];
  awayTeam_goal_distribution_by_probability: number[];
  correctScoreProbabilities: { [score: string]: number };
  totalGoalsPredictions: { [goals: string]: number };
  homeDoubleChanceOdds: OddsObject;
  awayDoubleChanceOdds: OddsObject;
  drawDoubleChanceOdds: OddsObject;
  status: string; //'STARTED', 'FINISHED', 'NOT STARTED'
  league: string;
}
