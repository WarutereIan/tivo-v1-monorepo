import { Request, Response } from "express";
import { config } from "../config/config";
import crypto from "crypto";
import { Publisher } from "../config/rabbitmq/publishers";

export const monnifyDepoWebhook = async (req: Request, res: Response) => {
  const monnifySecretKey = config.MONNIFY.MONNIFY_SECRET_KEY;

  //send success response to monnify server b4 processing
  res.status(200);

  const hash = crypto
    .createHmac("sha512", monnifySecretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash === req.headers["monnify-signature"]) {
    //add to queue for processing if signature matches that of monnify
    await Publisher.send(
      {
        exchange: "monnifyDepositsResponses",
        routingKey: "monnifyDepositsResponses",
      },
      req.body
    );
  }

  return;
};
