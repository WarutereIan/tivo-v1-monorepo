import { model, Schema } from "mongoose";
import { IBTCWallet } from "../types/IBTCWallet";

const BTCWalletSchema = new Schema<IBTCWallet>({
  userID: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true },
  available_balance: { type: Number, required: true, default: 0 },
  script: { type: String, required: true },
  unconfirmed_deposit: { type: Number, required: true, default: 0 },
  dust_amount: { type: Number, required: true, default: 0 },
  privateKey2: { type: String, required: false, unique: true },
  publicKey2: { type: String, required: false },
  walletAddress2: { type: String, required: false, unique: true },
  script2: { type: String, required: false },
});

export const BTCWallet = model<IBTCWallet>("BTCWallet", BTCWalletSchema);
