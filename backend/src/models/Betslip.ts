import { Schema, model } from "mongoose";
import { IBetslip, gamePick } from "../types/IBetslip";

const BetslipSchema = new Schema<IBetslip>({
  userID: {
    type: String,
    required: true,
  },
  games: {
    type: [
      {
        match_id: String,
        winner: String,
        odds: Number,
        processed: {
          type: Boolean,
          default: false,
        },
        won: {
          type: Boolean,
          default: false,
        },
      },
    ],
    required: true,
  },

  total_odds: {
    type: Number,
    required: true,
  },
  processing_completed: {
    type: Boolean,
    default: false,
  },
  won: {
    type: Boolean,
    default: false,
  },
});

export const Betslip = model<IBetslip>("Betslip", BetslipSchema);
