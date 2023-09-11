import { Schema, model } from "mongoose";

const WithdrawalSchema = new Schema<IWithdrawal>({
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
  paidOut: {
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

export const Withdrawal = model<IWithdrawal>("Withdrawals", WithdrawalSchema);
