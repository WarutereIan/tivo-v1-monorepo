import { model, Schema } from "mongoose";
import { WebSocketSubject } from "rxjs/webSocket";
import { IUserUTXO } from "../types/IUserUTXO";

const UserUTXOSchema = new Schema<IUserUTXO>({
  txid: {
    type: String,
    required: true,
  },
  vout: {
    type: Number,
    required: true,
  },
  status: {
    confirmed: { type: Boolean, required: true, default: false },
    block_height: { type: Number, required: true },
    block_hash: { type: String, required: true },
    block_time: { type: Number, required: true },
  },
  value: { type: Number, required: true },
  userId: { type: String, required: true },
  processed_to_user_wallet: { type: Boolean, required: true, default: false },
});

export const UserUTXO = model<IUserUTXO>("UserUTXO", UserUTXOSchema);
