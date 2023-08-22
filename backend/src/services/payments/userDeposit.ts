import https from "https";

import { validationResult } from "express-validator";
import { User } from "../../models/User";
import { config } from "../../config/config";
import { Request, Response } from "express";
import { usePaystack } from "./paystack";
import { useKoraPay } from "./koraPay";

const paystackSecret = config.PAYSTACK_SECRET;

export const deposit = async (req: Request, res: Response) => {
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
  let { amount, paymentGateway } = req.body;
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
      throw new Error(`could not fetch user email @deposit: userid${user}`);

    switch (paymentGateway) {
      case "paystack": {
        await usePaystack(amount, email);
        break;
      }
      case "korapay": {
        await useKoraPay(req, res, email, username, amount, user);
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
