import { Schema, model } from "mongoose";
import { IRoundCounter } from "../types/IRoundCounter";

const RoundCounterSchema = new Schema<IRoundCounter>({
  currentRound: Number,
  league: String,
});

export const RoundCounter = model<IRoundCounter>(
  "RoundCounter",
  RoundCounterSchema
);
