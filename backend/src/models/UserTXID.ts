import { model, Schema } from "mongoose";
import { IUserTXIDs } from "../types/IUserTXIDs";

const UserTXIDSchema = new Schema<IUserTXIDs>({
  txid: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  confirmed: { type: Boolean, required: true, default: false },
  deposited_to_user_wallet: { type: Boolean, required: true, default: false },
});

export const UserTXID = model<IUserTXIDs>("UserTXID", UserTXIDSchema);
