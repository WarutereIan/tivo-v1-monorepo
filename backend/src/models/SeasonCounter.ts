import { Schema, model } from "mongoose";
import { ISeason } from "../types/ISeason";

const SeasonSchema = new Schema<ISeason>({
  currentSeasonNumber: {
    type: Number,
    required: true,
  },
  total_goals_scored_away_last_season: {
    type: Number,
    required: true,
  },
  total_goals_scored_home_last_season: {
    type: Number,
    required: true,
  },
  last_season_away_mean_conceded: {
    type: Number,
    required: true,
  },
  last_season_home_mean_conceded: {
    type: Number,
    required: true,
  },
  last_season_away_mean_scored: {
    type: Number,
    required: true,
  },
  last_season_home_mean_scored: {
    type: Number,
    required: true,
  },
});

export const SeasonCounter = model<ISeason>("SeasonCounter", SeasonSchema);
