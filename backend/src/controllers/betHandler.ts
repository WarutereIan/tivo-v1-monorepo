import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Betslip } from "../models/Betslip";
import { Match } from "../models/Match";
import { Wallet } from "../models/Wallet";

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

      //check match validity

      const checkValidity = async () => {
        return games.map(async (game: any) => {
          let match = await Match.findOne({ _id: game.match_id }).select(
            "status"
          );

          if (!match || match?.status != "NOT STARTED" || !match.status) {
            let errMsg = `match ${game.match_id} invalid with match status: ${match?.status}`;
            return errMsg;
          }
        });
      };
      /* games.forEach(async (game: any) => {
        let match = await Match.findOne({ _id: game.match_id }).select(
          "status"
        );
        console.log(match);

        if (!match || match?.status != "NOT STARTED" || !match.status) {
          return (matchStatusError = `match ${game.match_id} invalid with match status: ${match?.status}`);
        }
      }); */
      checkValidity().then(async (result) => {
        const error = await Promise.all(result);

        const errors: any = [];

        error.forEach((err) => {
          if (err) errors.push(err);
        });

        if (errors.length != 0) {
          return res.status(500).json({
            success: false,
            msg: error,
          });
        }

        let wallet = await Wallet.findOne({ ownerID: userID });
        if (wallet) {
          wallet.currentBalance -= amount_staked;
          await wallet.save();
        } else {
          return res.status(500).json({
            success: false,
            msg: "Could not update wallet. Try again shortly",
          });
        }
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
      });

      //will add guard to check whether game has been played before being bet on ----- DONE
      //add fubctionality to subtract from user wallet ---- DONE
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
}
