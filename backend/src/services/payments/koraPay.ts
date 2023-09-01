import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../config/config";
import { Request, Response, response } from "express";
import { RedisClient } from "../../config/db";
import { Deposit } from "../../models/Deposit";

export const useKoraPay = async (
  req: Request,
  res: Response,
  email: string,
  username: string,
  amount: number,
  userid: string
) => {
  try {
    const koraSecret = config.KORA_SECRET;

    console.log(koraSecret);

    const uuid = uuidv4();

    //store uuid in redis for now, to be processed after webhook received
    //key: uuid, value: userid/username: uuid reference number indicates user that initiated tx

    await RedisClient.set(uuid, userid); //store in actual db, mongo

    const _data = {
      amount: amount,
      redirect_url: config.KORA_REDIRECT_URL, //will need to change to tivobet's
      currency: "NGN",
      reference: uuid,
      channels: ["card", "bank_transfer", "mobile_money"],
      notification_url: config.KORA_NOTIFICATION_URL, //endpoint for korapay notifications
      narration: "Top up your tivobet wallet",
      customer: {
        email: email,
        name: username,
      },
    };

    const request = {
      method: "post",
      maxBodyLength: Infinity,
      url: config.KORA_INITIALIZE_CHARGE_URL,
      data: _data,
      headers: {
        Authorization: `Bearer ${koraSecret}`,
        // "Content-Type": "application/json",
      },
    };

    const result = await axios(request);

    const deposited = await Deposit.create({
      referenceId: uuid,
      userId: userid,
      amount: amount,
      processed: false,
      processingStatus: "Pending",
      depositedInWallet: false,
      time: new Date().toDateString(),
      paymentGateway: "korapay",
    });

    console.info(`Deposit log created for referenceId: {${uuid}}`);

    const reference = result.data.data.reference;

    console.log(result.data.data.checkout_url);

    return res
      .status(200)
      .json({ success: true, msg: result.data.data.checkout_url });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Could not process payment" });
  }
};
