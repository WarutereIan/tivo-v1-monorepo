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
});

export const Team = model<ITeam>("Team", TeamSchema);
