import https from "https";

import { validationResult } from "express-validator";
import { User } from "../../models/User";
import { config } from "../../config/config";
import { Request, Response } from "express";

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
  let { amount } = req.body;
  try {
    let _data = "";
    let data: any;
    let userDetails = await User.findById(user).select("email");

    const params = JSON.stringify({
      email: userDetails?.email,
      amount: JSON.stringify(amount * 100),
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `BEARER ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    };

    const reqPaystack = https
      .request(options, (resPaystack) => {
        resPaystack.on("data", (chunk) => {
          _data += chunk;
        });

        //TODO: add functionality to store the reference codes/ids, and then check these periodically to update status; cron jobs
          resPaystack.on("end", () => {
            let dataObj = JSON.parse(_data)
            let url = dataObj.data.authorization_url;
            let referenceId = dataObj.reference 
          return res.status(200).send(url);
        });
      })
      .on("error", (error) => {
        throw error;
      });

    reqPaystack.write(params);
    reqPaystack.end();

    //let url = data.data.authorization_url;
    //console.log(url);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};
