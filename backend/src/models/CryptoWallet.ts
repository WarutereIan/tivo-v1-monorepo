import { Schema, model } from "mongoose";
import { ICryptoWallet } from "../types/ICryptoWallet";

const CryptoWalletSchema = new Schema<ICryptoWallet>({
  ownerID: {
    type: String,
    required: true,
  },
  public_key: {
    type: String,
    required: true,
  },
  private_key: {
    type: String,
    required: true,
  },

  mnemonic: {
    type: String,
    required: true,
  },
  wallet_address: {
    type: String,
    required: true,
  },
});

export const CryptoWallet = model("CryptoWallet", CryptoWalletSchema);
