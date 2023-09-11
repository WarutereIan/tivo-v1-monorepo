//client calls this hook, withrawal request is added to queue

import { Request, Response } from "express";
import { config } from "../../../../config/config";
import { Withdrawal } from "../../../../models/Withdrawal";
import { Publisher } from "../../../../config/rabbitmq/publishers";

//this module is the pub; uses the
export const useKoraPay = async (
  req: Request,
  res: Response,
  email: string,
  username: string,
  amount: number,
  userid: string,
  bankdetails: {}
  //bank_account: {"bank_code": "044", "account_number": 0000000}
) => {
  try {
    const koraSecret = config.KORA_SECRET;

    //create korapay withrawal doc, push doc & details to respective queue to await batch processing

    //document id is going to be the reference in the korapay bulk withdrawal post
    const withdrawal = await Withdrawal.create({
      paymentGateway: "korapay",
      userId: userid,
      amount: amount,
      processed: false,
      processingStatus: "requested",
      paidOut: false,
      time: new Date().toDateString(),
    });

    const koraWithdrawalData = {
      reference: withdrawal.id,
      amount: amount,
      type: "bank_account",
      narration: "Withdrawal from tivobet",
      bank_account: bankdetails,
      customer: {
        name: username,
        email: email,
      },
    };

    //add withdrawal request to queue
    //bank_account: {"bank_code": "044", "account_number": 0000000000}
    await Publisher.send(
      {
        exchange: "withdrawalRequests",
        routingKey: "withdrawals.korapay",
      },
      koraWithdrawalData
    );

    return res
      .status(200)
      .json({ success: true, msg: "Successfully initiated withdrawal" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
