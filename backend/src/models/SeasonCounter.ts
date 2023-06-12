import { Schema, model } from "mongoose";
import { ISeason } from "../types/ISeason";

const SeasonSchema = new Schema<ISeason>({
  currentSeasonNumber: {
    type: Number,
    required: true,
  },
});

export const SeasonCounter = model<ISeason>("SeasonCounter", SeasonSchema);
