export interface ITeam {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goal_difference: number;
  goals_scored_home_current_season: number;
  goals_scored_home_previous_season: number;
  goals_scored_away_current_season: number;
  goals_scored_away_previous_season: number;
  goals_conceded_home_current_season: number;
  goals_conceded_home_previous_season: number;
  goals_conceded_away_current_season: number;
  goals_conceded_away_previous_season: number;
  points: number;
  home_attack_strength: number;
  home_defense_strength: number;
  away_attack_strength: number;
  away_defense_strength: number;
}
