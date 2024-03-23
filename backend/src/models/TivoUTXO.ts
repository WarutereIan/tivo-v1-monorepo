import { model, Schema } from "mongoose";
import { ITivoUTXO } from "../types/ITivoUTXO";

const TivoUTXOSchema = new Schema<ITivoUTXO>({
  txid: { type: String, required: true },
  vout: { type: Number, required: true },
  status: {
    confirmed: { type: Boolean, required: true, default: false },
    block_height: { type: Number, required: true },
    block_hash: { type: String, required: true },
    block_time: { type: Number, required: true },
  },
  value: { type: Number, required: true },
  processed_to_user_wallet: { type: Boolean, required: true, default: false },
});

export const TivoUTXO = model<ITivoUTXO>("UserUTXO", TivoUTXOSchema);
