import { Schema, model } from "mongoose";
import { ITeam_s_Matches } from "../types/ITeamMatches";

const Teams_MatchesSchema = new Schema<ITeam_s_Matches>({
    teamName:{
        type: String,
        required: true
    },
    listOfMatches:{
        type: [String],
        required: true
    }
})

export const TeamsMatches = model<ITeam_s_Matches>('TeamsMatches',Teams_MatchesSchema)