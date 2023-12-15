import { Request, Response } from "express";
import { validationResult } from "express-validator/src/validation-result";
import { User } from "../models/User";
import { SSBet } from "../models/SSBets";
import { Wallet } from "../models/Wallet";
import { SSWin } from "../models/SSWin";

//

export const processSwissResult = async (req: Request, res: Response) => {
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
    console.log(req.body);

    return res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

/**
 * This class contains functions that handle requests from the Game Content Provider to
 * the casino/wallet(us, tivobet)
 */
export class GCP_TO_WALLET_REQUESTS {
  //also handles the balance request from the gcp
  static async play(req: Request, res: Response) {
    //will need to push these to a queue for later processing with workers
    const { user_id, currency, game, game_id, finished, actions } = req.body;

    console.log(req.body);

    try {
      //let user = await User.findOne({ _id: user_id });

      let txArr: any = [];
      let userWallet = await Wallet.findOne({ ownerID: user_id });

      if (finished) {
        actions.forEach(async (_action: any) => {
          
          if (_action.action == "bet") {
            let _bet_action = await SSBet.create({ user_id, ..._action });

            if (userWallet) {
              if (userWallet.currentBalance < _bet_action.amount)
                throw new Error("Insufficient funds in wallet");
              //return res.status(412).json({});
              userWallet.currentBalance -= _bet_action.amount;
              _bet_action.processed = true;
              let date = new Date();
              _bet_action.processed_at = { time: date.toISOString() };
              (await userWallet.save()) && (await _bet_action.save());
              txArr.push({
                action_id: _bet_action.action_id,
                tx_id: _bet_action._id,
                processed_at: _bet_action.processed_at.time,
              });
              console.info(`processed action ${_action.action_id}`);
            } else
              throw new Error(
                `user wallet not found for user ${user_id} in game${game_id}`
              );
          } else if (_action.action == "win") {
            let _win_action = await SSWin.create({ user_id, ..._action });

            if (userWallet) {
              userWallet.currentBalance += _win_action.amount;
              _win_action.processed = true;
              let date = new Date();
              _win_action.processed_at = { time: date.toISOString() };
              (await userWallet.save()) && (await _win_action.save());
              txArr.push({
                action_id: _win_action.action_id,
                tx_id: _win_action._id,
                processed_at: _win_action.processed_at.time,
              });
              console.info(`processed action ${_action.action_id}`);
            } else
              throw new Error(
                `user wallet not found for user ${user_id} in game${game_id}`
              );
          }
        });
      }

      let updatedWallet = await Wallet.findOne({ ownerID: user_id });

      if (updatedWallet) {
        return res.status(200).json({
          balance: updatedWallet.currentBalance,
          game_id: game_id,
          transactions: txArr,
        });
      }
    } catch (err) {
      console.error(err);
      if (err == "Insufficient funds in wallet") return res.status(412).end();

      return res.status(500).end();
    }
  }

  static async rollbackRequest(req: Request, res: Response) {
    const { user_id, currency, game, game_id, finished, actions } = req.body;

    console.log(req.body);

    try {
      let txArr: any = [];
      let userWallet = await Wallet.findOne({ ownerID: user_id });

      if (finished) {
        actions.forEach(async (_action: any) => {
          if (_action.action == "bet") {
            let _bet_action = await SSBet.findOne({
              action_id: _action.original_action_id,
            });

            if (userWallet && _bet_action) {
              /* if (userWallet.currentBalance < _bet_action.amount)
                return res.status(412); */
              userWallet.currentBalance += _bet_action.amount;
              //_bet_action.processed = true;
              _bet_action.rolled_back = true;
              _bet_action.rollback_action_id = _action.action_id;
              let date = new Date();
              _bet_action.rolled_back_at = { time: date.toISOString() };
              (await userWallet.save()) && (await _bet_action.save());
              txArr.push({
                action_id: _bet_action.action_id,
                tx_id: _bet_action._id,
                processed_at: _bet_action.processed_at,
              });
              console.info(`processed action ${_action.action_id}`);
            } else
              throw new Error(
                `user wallet not found for user ${user_id} in game${game_id}`
              );
          } else if (_action.action == "win") {
            let _win_action = await SSWin.findOne({
              action_id: _action.original_action_id,
            });

            if (userWallet && _win_action) {
              userWallet.currentBalance -= _win_action.amount;
              _win_action.processed = true;
              _win_action.rolled_back = true;
              _win_action.rollback_action_id = _action.action_id;

              let date = new Date();
              _win_action.rolled_back_at = { time: date.toISOString() };
              (await userWallet.save()) && (await _win_action.save());
              txArr.push({
                action_id: _win_action.action_id,
                tx_id: _win_action._id,
                processed_at: _win_action.processed_at.time,
              });
              console.info(`processed action ${_action.action_id}`);
            } else
              throw new Error(
                `user wallet not found for user ${user_id} in game${game_id}`
              );
          }
        });
      }

      let updatedWallet = await Wallet.findOne({ ownerID: user_id });

      if (updatedWallet) {
        return res.status(200).json({
          balance: updatedWallet.currentBalance,
          game_id: game_id,
          transactions: txArr,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  static async issueFreespins() {}

  static async freespinsRequest(req: Request, res: Response) {
    const { issue_id, status, total_amount } = req.body;
  }

  static async roundDetailsRequest() {}

  static async accountIdentifierRequest() {}
}
