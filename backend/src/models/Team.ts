import { Schema, model } from "mongoose";
import { ITeam } from "../types/ITeam";

const TeamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
  },
  played: {
    type: Number,
    required: true,
  },
  won: {
    type: Number,
    required: true,
  },
  drawn: {
    type: Number,
    required: true,
  },
  lost: {
    type: Number,
    required: true,
  },
  goal_difference: {
    type: Number,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  goals_conceded: {
    type: Number,
    required: true,
  },
  goals_conceded_away: {
    type: Number,
    required: true
  },
  goals_conceded_home: {
    type: Number,
    required: true
  },
  goals_scored: {
    type: Number,
    required: true,
  },
  goals_scored_away: {
    type: Number,
    required: true,
  },
  goals_scored_home: {
    type: Number,
    required: true,
  },
  home_attack_strength: {
    type: Number,
    required: true,
  },
  home_defense_strength: {
    type: Number,
    required: true,
  },
  away_attack_strength: {
    type: Number,
    required: true,
  },
  away_defense_strength: {
    type: Number,
    required: true,
  },
});

export const Team = model<ITeam>("Team", TeamSchema);
