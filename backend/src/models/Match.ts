import { Schema, model } from "mongoose";
import { IMatch, Results } from "../types/IMatch";

const MatchSchema = new Schema<IMatch>({
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  results: {
    type: {
      homeTeamGoals: Number,
      awayTeamGoals: Number,
      totalGoals: Number,
      winner: String,
      draw: Boolean,
    },
  },
  round: {
    type: Number,
  },
  homeTeamOdds: {
    type: Number,
  },
  awayTeamOdds: {
    type: Number,
  },
  season: {
    type: Number,
  },
  homeTeam_goal_distribution_by_probability: {
    type: [Number],
  },
  awayTeam_goal_distribution_by_probability: {
    type: [Number],
  },
  drawOdds: {
    type: Number,
  },
  homeDoubleChanceOdds: {
    type: Number,
  },
  awayDoubleChanceOdds: {
    type: Number,
  },
  drawDoubleChanceOdds: {
    type: Number,
  },
  correctScoreProbabilities: {
    type: {},
  },
  totalGoalsPredictions: {
    type: {},
  },
});

export const Match = model<IMatch>("Match", MatchSchema);
