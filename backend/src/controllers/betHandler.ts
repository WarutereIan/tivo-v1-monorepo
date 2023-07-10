import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Betslip } from "../models/Betslip";

export class Football {
  /**
   * params:
   * @matchId
   * @pick : home, away, win. Double chance also available
   */
  static async createBetslip(req: Request, res: Response) {
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
      const userID = req.user?.id;
      const { games, total_odds, amount_staked, potential_winnings } = req.body;

      //will add guard to check whether game has been played before being bet on
      //add fubctionality to subtract from user wallet
      //add functionality to calculate odds from match db

      const _betslip = await Betslip.create({
        userID,
        games,
        total_odds,
        amount_staked,
        potential_winnings,
      });

      const betslip = await Betslip.findById(_betslip.id);

      return res.status(200).json({ success: true, betslip });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
}
