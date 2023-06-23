export interface ITeam {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_scored: number;
  goals_conceded: number;
  goal_difference: number;
  goals_scored_home: number;
  goals_scored_away: number;
  goals_conceded_home: number;
  goals_conceded_away: number;
  points: number;
  home_attack_strength: number;
  home_defense_strength: number;
  away_attack_strength: number;
  away_defense_strength: number;
}
