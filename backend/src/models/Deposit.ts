import { Schema, model } from "mongoose";

const DepositSchema = new Schema<IDeposit>({
  referenceId: {
    type: String,
    //required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  processed: {
    type: Boolean,
    required: true,
    default: false,
  },
  processingStatus: {
    type: String,
    required: true,
  },
  depositedInWallet: {
    type: Boolean,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  paymentGateway: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
  },
});

export const Deposit = model<IDeposit>("Deposit", DepositSchema);
