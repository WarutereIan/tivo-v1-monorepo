import { Request, Response } from "express";
import { validationResult } from "express-validator/src/validation-result";
import { User } from "../models/User";
import { SSAction } from "../models/SSActions";
import { Wallet } from "../models/Wallet";
import { SSWin } from "../models/SSWin";
import { Publisher } from "../config/rabbitmq/publishers";

//TODO: set number of decimal places dependent on the type of currency the user selects
//TODO: will need function to close game session
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

export const GCP_play = async (req: Request, res: Response) => {
  {
    //will need to push these to a queue for later processing with workers
    const { user_id, currency, game, game_id, finished, actions } = req.body;

    console.log(req.body);

    try {
      //let user = await User.findOne({ _id: user_id });

      let decimal_places = 2;

      let txArr: any = [];

      if (!actions || (!finished && !actions)) {
        let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

        console.log(
          "Check balance request from sswiss-play,balance:",
          Math.round(updatedWallet.currentBalance * 100) / 100
        );

        return res.send({
          balance: Math.round(updatedWallet.currentBalance * 100),
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

        console.log(actions);

        const processActions = async (actions: any) => {
          let headersSet = false;

          for (let i = 0; i < actions.length; i++) {
            let _action = actions[i];

            let action_type = _action.action;
            console.log(action_type);

            let userWallet: null | any = await Wallet.findOne({
              ownerID: user_id,
            });

            if (
              action_type == "bet" &&
              userWallet.currentBalance < _action.amount / 100
            ) {
              console.log(
                `Insufficient funds in wallet for user ${user_id} in game ${game}`
              );

              headersSet = true;

              res.json({
                code: 100,
                message: "Player has insufficient funds",
              });

              break;
            } else {
              if (action_type == "bet") {
                /*  let _bet_action = await SSAction.create({
                  user_id,
                  action_type,
                  ..._action,
                });

                userWallet.currentBalance = userWallet.currentBalance - _bet_action.amount/100;
                _bet_action.processed = true;
                let _date = new Date();
                _bet_action.processed_at = { time: _date.toISOString() };
                await userWallet.save(); */
                await Publisher.send(
                  {
                    exchange: "sswissBetActions",
                    routingKey: "sswissBetActions",
                  },
                  { user_id: user_id, action: _action }
                );

                let _date = new Date();
                let processed_at = _date.toISOString();

                txArr.push({
                  action_id: _action.action_id,
                  //tx_id: _bet_action._id,
                  processed_at: processed_at,
                });
                /* await _bet_action.save();
                  console.info(`processed bet action ${_action.action_id}
                        

                  `); */
              } else {
                /* let _win_action = await SSAction.create({
                  user_id,
                  action_type,
                  ..._action,
                });

                userWallet.currentBalance += _win_action.amount/(100);
                _win_action.processed = true;
                let date = new Date();
                _win_action.processed_at = { time: date.toISOString() };
                await userWallet.save(); */

                await Publisher.send(
                  {
                    exchange: "sswissWinActions",
                    routingKey: "sswissWinActions",
                  },
                  { user_id: user_id, action: _action }
                );

                let _date = new Date();
                let processed_at = _date.toISOString();

                txArr.push({
                  action_id: _action.action_id,
                  //tx_id: _win_action._id,
                  processed_at: processed_at,
                });

                /* await _win_action.save();
                  console.info(`processed win action ${_action.action_id}
                    
                  `); */
              }
            }
          }

          if (!headersSet) {
            let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

            if (updatedWallet) {
              return res.json({
                balance: Math.round(updatedWallet.currentBalance * 100),
                game_id: game_id,
                transactions: txArr,
              });
            }
          }
        };

        await processActions(actions);
      }
    } catch (err) {
      console.error(err);

      return res.json({
        code: 500,
        message: err,
      });
    }
  }
};

export const GCP_rollback = async (req: Request, res: Response) => {
  {
    const { user_id, currency, game, game_id, finished, actions } = req.body;

    console.log(req.body);

    try {
      let decimal_places = 2;
      let txArr: any = [];
      //let userWallet: any = await Wallet.findOne({ ownerID: user_id });

      if (!finished) {
        let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

        return res.json({
          balance: Math.round(updatedWallet.currentBalance * 100),
          game_id: game_id,
          transactions: txArr,
        });
      } else {
        for await (const _action of actions) {
          let original_action = await SSAction.findOne({
            action_id: _action.original_action_id,
          });

          if (original_action && original_action.rolled_back) {
            console.log(
              "received already processed rollback request fro action",
              original_action.action_id
            );

            txArr.push({
              action_id: original_action.action_id,
              tx_id: "",
              processed_at: original_action.processed_at,
            });
          } else if (original_action && !original_action.rolled_back) {
            let userWallet = await Wallet.findOne({ ownerID: user_id });

            if (userWallet && original_action.action_type == "bet") {
              userWallet.currentBalance += original_action.amount / 100;

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
                `rolled back original bet action ${_action.original_action_id}`
              );
            } else if (userWallet && original_action.action_type == "win") {
              userWallet.currentBalance -= original_action.amount / 100;

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
                `rolled back original win action ${_action.original_action_id}`
              );
            }
            //should have provision for rollbacks whose original actions haven't been sent yet
          } else {
            console.log(
              `original action ${_action.original_action_id} not found`
            );

            let date = new Date();
            let rolled_back_at = date.toISOString();

            txArr.push({
              action_id: _action.action_id,
              tx_id: "",
              processed_at: rolled_back_at,
            });
          }
        }

        let updatedWallet: any = await Wallet.findOne({ ownerID: user_id });

        return res.json({
          balance: Math.round(updatedWallet.currentBalance * 100),
          game_id: game_id,
          transactions: txArr,
        });
      }
    } catch (err) {
      console.error(err);
      return res.json({
        code: 500,
        message: err,
      });
    }
  }
};
