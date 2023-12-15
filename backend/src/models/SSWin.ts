import { Schema, model } from "mongoose";
import { ISSWins } from "../types/ISSWins";

const SSWinsSchema = new Schema<ISSWins>({
  action_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  jackpot_contribution: {
    type: Number,
  },
  processed: {
    type: Boolean,
    required: true,
    default: false,
  },
  user_id: {
    type: String,
    required: true,
  },
  processed_at: {},
  rollback_action_id: {
    type: String,
  },
  rolled_back: {
    type: Boolean,
    default: false,
  },
  rolled_back_at: {},
});

export const SSWin = model<ISSWins>("SSWin", SSWinsSchema);
