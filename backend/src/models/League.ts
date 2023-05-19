import { Schema, model } from "mongoose";
import { ILeague } from "../types/ILeague";

const LeagueSchema = new Schema<ILeague>({
    leagueName:{
        type: String,
        required: true
    },
    listOfTeams:[
        {
            type: String,
            required: true
        }
    ]
})

export const League = model<ILeague>('League',LeagueSchema)