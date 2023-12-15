import { Request, Response } from "express";
import { validationResult } from "express-validator/src/validation-result";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { config } from "../config/config";
import { signRequest } from "../utils/softswiss/reqVerification";
import axios from "axios";

/*
player requests to the softswiss games
*/
export class WALLET_TO_GCP_REQUESTS {
  static async createSessionRequest(req: Request, res: Response) {
    let { game, currency, locale, client_type } = req.body;

    let userId = req.user.id;

    try {
      let user = await User.findById(userId);

      let userWallet = await Wallet.findOne({ ownerID: userId });

      if (user && userWallet) {
        let userBalance = userWallet.currentBalance;
        let casino_id = config.SOFTSWISS.CASINO_ID;

        let userIPaddress =
          req.header("x-forwarded-for") || req.socket.remoteAddress;

        console.log(
          `User ip address for createSessionRequest: ${userIPaddress}`
        );

        let urls = {
          //URL user will be redirected to after playing session is finished
          return_url: config.SOFTSWISS.USER_RETURN_URL,
          //URL user will be redirected in order to deposit
          deposit_url: config.SOFTSWISS.USER_DEPOSIT_URL,
        };

        let userObj = {
          id: user._id.toString(),
          email: user.email,
          firstname: user.first_name,
          lastname: user.last_name,
          nickname: user.username,
          city: user.city,
          date_of_birth: user.date_of_birth,
          registered_at: user.registered_at,
          gender: user.gender,
          country: user.country,
        };

        let requestObj = {
          casino_id: casino_id,
          game: game,
          currency: currency,
          locale: locale,
          ip: userIPaddress,
          client_type: client_type,
          balance: userBalance,
          urls: urls,
          user: userObj,
        };

        let requestSignature = signRequest(requestObj);

        let axiosConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${config.SOFTSWISS.BACKEND_URL}/sessions`,
          headers: {
            "X-REQUEST-SIGN": requestSignature,
          },
          data: requestObj,
        };

        const response = await axios(axiosConfig);

        let data = response.data;

        console.info(`user ${userId} started game ${game} `);

        return res.status(200).json({ success: true, data });
      }
    } catch (err: any) {
      console.error(err.response.data);
      return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }
  }

  static async startDemoRequest(req: Request, res: Response) {
    const { game, locale, client_type } = req.body;

    let casino_id = config.SOFTSWISS.CASINO_ID;

    try {
      let userIPaddress =
        req.header("x-forwarded-for") || req.socket.remoteAddress;

      console.log(`User ip address for demo: ${userIPaddress}`);

      let urls = {
        //URL user will be redirected to after playing session is finished
        return_url: "www.google.com", //config.SOFTSWISS.USER_RETURN_URL,
        //URL user will be redirected in order to deposit
        //deposit_url: config.SOFTSWISS.USER_DEPOSIT_URL,
      };

      let requestObj = {
        casino_id: casino_id,
        game: game,
        locale: locale,
        ip: userIPaddress,
        client_type: client_type,
        urls: urls,
      };

      let requestSignature = signRequest(requestObj);

      let axiosConfig = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${config.SOFTSWISS.BACKEND_URL}/demo`,
        headers: {
          "X-REQUEST-SIGN": requestSignature,
        },
        data: requestObj,
      };

      const response = await axios(axiosConfig);

      let data = response.data;

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }
  }
}
