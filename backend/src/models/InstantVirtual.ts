import { Schema, model } from "mongoose";
import { IInstantVirtual } from "../types/IInstantVirtual";

const InstantVirtualSchema = new Schema<IInstantVirtual>({
  prediction: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  results: {
    homeTeamGoals: Number,
    awayTeamGoals: Number,
    totalGoals: Number,
    winner: String,
    draw: Boolean,
  },
  amountStaked: {
    type: Number,
    required: true,
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  won: {
    type: Boolean,
    required: true,
  },
  played: {
    type: Boolean,
    required: true,
  },
});

export const InstantVirtual = model<IInstantVirtual>(
  "InstantVirtual",
  InstantVirtualSchema
);
