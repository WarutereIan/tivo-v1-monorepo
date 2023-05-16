import { Schema, model } from "mongoose";
import { IWallet } from "../types/IWallet";

const WalletSchema = new Schema<IWallet>({
    ownerID: {
        type: String,
    },
    currentBalance:{
        type: Number,
        required: true
    }
})

export const Wallet = model<IWallet>('Wallet',WalletSchema)