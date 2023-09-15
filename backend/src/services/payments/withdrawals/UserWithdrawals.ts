import https from "https";

import { validationResult } from "express-validator";
import { User } from "../../../models/User";
import { config } from "../../../config/config";
import { Request, Response } from "express";
import { Wallet } from "../../../models/Wallet";
import { useKoraPay } from "./korapay/korapay";
import { useMonnify } from "./monnify/monnify";

const paystackSecret = config.PAYSTACK_SECRET;

export const withdraw = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  }

  let user = req.user?.id;
  let { amount, paymentGateway, bankdetails } = req.body;
  try {
    let _data = "";
    let email = "";
    let username = "";
    let data: any;
    let userDetails = await User.findById(user).select("username  email");

    if (userDetails) {
      email = userDetails.email;
      username = userDetails.username;
    } else
      throw new Error(`could not fetch user email @withdrawal: userid${user}`);

    //add check for balance confirmation
    const wallet = await Wallet.findOne({ ownerID: user }).select(
      "currentBalance"
    );

    if (wallet && wallet.currentBalance < amount) {
      return res.status(400).json({
        success: false,
        msg: "Insufficient wallet balance for stated withdrawal",
      });
    }

    switch (paymentGateway) {
      case "paystack": {
        //await usePaystack(amount, email);
        break;
      }
      case "korapay": {
        await useKoraPay(req, res, email, username, amount, user, bankdetails);
        break;
      }

      case "monnify": {
        await useMonnify(req, res, email, username, amount, user, bankdetails);
        break;
      }

      case "": {
        return res
          .status(200)
          .json({ success: false, msg: "Payment gateway not provided" });
        break;
      }

      default: {
        return res
          .status(200)
          .json({ success: false, msg: "Invalid payment gateway" });
        break;
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};
