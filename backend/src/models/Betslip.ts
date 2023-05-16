import { Schema } from "mongoose";
import { IBetslip } from "../types/IBetslip";

const Betslip = new Schema<IBetslip>({
    userID: {
        type: String,
        required: true
    },
    picks: []
})