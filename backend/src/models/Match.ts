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
    id: String,
    homeTeam: String,
    awayTeam: String,
    prediction: String,
    odds: Number,
  },
  awayTeamOdds: {
    id: String,
    homeTeam: String,
    awayTeam: String,
    prediction: String,
    odds: Number,
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
    id: String,
    homeTeam: String,
    awayTeam: String,
    prediction: String,
    odds: Number,
  },
  homeDoubleChanceOdds: {
    id: String,
    homeTeam: String,
    awayTeam: String,
    prediction: String,
    odds: Number,
  },
  awayDoubleChanceOdds: {
    id: String,
    homeTeam: String,
    awayTeam: String,
    prediction: String,
    odds: Number,
  },
  drawDoubleChanceOdds: {
    id: String,
    homeTeam: String,
    awayTeam: String,
    prediction: String,
    odds: Number,
  },
  correctScoreProbabilities: {
    type: {},
  },
  totalGoalsPredictions: {
    type: {},
  },
  status: {
    type: String,
    default: "NOT STARTED",
  },
  league: {
    type: String,
    required: true,
  },
});

export const Match = model<IMatch>("Match", MatchSchema);
