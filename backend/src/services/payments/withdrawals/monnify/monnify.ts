import { Request, Response } from "express";
import { Withdrawal } from "../../../../models/Withdrawal";
import { Publisher } from "../../../../config/rabbitmq/publishers";
import { config } from "../../../../config/config";

export const useMonnify = async (
  req: Request,
  res: Response,
  email: string,
  username: string,
  amount: number,
  userid: string,
  bankdetails: any
) => {
  try {
    const withdrawal = await Withdrawal.create({
      paymentGateway: "monnify",
      userId: userid,
      amount: amount,
      processed: false,
      processingStatus: "requested",
      paidOut: false,
      time: new Date().toDateString(),
    });

    const reference = withdrawal.id;

    const destinationBankCode = bankdetails.bank_code;
    const destinationAccountNumber = bankdetails.account_number;

    

    const monnifyWithdrawalData = {
      amount: amount,
      reference: reference,
      narration: "Tivobet withdrawal",
      destinationBankCode: destinationBankCode, //should be provided in request
      destinationAccountNumber: destinationAccountNumber,
      currency: "NGN",
      sourceAccountNumber: config.MONNIFY.MONNIFY_WALLET_ACCOUNT_NUMBER,
    };

    //add withdrawal request to queue for monnify withdrawals
    await Publisher.send(
      {
        exchange: "withdrawalRequests",
        routingKey: "withdrawals.monnify",
      },
      monnifyWithdrawalData
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
