import { Schema, model } from "mongoose";
import { IUser } from "../types/IUser";
import { Password } from "../helpers/password";

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  reset_code: {
    type: String,
  },
  city: {
    type: String,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  email_otp: {
    type: String,
  },
  wallet: {
    type: String, //wallet id for the user
  },
  betslips: [], //array of betslip ids
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: String,
    required: true,
  },
  registered_at: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

//hooks
UserSchema.pre("save", async function (done) {
  //encrypt password
  if (this.isModified("password")) {
    const hashed = await Password.Hash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

export const User = model<IUser>("User", UserSchema);
