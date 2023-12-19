import { Request, Response } from "express";
import { validationResult } from "express-validator/src/validation-result";
import { User } from "../models/User";
import { SSAction } from "../models/SSActions";
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

      if (!finished) {
        let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

        return res.json({
          balance: updatedWallet.currentBalance,
          game_id: game_id,
          transactions: txArr,
        });
      } else {
        let userWallet: null | any = await Wallet.findOne({
          ownerID: user_id,
        });

        if (!userWallet)
          throw new Error(
            `user wallet not found for user ${user_id} in game${game_id}`
          );

        const processActions = async (actions: any) => {
          for await (const _action of actions) {
            let action_type = _action.action;

            if (
              action_type == "bet" &&
              userWallet.currentBalance < _action.amount
            ) {
              console.log(
                `Insufficient funds in wallet for user ${user_id} in game ${game}`
              );

              res.json({
                code: 100,
                message: "Player has insufficient funds",
              });
            }

            switch (action_type) {
              case "bet": {
                let _bet_action = await SSAction.create({
                  user_id,
                  action_type,
                  ..._action,
                });

                userWallet.currentBalance -= _bet_action.amount;
                _bet_action.processed = true;
                let date = new Date();
                _bet_action.processed_at = { time: date.toISOString() };
                await userWallet.save();
                await _bet_action.save();
                txArr.push({
                  action_id: _bet_action.action_id,
                  tx_id: _bet_action._id,
                  processed_at: _bet_action.processed_at.time,
                });
                console.info(`processed bet action ${_action.action_id}`);

                break;
              }
              case "win": {
                let _win_action = await SSAction.create({
                  user_id,
                  action_type,
                  ..._action,
                });

                userWallet.currentBalance += _win_action.amount;
                _win_action.processed = true;
                let date = new Date();
                _win_action.processed_at = { time: date.toISOString() };
                await userWallet.save();
                await _win_action.save();
                txArr.push({
                  action_id: _win_action.action_id,
                  tx_id: _win_action._id,
                  processed_at: _win_action.processed_at.time,
                });
                console.info(`processed win action ${_action.action_id}`);

                break;
              }
              default: {
              }
            }
          }
        };

        /*  actions.forEach(async (_action: any) => {
        let action_type = _action.action;

        if (
          action_type == "bet" &&
          userWallet.currentBalance < _action.amount
        ) {
          console.log(
            `Insufficient funds in wallet for user ${user_id} in game ${game}`
          );

          return res.status(412).json({
            code: 100,
            message: "Player has insufficient funds",
          });
        }

        switch (action_type) {
          case "bet": {
            let _bet_action = await SSAction.create({
              user_id,
              action_type,
              ..._action,
            });

            userWallet.currentBalance -= _bet_action.amount;
            _bet_action.processed = true;
            let date = new Date();
            _bet_action.processed_at = { time: date.toISOString() };
            await userWallet.save();
            await _bet_action.save();
            txArr.push({
              action_id: _bet_action.action_id,
              tx_id: _bet_action._id,
              processed_at: _bet_action.processed_at.time,
            });
            console.info(`processed bet action ${_action.action_id}`);

            break;
          }
          case "win": {
            let _win_action = await SSAction.create({
              user_id,
              action_type,
              ..._action,
            });

            userWallet.currentBalance += _win_action.amount;
            _win_action.processed = true;
            let date = new Date();
            _win_action.processed_at = { time: date.toISOString() };
            await userWallet.save();
            await _win_action.save();
            txArr.push({
              action_id: _win_action.action_id,
              tx_id: _win_action._id,
              processed_at: _win_action.processed_at.time,
            });
            console.info(`processed win action ${_action.action_id}`);

            break;
          }
          default: {
          }
        }
      }); */

        processActions(actions).then();

        let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

        if (updatedWallet) {
          return res.json({
            balance: updatedWallet.currentBalance,
            game_id: game_id,
            transactions: txArr,
          });
        }
      }
    } catch (err) {
      console.error(err);

      return res.json({
        code: 500,
        message: err,
      });
    }
  }

  static async rollbackRequest(req: Request, res: Response) {
    const { user_id, currency, game, game_id, finished, actions } = req.body;

    console.log(req.body);

    try {
      let txArr: any = [];
      let userWallet: any = await Wallet.findOne({ ownerID: user_id });

      if (!finished) {
        let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

        return res.status(200).json({
          balance: updatedWallet.currentBalance,
          game_id: game_id,
          transactions: txArr,
        });
      }

      actions.forEach(async (_action: any) => {
        let original_action = await SSAction.findOne({
          action_id: _action.original_action_id,
        });

        if (!original_action) return;

        if (original_action.action_type == "bet") {
          userWallet.currentBalance += original_action.amount;

          original_action.rolled_back = true;
          original_action.rollback_action_id = _action.action_id;
          let date = new Date();
          original_action.rolled_back_at = { time: date.toISOString() };
          await userWallet.save();
          await original_action.save();
          txArr.push({
            action_id: original_action.action_id,
            tx_id: original_action._id,
            processed_at: original_action.processed_at,
          });
          console.info(
            `rolled back original action ${_action.original_action_id}`
          );
        }
        if (original_action.action_type == "win") {
          userWallet.currentBalance -= original_action.amount;

          original_action.rolled_back = true;
          original_action.rollback_action_id = _action.action_id;
          let date = new Date();
          original_action.rolled_back_at = { time: date.toISOString() };
          await userWallet.save();
          await original_action.save();
          txArr.push({
            action_id: original_action.action_id,
            tx_id: original_action._id,
            processed_at: original_action.processed_at,
          });
          console.info(
            `rolled back original action ${_action.original_action_id}`
          );
        }
      });

      let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

      return res.status(200).json({
        balance: updatedWallet.currentBalance,
        game_id: game_id,
        transactions: txArr,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: err,
      });
    }
  }

  static async issueFreespins() {}

  static async freespinsRequest(req: Request, res: Response) {
    const { issue_id, status, total_amount } = req.body;
  }

  static async roundDetailsRequest() {}

  static async accountIdentifierRequest() {}
}
