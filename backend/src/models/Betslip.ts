import { Schema } from "mongoose";
import { IBetslip, gamePick } from "../types/IBetslip";

const Betslip = new Schema<IBetslip>({
  userID: {
    type: String,
    required: true,
  },
  picks: {
    type: [
      {
        gameID: String,
        gamePredictions: String,
      },
    ],
    required: true,
  },
});
