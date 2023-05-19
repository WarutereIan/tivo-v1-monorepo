import { Schema, model } from "mongoose";
import { IGameweek } from "../types/IGameweek";

const GameWeekSchema = new Schema<IGameweek>({
    gameweek_number: {
        type: Number, 
        required: true
    },
    listOfMatches: [
        {
            type: String,
            required: true
        }
    ]

})

export const GameWeek = model<IGameweek>('GameWeek',GameWeekSchema)