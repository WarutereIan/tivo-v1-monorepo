import { Schema, model } from "mongoose";
import { IRoundCounter } from "../types/IRoundCounter";

const RoundCounterSchema = new Schema<IRoundCounter>({
  currentRound: Number,
});

export const RoundCounter = model<IRoundCounter>(
  "RoundCounter",
  RoundCounterSchema
);
