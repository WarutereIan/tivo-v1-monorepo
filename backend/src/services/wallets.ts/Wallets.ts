//pay users from winning betslips: in virtual wallets. These transactions from wins will be stored: betslipId: id, won: xxx. transactions will be a separate independent db
// add real world payments to queue. So user wallet will have a transactions store,
//each tx will have a status of either paid out or pending. These will be only when user chooses to withdraw using their preferred means

import { Request, Response } from "express";
import { Betslip } from "../../models/Betslip";
import { Wallet } from "../../models/Wallet";
import { validationResult } from "express-validator";

export class Wallets {
  static payBetslips = async () => {
    try {
      for await (const betslip of Betslip.find({
        processing_completed: true,
        won: true,
        paid_out: false,
      }).select("potential_winnings userID paid_out")) {
        let userWallet = await Wallet.findOne({ ownerID: betslip.userID });

        if (userWallet) {
          userWallet.currentBalance += betslip.potential_winnings;
          //add function to give user notification of wallet updated?

          betslip.paid_out = true;

          await betslip.save();
          await userWallet.save();

          console.log(
            "betslip ",
            betslip.id,
            "paid out to wallet ",
            userWallet,
            "for amount",
            betslip.potential_winnings
          );
        } else {
          console.log("Could not fetch userwallet for user id", betslip.userID);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  static getBalance = async (req: Request, res: Response) => {
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

    try {
      let user = req.user.id;

      const wallet = await Wallet.findOne({ ownerID: user });
      const balance = wallet?.currentBalance;

      return res.status(200).json({ success: true, balance });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        msg: "Internal server error. Could not fetch wallet balance",
      });
    }
  };
}
