import { Request, Response } from "express";
import { config } from "../config/config";
import crypto from "crypto";
import { Publisher } from "../config/rabbitmq/publishers";

export const monnifyWithdrawlsWebhook = async (req: Request, res: Response) => {
  const monnifySecretKey = config.MONNIFY.MONNIFY_SECRET_KEY;

  //send success response to monnify server b4 processing

  console.log(req.body);

  const hash = crypto
    .createHmac("sha512", monnifySecretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  res.status(200);

  if (hash === req.headers["monnify-signature"]) {
    //add to queue for processing if signature matches that of monnify
    await Publisher.send(
      {
        exchange: "monnifyWithdrawalsResponses",
        routingKey: "monnifyWithdrawalsResponses",
      },
      req.body
    );
  }

  return;
};
