import { Schema, model } from "mongoose";
import { ICryptoTokenBalances } from "../types/ICryptoTokenBalances";

const TokenBalanceSchema = new Schema<ICryptoTokenBalances>({
  ownerID: {
    type: String,
    required: true,
  },
  tokenAddress: {
    type: String,
    required: true,
  },
  tokenName: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  chain: {
    type: String,
    required: true,
  },
});

export const TokenBalance = model("TokenBalance", TokenBalanceSchema);
