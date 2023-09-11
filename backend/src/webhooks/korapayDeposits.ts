import { Request, Response } from "express";
import { Deposit } from "../models/Deposit";
import { Wallet } from "../models/Wallet";
import { config } from "../config/config";
import crypto from "crypto";

export const processKoraResponse = async (req: Request, res: Response) => {
  //add check to verify that request is from korapay

  //have cronjobs to query deposit claims too

  const koraSecret = config.KORA_SECRET;

  //verify source of request
  const hash = crypto
    .createHmac("sha256", koraSecret)
    .update(JSON.stringify(req.body.data))
    .digest("hex");

  if (hash === req.headers["x-korapay-signature"]) {
    let response = req.body;
    try {
      let responseEvent = response.event;

      let responseStatus = response.data.status;

      switch (responseEvent) {
        case "charge.success": {
          if (responseStatus == "success") {
            const referenceId = response.data.reference;

            let deposit = await Deposit.findOne({ referenceId: referenceId });

            if (deposit) {
              let userWallet = await Wallet.findOne({
                ownerID: deposit.userId,
              });

              if (userWallet) {
                userWallet.currentBalance += response.data.amount;
                await userWallet.save();
                console.info(
                  `updated user wallet {${userWallet.ownerID}} with amount{${response.data.amount}}, tx reference {${referenceId}}`
                );
              }

              deposit.processed = true;
              deposit.processingStatus = "Completed";
              deposit.depositedInWallet = true;

              await deposit.save();
            }
          }

          break;
        }
        case "charge.failed": {
          const referenceId = response.data.reference;

          let deposit = await Deposit.findOne({ referenceId: referenceId });
          if (deposit) {
            deposit.processed = true;
            deposit.processingStatus = "Failed";
            deposit.depositedInWallet = false;
            deposit.msg = "Deposit transaction failed";

            await deposit.save();
          }

          break;
        }

        default: {
          break;
        }
      }

      return res.status(200);
    } catch (err) {
      console.error(err);
      return res.status(200);
    }
  } else {
    console.error("received deposit request from invalid source");
  }
};
