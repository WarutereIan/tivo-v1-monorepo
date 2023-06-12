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
    type: Number,
  },
  awayTeamOdds: {
    type: Number,
  },
  season: {
    type: Number,
  },
});

export const Match = model<IMatch>("Match", MatchSchema);
